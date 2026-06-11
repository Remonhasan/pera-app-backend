<?php

namespace App\Repositories;

use App\Models\Expense;
use App\Repositories\Contracts\ExpenseRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentExpenseRepository implements ExpenseRepositoryInterface
{
    public function allWithRelations(): Collection
    {
        return Expense::query()
            ->with([
                'user:id,name,phone',
                'expenseType:id,name',
                'budgetType:id,name',
                'creator:id,name',
                'updater:id,name',
            ])
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->get();
    }

    public function create(array $attributes): Expense
    {
        return Expense::create($attributes);
    }

    public function update(Expense $expense, array $attributes): bool
    {
        return $expense->update($attributes);
    }

    public function delete(Expense $expense): bool
    {
        return (bool) $expense->delete();
    }
}
