<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expense_targets', function (Blueprint $table) {
            $table->unsignedTinyInteger('month')->default(1)->after('budget_type_id');
            $table->unsignedSmallInteger('year')->default((int) date('Y'))->after('month');
        });
    }

    public function down(): void
    {
        Schema::table('expense_targets', function (Blueprint $table) {
            $table->dropColumn(['month', 'year']);
        });
    }
};
