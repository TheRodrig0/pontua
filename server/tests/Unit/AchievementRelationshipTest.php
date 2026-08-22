<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Achievement;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AchievementRelationshipTest extends TestCase
{
    public function test_user_has_achievements_relationship(): void
    {
        $user = new User();
        $relation = $user->achievements();

        $this->assertInstanceOf(BelongsToMany::class, $relation);
        $this->assertInstanceOf(Achievement::class, $relation->getRelated());
        $this->assertEquals('achievement_user', $relation->getTable());
        $this->assertEquals('achievement_user.user_id', $relation->getQualifiedForeignPivotKeyName());
        $this->assertEquals('achievement_user.achievement_id', $relation->getQualifiedRelatedPivotKeyName());
    }

    public function test_user_has_equipped_achievement_relationship(): void
    {
        $user = new User();
        $relation = $user->equippedAchievement();

        $this->assertInstanceOf(BelongsTo::class, $relation);
        $this->assertInstanceOf(Achievement::class, $relation->getRelated());
        $this->assertEquals('equipped_achievement_id', $relation->getForeignKeyName());
    }

    public function test_achievement_has_users_relationship(): void
    {
        $achievement = new Achievement();
        $relation = $achievement->users();

        $this->assertInstanceOf(BelongsToMany::class, $relation);
        $this->assertInstanceOf(User::class, $relation->getRelated());
        $this->assertEquals('achievement_user', $relation->getTable());
        $this->assertEquals('achievement_user.achievement_id', $relation->getQualifiedForeignPivotKeyName());
        $this->assertEquals('achievement_user.user_id', $relation->getQualifiedRelatedPivotKeyName());
    }
}
