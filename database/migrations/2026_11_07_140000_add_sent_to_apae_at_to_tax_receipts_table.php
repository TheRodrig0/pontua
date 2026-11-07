<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tax_receipts', function (Blueprint $table) {
            $table->timestamp('sent_to_apae_at')->nullable()->after('rejection_reason')->index();
        });
    }

    public function down(): void
    {
        Schema::table('tax_receipts', function (Blueprint $table) {
            $table->dropIndex(['sent_to_apae_at']);
            $table->dropColumn('sent_to_apae_at');
        });
    }
};

