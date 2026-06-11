<?php

namespace App\Repositories\Contracts;

use App\Models\HabitType;
use Illuminate\Support\Collection;

interface HabitTypeRepositoryInterface
{
    public function all(): Collection;

    public function create(array $attributes): HabitType;

    public function update(HabitType $habitType, array $attributes): bool;

    public function delete(HabitType $habitType): bool;
}
