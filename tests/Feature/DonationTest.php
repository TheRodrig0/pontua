<?php

namespace Tests\Feature;

use App\Enums\PointBucketStatus;
use App\Enums\PointTransactionSource;
use App\Enums\PointTransactionType;
use App\Models\Donation;
use App\Models\PointBucket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DonationTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_donations_endpoints(): void
    {
        $responseIndex = $this->getJson('/api/donation');
        $responseIndex->assertStatus(401);

        $responseCreate = $this->postJson('/api/donation', [
            'recipient_id' => 1,
            'amount' => 100,
        ]);
        $responseCreate->assertStatus(401);
    }

    public function test_user_can_donate_points_successfully(): void
    {
        $donor = User::factory()->create();
        $recipient = User::factory()->create();

        PointBucket::create([
            'user_id' => $donor->id,
            'initial_points' => 500,
            'remaining_points' => 500,
            'expires_at' => now()->addDays(30),
            'status' => PointBucketStatus::ACTIVE,
        ]);

        $payload = [
            'recipient_id' => $recipient->id,
            'amount' => 200,
        ];

        $response = $this->actingAs($donor)
            ->postJson('/api/donation', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'donor_id' => $donor->id,
                'recipient_id' => $recipient->id,
                'amount' => 200,
            ]);

        $this->assertDatabaseHas('donations', [
            'donor_id' => $donor->id,
            'recipient_id' => $recipient->id,
            'amount' => 200,
        ]);

        $this->assertDatabaseHas('point_transactions', [
            'user_id' => $donor->id,
            'type' => PointTransactionType::DEBIT->value,
            'amount' => 200,
            'source' => PointTransactionSource::POINTS_DONATION->value,
            'balance_after' => -200,
        ]);

        $this->assertDatabaseHas('point_transactions', [
            'user_id' => $recipient->id,
            'type' => PointTransactionType::CREDIT->value,
            'amount' => 200,
            'source' => PointTransactionSource::POINTS_DONATION->value,
            'balance_after' => 200,
        ]);

        $this->assertDatabaseHas('point_buckets', [
            'user_id' => $donor->id,
            'remaining_points' => 300,
            'status' => PointBucketStatus::ACTIVE->value,
        ]);

        $this->assertDatabaseHas('point_buckets', [
            'user_id' => $recipient->id,
            'initial_points' => 200,
            'remaining_points' => 200,
            'status' => PointBucketStatus::ACTIVE->value,
        ]);
    }

    public function test_user_cannot_donate_more_points_than_available(): void
    {
        $donor = User::factory()->create();
        $recipient = User::factory()->create();

        PointBucket::create([
            'user_id' => $donor->id,
            'initial_points' => 100,
            'remaining_points' => 100,
            'expires_at' => now()->addDays(30),
            'status' => PointBucketStatus::ACTIVE,
        ]);

        $payload = [
            'recipient_id' => $recipient->id,
            'amount' => 200,
        ];

        $response = $this->actingAs($donor)
            ->postJson('/api/donation', $payload);

        $response->assertStatus(400);

        $this->assertDatabaseMissing('donations', [
            'donor_id' => $donor->id,
            'recipient_id' => $recipient->id,
        ]);
    }

    public function test_user_cannot_donate_to_themselves(): void
    {
        $donor = User::factory()->create();

        PointBucket::create([
            'user_id' => $donor->id,
            'initial_points' => 300,
            'remaining_points' => 300,
            'expires_at' => now()->addDays(30),
            'status' => PointBucketStatus::ACTIVE,
        ]);

        $payload = [
            'recipient_id' => $donor->id,
            'amount' => 100,
        ];

        $response = $this->actingAs($donor)
            ->postJson('/api/donation', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['recipient_id']);
    }

    public function test_user_cannot_donate_to_non_existent_user(): void
    {
        $donor = User::factory()->create();

        PointBucket::create([
            'user_id' => $donor->id,
            'initial_points' => 300,
            'remaining_points' => 300,
            'expires_at' => now()->addDays(30),
            'status' => PointBucketStatus::ACTIVE,
        ]);

        $payload = [
            'recipient_id' => 99999,
            'amount' => 100,
        ];

        $response = $this->actingAs($donor)
            ->postJson('/api/donation', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['recipient_id']);
    }

    public function test_user_cannot_donate_negative_or_zero_amount(): void
    {
        $donor = User::factory()->create();
        $recipient = User::factory()->create();

        $responseZero = $this->actingAs($donor)
            ->postJson('/api/donation', [
                'recipient_id' => $recipient->id,
                'amount' => 0,
            ]);
        $responseZero->assertStatus(422)
            ->assertJsonValidationErrors(['amount']);

        $responseNegative = $this->actingAs($donor)
            ->postJson('/api/donation', [
                'recipient_id' => $recipient->id,
                'amount' => -50,
            ]);
        $responseNegative->assertStatus(422)
            ->assertJsonValidationErrors(['amount']);
    }

    public function test_user_can_list_their_donations_with_cursor_pagination(): void
    {
        $donor = User::factory()->create();
        $otherUser = User::factory()->create();
        $recipient = User::factory()->create();

        Donation::create([
            'donor_id' => $donor->id,
            'recipient_id' => $recipient->id,
            'amount' => 50,
        ]);

        Donation::create([
            'donor_id' => $donor->id,
            'recipient_id' => $recipient->id,
            'amount' => 75,
        ]);

        Donation::create([
            'donor_id' => $otherUser->id,
            'recipient_id' => $recipient->id,
            'amount' => 100,
        ]);

        $response = $this->actingAs($donor)
            ->getJson('/api/donation');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'donor_id',
                        'recipient_id',
                        'amount',
                        'created_at',
                        'updated_at',
                    ],
                ],
                'path',
                'per_page',
                'next_cursor',
                'prev_cursor',
            ]);

        $data = $response->json('data');
        $this->assertCount(2, $data);
        $this->assertEquals(75, $data[0]['amount']);
        $this->assertEquals(50, $data[1]['amount']);
    }
}
