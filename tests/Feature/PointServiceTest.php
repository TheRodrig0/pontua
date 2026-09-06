<?php

namespace Tests\Feature;

use App\Enums\PointBucketStatus;
use App\Enums\PointTransactionSource;
use App\Enums\PointTransactionType;
use App\Models\PointBucket;
use App\Models\PointTransaction;
use App\Models\User;
use App\Services\PointService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class PointServiceTest extends TestCase
{
    use RefreshDatabase;

    private PointService $pointService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->pointService = new PointService();
    }

    public function test_can_credit_points_to_user(): void
    {
        $user = User::factory()->create();

        $this->pointService->credit(
            userId: $user->id,
            amount: 100,
            reference: null,
            source: PointTransactionSource::INVOICE_SUBMISSION
        );

        $this->assertDatabaseHas('point_buckets', [
            'user_id' => $user->id,
            'initial_points' => 100,
            'remaining_points' => 100,
            'status' => PointBucketStatus::ACTIVE->value,
        ]);

        $this->assertDatabaseHas('point_transactions', [
            'user_id' => $user->id,
            'amount' => 100,
            'type' => PointTransactionType::CREDIT->value,
            'source' => PointTransactionSource::INVOICE_SUBMISSION->value,
            'balance_after' => 100,
        ]);
    }

    public function test_credit_respects_expiration_months_config(): void
    {
        config(['points.expiration_months' => 3]);

        $user = User::factory()->create();

        $this->pointService->credit(
            userId: $user->id,
            amount: 100,
            reference: null,
            source: PointTransactionSource::INVOICE_SUBMISSION
        );

        $bucket = PointBucket::where('user_id', $user->id)->first();
        $this->assertEquals(now()->addMonths(3)->format('Y-m-d'), $bucket->expires_at->format('Y-m-d'));
    }

    public function test_consecutive_credits_accumulate_balance_correctly(): void
    {
        $user = User::factory()->create();

        $this->pointService->credit(
            userId: $user->id,
            amount: 100,
            reference: null,
            source: PointTransactionSource::INVOICE_SUBMISSION
        );

        $this->pointService->credit(
            userId: $user->id,
            amount: 50,
            reference: null,
            source: PointTransactionSource::INVOICE_SUBMISSION
        );

        $this->assertCount(2, PointBucket::where('user_id', $user->id)->get());
        $this->assertCount(2, PointTransaction::where('user_id', $user->id)->get());

        $latestTransaction = PointTransaction::where('user_id', $user->id)->latest('id')->first();
        $this->assertEquals(150, $latestTransaction->balance_after);
    }

    public function test_debit_fails_when_user_has_insufficient_points(): void
    {
        $user = User::factory()->create();

        $this->pointService->credit(
            userId: $user->id,
            amount: 50,
            reference: null,
            source: PointTransactionSource::INVOICE_SUBMISSION
        );

        $this->expectException(HttpException::class);
        $this->expectExceptionMessage('Você não tem fundos suficientes para esta transação.');

        $this->pointService->debit(
            userId: $user->id,
            amount: 100,
            reference: null,
            source: PointTransactionSource::REWARD_REDEMPTION
        );
    }

    public function test_debit_partially_consumes_bucket(): void
    {
        $user = User::factory()->create();

        $this->pointService->credit(
            userId: $user->id,
            amount: 100,
            reference: null,
            source: PointTransactionSource::INVOICE_SUBMISSION
        );

        $this->pointService->debit(
            userId: $user->id,
            amount: 40,
            reference: null,
            source: PointTransactionSource::REWARD_REDEMPTION
        );

        $bucket = PointBucket::where('user_id', $user->id)->first();
        $this->assertEquals(60, $bucket->remaining_points);
        $this->assertEquals(PointBucketStatus::ACTIVE, $bucket->status);

        $latestTransaction = PointTransaction::where('user_id', $user->id)->latest('id')->first();
        $this->assertEquals(PointTransactionType::DEBIT, $latestTransaction->type);
        $this->assertEquals(40, $latestTransaction->amount);
        $this->assertEquals(60, $latestTransaction->balance_after);
    }

    public function test_debit_consumes_buckets_fifo_order(): void
    {
        $user = User::factory()->create();

        $bucket1 = PointBucket::create([
            'user_id' => $user->id,
            'initial_points' => 50,
            'remaining_points' => 50,
            'expires_at' => now()->addMonth(),
            'status' => PointBucketStatus::ACTIVE,
        ]);

        PointTransaction::create([
            'user_id' => $user->id,
            'point_bucket_id' => $bucket1->id,
            'type' => PointTransactionType::CREDIT,
            'amount' => 50,
            'source' => PointTransactionSource::INVOICE_SUBMISSION,
            'balance_after' => 50,
        ]);

        $bucket2 = PointBucket::create([
            'user_id' => $user->id,
            'initial_points' => 100,
            'remaining_points' => 100,
            'expires_at' => now()->addMonths(6),
            'status' => PointBucketStatus::ACTIVE,
        ]);

        PointTransaction::create([
            'user_id' => $user->id,
            'point_bucket_id' => $bucket2->id,
            'type' => PointTransactionType::CREDIT,
            'amount' => 100,
            'source' => PointTransactionSource::INVOICE_SUBMISSION,
            'balance_after' => 150,
        ]);

        $this->pointService->debit(
            userId: $user->id,
            amount: 70,
            reference: null,
            source: PointTransactionSource::REWARD_REDEMPTION
        );

        $bucket1->refresh();
        $this->assertEquals(0, $bucket1->remaining_points);
        $this->assertEquals(PointBucketStatus::EXHAUSTED, $bucket1->status);

        $bucket2->refresh();
        $this->assertEquals(80, $bucket2->remaining_points);
        $this->assertEquals(PointBucketStatus::ACTIVE, $bucket2->status);

        $latestTransaction = PointTransaction::where('user_id', $user->id)->latest('id')->first();
        $this->assertEquals(80, $latestTransaction->balance_after);
    }

    public function test_expire_marks_overdue_buckets_as_expired_and_records_debit(): void
    {
        $user = User::factory()->create();

        $expiredBucket = PointBucket::create([
            'user_id' => $user->id,
            'initial_points' => 50,
            'remaining_points' => 50,
            'expires_at' => now()->subDay(),
            'status' => PointBucketStatus::ACTIVE,
        ]);

        PointTransaction::create([
            'user_id' => $user->id,
            'point_bucket_id' => $expiredBucket->id,
            'type' => PointTransactionType::CREDIT,
            'amount' => 50,
            'source' => PointTransactionSource::INVOICE_SUBMISSION,
            'balance_after' => 50,
        ]);

        $validBucket = PointBucket::create([
            'user_id' => $user->id,
            'initial_points' => 100,
            'remaining_points' => 100,
            'expires_at' => now()->addMonths(6),
            'status' => PointBucketStatus::ACTIVE,
        ]);

        PointTransaction::create([
            'user_id' => $user->id,
            'point_bucket_id' => $validBucket->id,
            'type' => PointTransactionType::CREDIT,
            'amount' => 100,
            'source' => PointTransactionSource::INVOICE_SUBMISSION,
            'balance_after' => 150,
        ]);

        $this->pointService->expire();

        $expiredBucket->refresh();
        $this->assertEquals(0, $expiredBucket->remaining_points);
        $this->assertEquals(PointBucketStatus::EXPIRED, $expiredBucket->status);

        $validBucket->refresh();
        $this->assertEquals(100, $validBucket->remaining_points);
        $this->assertEquals(PointBucketStatus::ACTIVE, $validBucket->status);

        $latestTransaction = PointTransaction::where('user_id', $user->id)->latest('id')->first();
        $this->assertEquals(PointTransactionType::DEBIT, $latestTransaction->type);
        $this->assertEquals(PointTransactionSource::AUTO_EXPIRATION, $latestTransaction->source);
        $this->assertEquals(50, $latestTransaction->amount);
        $this->assertEquals(100, $latestTransaction->balance_after);
    }
}
