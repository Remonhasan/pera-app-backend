<?php

namespace App\Repositories;

use App\Models\ExpenseTarget;
use App\Repositories\Contracts\ExpenseTargetRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentExpenseTargetRepository implements ExpenseTargetRepositoryInterface
{
    public function allWithRelations(): Collection
    {
        return ExpenseTarget::query()
            ->with([
                'user:id,name,phone',
                'budgetType:id,name',
            ])
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->orderByDesc('id')
            ->get();
    }

    public function create(array $attributes): ExpenseTarget
    {
        return ExpenseTarget::create($attributes);
    }

    public function update(ExpenseTarget $expenseTarget, array $attributes): bool
    {
        return $expenseTarget->update($attributes);
    }

    public function delete(ExpenseTarget $expenseTarget): bool
    {
        return (bool) $expenseTarget->delete();
    }
}
