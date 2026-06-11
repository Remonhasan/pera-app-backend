<?php

namespace App\Repositories\Contracts;

use App\Models\Goal;
use Illuminate\Support\Collection;

interface GoalRepositoryInterface
{
    public function allWithRelations(): Collection;

    public function create(array $attributes): Goal;

    public function update(Goal $goal, array $attributes): bool;

    public function delete(Goal $goal): bool;
}
