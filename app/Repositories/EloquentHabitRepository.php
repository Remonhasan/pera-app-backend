<?php

namespace App\Repositories;

use App\Models\Habit;
use App\Repositories\Contracts\HabitRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentHabitRepository implements HabitRepositoryInterface
{
    public function allWithRelations(): Collection
    {
        return Habit::query()
            ->with([
                'creator:id,name',
                'updater:id,name',
            ])
            ->orderByDesc('id')
            ->get();
    }

    public function create(array $attributes): Habit
    {
        return Habit::create($attributes);
    }

    public function update(Habit $habit, array $attributes): bool
    {
        return $habit->update($attributes);
    }

    public function delete(Habit $habit): bool
    {
        return (bool) $habit->delete();
    }
}
