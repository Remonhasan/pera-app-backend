<?php

namespace App\Repositories;

use App\Models\Goal;
use App\Repositories\Contracts\GoalRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentGoalRepository implements GoalRepositoryInterface
{
    public function allWithRelations(): Collection
    {
        return Goal::query()
            ->with([
                'user:id,name,phone',
                'bank:id,name',
                'savingType:id,name',
                'creator:id,name',
                'updater:id,name',
            ])
            ->orderByDesc('id')
            ->get();
    }

    public function create(array $attributes): Goal
    {
        return Goal::create($attributes);
    }

    public function update(Goal $goal, array $attributes): bool
    {
        return $goal->update($attributes);
    }

    public function delete(Goal $goal): bool
    {
        return (bool) $goal->delete();
    }
}
