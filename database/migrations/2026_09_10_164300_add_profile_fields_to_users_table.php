<?php

use App\Enums\UserRole;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('nick')->nullable()->unique();
            $table->string('role')->default(UserRole::USER->value);
            $table->string('avatar_url')->nullable();
            $table->integer('scan_streak')->default(0);
            $table->integer('longest_streak')->default(0);
            $table->date('last_scan_date')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'nick',
                'role',
                'avatar_url',
                'scan_streak',
                'longest_streak',
                'last_scan_date',
            ]);
        });
    }
};
