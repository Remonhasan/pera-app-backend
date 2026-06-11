<?php

use App\Models\Budget;
use App\Models\Expense;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->foreignId('budget_id')
                ->nullable()
                ->after('budget_type_id')
                ->constrained('budgets')
                ->nullOnDelete();
        });

        Expense::query()
            ->whereNotNull('budget_type_id')
            ->orderBy('id')
            ->chunkById(100, function ($expenses) {
                foreach ($expenses as $expense) {
                    $budgetId = Budget::query()
                        ->where('user_id', $expense->user_id)
                        ->where('budget_type_id', $expense->budget_type_id)
                        ->where('month', $expense->month)
                        ->where('year', $expense->year)
                        ->value('id');

                    if ($budgetId !== null) {
                        $expense->update(['budget_id' => $budgetId]);
                    }
                }
            });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropConstrainedForeignId('budget_id');
        });
    }
};
