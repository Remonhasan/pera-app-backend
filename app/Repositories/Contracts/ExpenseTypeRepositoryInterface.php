<?php

namespace App\Repositories\Contracts;

use App\Models\ExpenseType;
use Illuminate\Support\Collection;

interface ExpenseTypeRepositoryInterface
{
    public function all(): Collection;

    public function create(array $attributes): ExpenseType;

    public function update(ExpenseType $expenseType, array $attributes): bool;

    public function delete(ExpenseType $expenseType): bool;
}
