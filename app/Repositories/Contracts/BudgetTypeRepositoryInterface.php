<?php

namespace App\Repositories\Contracts;

use App\Models\BudgetType;
use Illuminate\Support\Collection;

interface BudgetTypeRepositoryInterface
{
    public function all(): Collection;

    public function create(array $attributes): BudgetType;

    public function update(BudgetType $budgetType, array $attributes): bool;

    public function delete(BudgetType $budgetType): bool;
}
