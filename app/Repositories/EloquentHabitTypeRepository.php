<?php

namespace App\Repositories;

use App\Models\HabitType;
use App\Repositories\Contracts\HabitTypeRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentHabitTypeRepository implements HabitTypeRepositoryInterface
{
    public function all(): Collection
    {
        return HabitType::query()->orderBy('name')->get();
    }

    public function create(array $attributes): HabitType
    {
        return HabitType::create($attributes);
    }

    public function update(HabitType $habitType, array $attributes): bool
    {
        return $habitType->update($attributes);
    }

    public function delete(HabitType $habitType): bool
    {
        return (bool) $habitType->delete();
    }
}
