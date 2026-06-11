<?php

namespace App\Repositories;

use App\Models\ExpenseType;
use App\Repositories\Contracts\ExpenseTypeRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentExpenseTypeRepository implements ExpenseTypeRepositoryInterface
{
    public function all(): Collection
    {
        return ExpenseType::query()
            ->orderBy('name')
            ->get();
    }

    public function create(array $attributes): ExpenseType
    {
        return ExpenseType::create($attributes);
    }

    public function update(ExpenseType $expenseType, array $attributes): bool
    {
        return $expenseType->update($attributes);
    }

    public function delete(ExpenseType $expenseType): bool
    {
        return (bool) $expenseType->delete();
    }
}
