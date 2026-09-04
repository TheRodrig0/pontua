<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tax_receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('access_key', 44)->unique();
            $table->decimal('value', 10, 2)->default(0);
            $table->unsignedInteger('points_earned')->default(0);
            $table->dateTime('issue_date')->nullable();
            $table->string('status')->default('PENDING');
            $table->text('rejection_reason')->nullable();
            $table->text('original_url');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tax_receipts');
    }
};
