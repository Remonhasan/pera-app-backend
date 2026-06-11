<?php

namespace App\Repositories\Contracts;

use App\Models\ExpenseTarget;
use Illuminate\Support\Collection;

interface ExpenseTargetRepositoryInterface
{
    public function allWithRelations(): Collection;

    public function create(array $attributes): ExpenseTarget;

    public function update(ExpenseTarget $expenseTarget, array $attributes): bool;

    public function delete(ExpenseTarget $expenseTarget): bool;
}
