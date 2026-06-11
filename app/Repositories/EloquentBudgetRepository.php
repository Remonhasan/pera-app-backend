<?php

namespace App\Repositories;

use App\Models\Budget;
use App\Repositories\Contracts\BudgetRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentBudgetRepository implements BudgetRepositoryInterface
{
    public function allWithRelations(): Collection
    {
        return Budget::query()
            ->with([
                'user:id,name,phone',
                'budgetType:id,name',
                'creator:id,name',
                'updater:id,name',
            ])
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->orderByDesc('id')
            ->get();
    }

    public function create(array $attributes): Budget
    {
        return Budget::create($attributes);
    }

    public function update(Budget $budget, array $attributes): bool
    {
        return $budget->update($attributes);
    }

    public function delete(Budget $budget): bool
    {
        return (bool) $budget->delete();
    }
}
