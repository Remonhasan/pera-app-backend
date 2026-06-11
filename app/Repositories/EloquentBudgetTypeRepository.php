<?php

namespace App\Repositories;

use App\Models\BudgetType;
use App\Repositories\Contracts\BudgetTypeRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentBudgetTypeRepository implements BudgetTypeRepositoryInterface
{
    public function all(): Collection
    {
        return BudgetType::query()
            ->orderBy('name')
            ->get();
    }

    public function create(array $attributes): BudgetType
    {
        return BudgetType::create($attributes);
    }

    public function update(BudgetType $budgetType, array $attributes): bool
    {
        return $budgetType->update($attributes);
    }

    public function delete(BudgetType $budgetType): bool
    {
        return (bool) $budgetType->delete();
    }
}
