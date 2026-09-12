<?php

namespace Tests\Feature;

use App\Enums\PointBucketStatus;
use App\Models\PointBucket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class RankingTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_ranking_endpoint(): void
    {
        $response = $this->getJson('/api/ranking');

        $response->assertStatus(401);
    }

    public function test_user_can_get_ranking_ordered_by_total_donated(): void
    {
        $viewer = User::factory()->create();

        $userHigh = User::factory()->create([
            'name' => 'High User',
            'nick' => 'high.user',
            'avatar_url' => 'avatars/1.png',
            'scan_streak' => 5,
        ]);
        PointBucket::create([
            'user_id' => $userHigh->id,
            'initial_points' => 300,
            'remaining_points' => 300,
            'expires_at' => now()->addDays(30),
            'status' => PointBucketStatus::ACTIVE,
        ]);
        PointBucket::create([
            'user_id' => $userHigh->id,
            'initial_points' => 200,
            'remaining_points' => 200,
            'expires_at' => now()->addDays(30),
            'status' => PointBucketStatus::ACTIVE,
        ]);

        $userMid = User::factory()->create([
            'name' => 'Mid User',
            'nick' => 'mid.user',
            'scan_streak' => 2,
        ]);
        PointBucket::create([
            'user_id' => $userMid->id,
            'initial_points' => 150,
            'remaining_points' => 150,
            'expires_at' => now()->addDays(30),
            'status' => PointBucketStatus::ACTIVE,
        ]);

        $userLow = User::factory()->create([
            'name' => 'Low User',
            'nick' => 'low.user',
            'scan_streak' => 0,
        ]);

        $response = $this->actingAs($viewer)
            ->getJson('/api/ranking');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'position',
                    'id',
                    'name',
                    'nick',
                    'avatar_url',
                    'scan_streak',
                    'total_donated',
                ],
            ]);

        $data = $response->json();

        // 1st place should be userHigh with 500 total_donated
        $this->assertSame(1, $data[0]['position']);
        $this->assertSame($userHigh->id, $data[0]['id']);
        $this->assertSame('High User', $data[0]['name']);
        $this->assertSame(500, $data[0]['total_donated']);
        $this->assertSame(5, $data[0]['scan_streak']);

        // 2nd place should be userMid with 150 total_donated
        $this->assertSame(2, $data[1]['position']);
        $this->assertSame($userMid->id, $data[1]['id']);
        $this->assertSame(150, $data[1]['total_donated']);

        // Remaining places have 0 total_donated
        $this->assertContains(0, [$data[2]['total_donated'], $data[3]['total_donated']]);
    }

    public function test_ranking_defaults_to_ten_users(): void
    {
        $viewer = User::factory()->create();

        User::factory()->count(15)->create();

        $response = $this->actingAs($viewer)
            ->getJson('/api/ranking');

        $response->assertStatus(200)
            ->assertJsonCount(10);
    }

    public function test_unauthenticated_user_cannot_access_my_performance(): void
    {
        $response = $this->getJson('/api/ranking/my-performance');

        $response->assertStatus(401);
    }

    public function test_user_can_get_their_performance_in_top_ranking(): void
    {
        $userFirst = User::factory()->create([
            'scan_streak' => 10,
        ]);
        PointBucket::create([
            'user_id' => $userFirst->id,
            'initial_points' => 500,
            'remaining_points' => 500,
            'expires_at' => now()->addDays(30),
            'status' => PointBucketStatus::ACTIVE,
        ]);

        $userSecond = User::factory()->create([
            'scan_streak' => 3,
        ]);
        PointBucket::create([
            'user_id' => $userSecond->id,
            'initial_points' => 200,
            'remaining_points' => 200,
            'expires_at' => now()->addDays(30),
            'status' => PointBucketStatus::ACTIVE,
        ]);

        $response = $this->actingAs($userSecond)
            ->getJson('/api/ranking/my-performance');

        $response->assertStatus(200)
            ->assertJson([
                'position' => 2,
                'total_donated' => 200,
                'points_to_next_position' => 300,
                'next_position' => 1,
                'scan_streak' => 3,
            ]);
    }

    public function test_first_place_user_has_null_points_to_next_position(): void
    {
        $userFirst = User::factory()->create([
            'scan_streak' => 7,
        ]);
        PointBucket::create([
            'user_id' => $userFirst->id,
            'initial_points' => 500,
            'remaining_points' => 500,
            'expires_at' => now()->addDays(30),
            'status' => PointBucketStatus::ACTIVE,
        ]);

        $response = $this->actingAs($userFirst)
            ->getJson('/api/ranking/my-performance');

        $response->assertStatus(200)
            ->assertJson([
                'position' => 1,
                'total_donated' => 500,
                'points_to_next_position' => null,
                'next_position' => null,
                'scan_streak' => 7,
            ]);
    }

    public function test_user_outside_top_ranking_can_get_their_performance(): void
    {
        // Create 11 users with points
        for ($i = 1; $i <= 11; $i++) {
            $user = User::factory()->create();
            PointBucket::create([
                'user_id' => $user->id,
                'initial_points' => $i * 100,
                'remaining_points' => $i * 100,
                'expires_at' => now()->addDays(30),
                'status' => PointBucketStatus::ACTIVE,
            ]);
        }

        // Create a user with 50 points (lowest score, outside top 10)
        $userLast = User::factory()->create([
            'scan_streak' => 2,
        ]);
        PointBucket::create([
            'user_id' => $userLast->id,
            'initial_points' => 50,
            'remaining_points' => 50,
            'expires_at' => now()->addDays(30),
            'status' => PointBucketStatus::ACTIVE,
        ]);

        $response = $this->actingAs($userLast)
            ->getJson('/api/ranking/my-performance');

        $response->assertStatus(200)
            ->assertJson([
                'position' => 12,
                'total_donated' => 50,
                'points_to_next_position' => 50, // 100 - 50
                'next_position' => 11,
                'scan_streak' => 2,
            ]);
    }

    public function test_performance_outside_top_ranking_is_cached(): void
    {
        for ($i = 1; $i <= 11; $i++) {
            $user = User::factory()->create();
            PointBucket::create([
                'user_id' => $user->id,
                'initial_points' => $i * 100,
                'remaining_points' => $i * 100,
                'expires_at' => now()->addDays(30),
                'status' => PointBucketStatus::ACTIVE,
            ]);
        }

        $userLast = User::factory()->create();
        PointBucket::create([
            'user_id' => $userLast->id,
            'initial_points' => 10,
            'remaining_points' => 10,
            'expires_at' => now()->addDays(30),
            'status' => PointBucketStatus::ACTIVE,
        ]);

        $this->actingAs($userLast)
            ->getJson('/api/ranking/my-performance');

        $this->assertTrue(Cache::has("ranking_performance_{$userLast->id}"));
    }
}
