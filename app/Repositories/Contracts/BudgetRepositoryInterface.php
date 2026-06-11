<?php

namespace App\Repositories\Contracts;

use App\Models\Budget;
use Illuminate\Support\Collection;

interface BudgetRepositoryInterface
{
    public function allWithRelations(): Collection;

    public function create(array $attributes): Budget;

    public function update(Budget $budget, array $attributes): bool;

    public function delete(Budget $budget): bool;
}
