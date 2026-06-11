<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['expenses', 'savings', 'withdraws', 'goals'] as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->string('drive_link', 2048)->nullable()->after('description');
            });
        }

        Schema::table('notes', function (Blueprint $table) {
            $table->string('drive_link', 2048)->nullable()->after('files');
        });
    }

    public function down(): void
    {
        foreach (['expenses', 'savings', 'withdraws', 'notes', 'goals'] as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->dropColumn('drive_link');
            });
        }
    }
};
