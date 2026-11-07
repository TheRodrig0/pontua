<?php

namespace Tests\Feature;

use App\Enums\PointTransactionSource;
use App\Enums\RedemptionStatus;
use App\Enums\RewardTag;
use App\Enums\UserRole;
use App\Models\PointBucket;
use App\Models\Redemption;
use App\Models\Reward;
use App\Models\User;
use App\Notifications\RewardRedeemedNotification;
use App\Services\PointService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RedemptionTest extends TestCase
{
    use RefreshDatabase;

    private function studentWithPoints(int $points): User
    {
        $user = User::factory()->create(['role' => UserRole::USER]);

        if ($points > 0) {
            app(PointService::class)->credit(
                userId: $user->id,
                amount: $points,
                source: PointTransactionSource::INVOICE_SUBMISSION
            );
        }

        return $user;
    }

    private function reward(array $attributes = []): Reward
    {
        return Reward::create(array_merge([
            'name' => 'Camisa Pontua',
            'description' => 'Camisa oficial',
            'tag' => RewardTag::CLOTHING,
            'cost' => 100,
            'is_active' => true,
        ], $attributes));
    }

    private function balance(User $user): int
    {
        return (int) PointBucket::where('user_id', $user->id)->sum('remaining_points');
    }

    public function test_unauthenticated_user_cannot_access_redemptions(): void
    {
        $this->getJson('/api/redemptions')->assertStatus(401);
        $this->postJson('/api/redemptions', [])->assertStatus(401);
        $this->getJson('/api/admin/redemptions')->assertStatus(401);
        $this->patchJson('/api/admin/redemptions/1', [])->assertStatus(401);
    }

    public function test_student_can_redeem_reward_and_points_are_debited(): void
    {
        $user = $this->studentWithPoints(250);
        $reward = $this->reward(['cost' => 100]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/redemptions', ['reward_id' => $reward->id]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'pending')
            ->assertJsonPath('points_cost', 100)
            ->assertJsonMissingPath('user_id');

        $this->assertMatchesRegularExpression('/^RES-[A-Z2-9]{8}$/', $response->json('voucher_code'));
        $this->assertSame(150, $this->balance($user));

        $this->assertDatabaseHas('point_transactions', [
            'user_id' => $user->id,
            'source' => PointTransactionSource::REWARD_REDEMPTION->value,
            'type' => 'debit',
            'amount' => 100,
        ]);
    }

    public function test_redemption_fails_with_insufficient_balance(): void
    {
        $user = $this->studentWithPoints(50);
        $reward = $this->reward(['cost' => 100]);
        Sanctum::actingAs($user);

        $this->postJson('/api/redemptions', ['reward_id' => $reward->id])
            ->assertStatus(400);

        $this->assertDatabaseCount('redemptions', 0);
        $this->assertSame(50, $this->balance($user));
    }

    public function test_redemption_fails_for_inactive_or_missing_reward(): void
    {
        $user = $this->studentWithPoints(500);
        $inactive = $this->reward(['is_active' => false]);
        Sanctum::actingAs($user);

        $this->postJson('/api/redemptions', ['reward_id' => $inactive->id])->assertStatus(404);
        $this->postJson('/api/redemptions', ['reward_id' => 999999])->assertStatus(422);

        $this->assertDatabaseCount('redemptions', 0);
        $this->assertSame(500, $this->balance($user));
    }

    public function test_redemption_fails_when_out_of_stock(): void
    {
        $user = $this->studentWithPoints(500);
        $reward = $this->reward(['stock' => 0]);
        Sanctum::actingAs($user);

        $this->postJson('/api/redemptions', ['reward_id' => $reward->id])->assertStatus(409);

        $this->assertSame(500, $this->balance($user));
    }

    public function test_stock_is_decremented_on_redemption(): void
    {
        $user = $this->studentWithPoints(500);
        $reward = $this->reward(['stock' => 2]);
        Sanctum::actingAs($user);

        $this->postJson('/api/redemptions', ['reward_id' => $reward->id])->assertStatus(201);

        $this->assertSame(1, $reward->fresh()->stock);
    }

    public function test_duplicate_pending_redemption_is_rejected(): void
    {
        $user = $this->studentWithPoints(500);
        $reward = $this->reward(['cost' => 100]);
        Sanctum::actingAs($user);

        $this->postJson('/api/redemptions', ['reward_id' => $reward->id])->assertStatus(201);
        $this->postJson('/api/redemptions', ['reward_id' => $reward->id])->assertStatus(409);

        $this->assertDatabaseCount('redemptions', 1);
        $this->assertSame(400, $this->balance($user));
    }

    public function test_voucher_code_cannot_be_chosen_by_the_client(): void
    {
        $user = $this->studentWithPoints(500);
        $reward = $this->reward();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/redemptions', [
            'reward_id' => $reward->id,
            'voucher_code' => 'RES-HACKED1',
            'status' => 'completed',
            'points_cost' => 1,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'pending')
            ->assertJsonPath('points_cost', 100);

        $this->assertNotSame('RES-HACKED1', $response->json('voucher_code'));
    }

    public function test_student_only_lists_own_redemptions(): void
    {
        $user = $this->studentWithPoints(500);
        $other = $this->studentWithPoints(500);
        $reward = $this->reward();

        Sanctum::actingAs($user);
        $this->postJson('/api/redemptions', ['reward_id' => $reward->id])->assertStatus(201);

        Sanctum::actingAs($other);
        $this->postJson('/api/redemptions', ['reward_id' => $reward->id])->assertStatus(201);

        $response = $this->getJson('/api/redemptions')->assertStatus(200);

        $this->assertCount(1, $response->json('data'));
        $this->assertSame($other->id, Redemption::find($response->json('data.0.id'))->user_id);
        $this->assertArrayNotHasKey('user_id', $response->json('data.0'));
    }

    public function test_student_cannot_use_admin_endpoints(): void
    {
        $user = $this->studentWithPoints(500);
        $reward = $this->reward();
        Sanctum::actingAs($user);

        $id = $this->postJson('/api/redemptions', ['reward_id' => $reward->id])->json('id');

        $this->getJson('/api/admin/redemptions')->assertStatus(403);
        $this->patchJson("/api/admin/redemptions/{$id}", ['status' => 'completed'])->assertStatus(403);
    }

    public function test_admin_can_list_and_complete_redemption(): void
    {
        $student = $this->studentWithPoints(500);
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $reward = $this->reward();

        Sanctum::actingAs($student);
        $id = $this->postJson('/api/redemptions', ['reward_id' => $reward->id])->json('id');

        Sanctum::actingAs($admin);
        $this->getJson('/api/admin/redemptions?status=pending')
            ->assertStatus(200)
            ->assertJsonPath('data.0.user.email', $student->email);

        $this->patchJson("/api/admin/redemptions/{$id}", ['status' => 'completed'])
            ->assertStatus(200)
            ->assertJsonPath('status', 'completed');

        $redemption = Redemption::find($id);
        $this->assertSame(RedemptionStatus::COMPLETED, $redemption->status);
        $this->assertNotNull($redemption->redeemed_at);
        $this->assertSame($admin->id, $redemption->processed_by);
        $this->assertSame(400, $this->balance($student));
    }

    public function test_cancel_refunds_points_and_stock(): void
    {
        $student = $this->studentWithPoints(500);
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $reward = $this->reward(['stock' => 3]);

        Sanctum::actingAs($student);
        $id = $this->postJson('/api/redemptions', ['reward_id' => $reward->id])->json('id');
        $this->assertSame(400, $this->balance($student));
        $this->assertSame(2, $reward->fresh()->stock);

        Sanctum::actingAs($admin);
        $this->patchJson("/api/admin/redemptions/{$id}", ['status' => 'cancelled'])
            ->assertStatus(200)
            ->assertJsonPath('status', 'cancelled');

        $this->assertSame(500, $this->balance($student));
        $this->assertSame(3, $reward->fresh()->stock);
        $this->assertDatabaseHas('point_transactions', [
            'user_id' => $student->id,
            'source' => PointTransactionSource::REWARD_REFUND->value,
            'type' => 'credit',
            'amount' => 100,
        ]);
    }

    public function test_processing_twice_does_not_refund_twice(): void
    {
        $student = $this->studentWithPoints(500);
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $reward = $this->reward();

        Sanctum::actingAs($student);
        $id = $this->postJson('/api/redemptions', ['reward_id' => $reward->id])->json('id');

        Sanctum::actingAs($admin);
        $this->patchJson("/api/admin/redemptions/{$id}", ['status' => 'cancelled'])->assertStatus(200);
        $this->patchJson("/api/admin/redemptions/{$id}", ['status' => 'cancelled'])->assertStatus(409);
        $this->patchJson("/api/admin/redemptions/{$id}", ['status' => 'completed'])->assertStatus(409);

        $this->assertSame(500, $this->balance($student));
        $this->assertSame(RedemptionStatus::CANCELLED, Redemption::find($id)->status);
    }

    public function test_refund_keeps_original_expiration_when_still_valid(): void
    {
        $student = $this->studentWithPoints(500);
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $reward = $this->reward();

        Sanctum::actingAs($student);
        $id = $this->postJson('/api/redemptions', ['reward_id' => $reward->id])->json('id');
        $originalExpiration = Redemption::find($id)->points_expires_at;

        Sanctum::actingAs($admin);
        $this->patchJson("/api/admin/redemptions/{$id}", ['status' => 'cancelled'])->assertStatus(200);

        $refundBucket = PointBucket::where('reference_type', (new Redemption)->getMorphClass())
            ->where('reference_id', $id)
            ->first();

        $this->assertNotNull($refundBucket);
        $this->assertTrue($refundBucket->expires_at->equalTo($originalExpiration));
    }

    public function test_refund_gets_grace_period_when_original_expiration_has_passed(): void
    {
        $student = $this->studentWithPoints(500);
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $reward = $this->reward();

        Sanctum::actingAs($student);
        $id = $this->postJson('/api/redemptions', ['reward_id' => $reward->id])->json('id');
        Redemption::where('id', $id)->update(['points_expires_at' => now()->subDay()]);

        Sanctum::actingAs($admin);
        $this->patchJson("/api/admin/redemptions/{$id}", ['status' => 'cancelled'])->assertStatus(200);

        $refundBucket = PointBucket::where('reference_type', (new Redemption)->getMorphClass())
            ->where('reference_id', $id)
            ->first();

        $this->assertEqualsWithDelta(
            now()->addDays(30)->timestamp,
            $refundBucket->expires_at->timestamp,
            60
        );
    }

    public function test_admin_update_rejects_invalid_status(): void
    {
        $student = $this->studentWithPoints(500);
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $reward = $this->reward();

        Sanctum::actingAs($student);
        $id = $this->postJson('/api/redemptions', ['reward_id' => $reward->id])->json('id');

        Sanctum::actingAs($admin);
        $this->patchJson("/api/admin/redemptions/{$id}", ['status' => 'pending'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_student_receives_email_notification_with_voucher_on_redemption(): void
    {
        Notification::fake();

        $user = $this->studentWithPoints(250);
        $reward = $this->reward(['name' => 'Caneca FATEC', 'cost' => 100]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/redemptions', ['reward_id' => $reward->id]);
        $response->assertStatus(201);
        $voucherCode = $response->json('voucher_code');

        Notification::assertSentTo(
            $user,
            RewardRedeemedNotification::class,
            function (RewardRedeemedNotification $notification) use ($reward, $voucherCode) {
                return $notification->redemption->voucher_code === $voucherCode
                    && $notification->redemption->reward_id === $reward->id
                    && $notification->redemption->points_cost === 100;
            }
        );
    }

    public function test_email_notification_is_not_sent_when_balance_insufficient(): void
    {
        Notification::fake();

        $user = $this->studentWithPoints(50);
        $reward = $this->reward(['cost' => 100]);
        Sanctum::actingAs($user);

        $this->postJson('/api/redemptions', ['reward_id' => $reward->id])->assertStatus(400);

        Notification::assertNothingSent();
    }

    public function test_email_notification_is_not_sent_when_out_of_stock(): void
    {
        Notification::fake();

        $user = $this->studentWithPoints(500);
        $reward = $this->reward(['stock' => 0]);
        Sanctum::actingAs($user);

        $this->postJson('/api/redemptions', ['reward_id' => $reward->id])->assertStatus(409);

        Notification::assertNothingSent();
    }

    public function test_email_notification_is_not_sent_on_duplicate_pending(): void
    {
        Notification::fake();

        $user = $this->studentWithPoints(500);
        $reward = $this->reward(['cost' => 100]);
        Sanctum::actingAs($user);

        $this->postJson('/api/redemptions', ['reward_id' => $reward->id])->assertStatus(201);
        $this->postJson('/api/redemptions', ['reward_id' => $reward->id])->assertStatus(409);

        Notification::assertSentTimes(RewardRedeemedNotification::class, 1);
    }

    public function test_reward_redeemed_notification_renders_clean_template(): void
    {
        $user = $this->studentWithPoints(200);
        $reward = $this->reward(['name' => 'Garrafa Térmica Pontua', 'cost' => 150]);

        $redemption = Redemption::create([
            'user_id' => $user->id,
            'reward_id' => $reward->id,
            'points_cost' => 150,
            'voucher_code' => 'RES-CLEAN123',
            'status' => RedemptionStatus::PENDING,
        ]);
        $redemption->setRelation('reward', $reward);

        $notification = new RewardRedeemedNotification($redemption);
        $mail = $notification->toMail($user);

        $this->assertEquals('Código de Resgate: RES-CLEAN123 - Pontua', $mail->subject);
        $rendered = $mail->render();

        $this->assertStringContainsString('RES-CLEAN123', $rendered);
        $this->assertStringContainsString('Garrafa Térmica Pontua', $rendered);
        $this->assertStringContainsString($user->name, $rendered);
        $this->assertStringContainsString('Administração da FATEC', $rendered);
    }
}

