<?php

namespace App\Repositories\Contracts;

use App\Models\Expense;
use Illuminate\Support\Collection;

interface ExpenseRepositoryInterface
{
    public function allWithRelations(): Collection;

    public function create(array $attributes): Expense;

    public function update(Expense $expense, array $attributes): bool;

    public function delete(Expense $expense): bool;
}
