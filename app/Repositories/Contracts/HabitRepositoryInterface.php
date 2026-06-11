<?php

namespace App\Repositories\Contracts;

use App\Models\Habit;
use Illuminate\Support\Collection;

interface HabitRepositoryInterface
{
    public function allWithRelations(): Collection;

    public function create(array $attributes): Habit;

    public function update(Habit $habit, array $attributes): bool;

    public function delete(Habit $habit): bool;
}
