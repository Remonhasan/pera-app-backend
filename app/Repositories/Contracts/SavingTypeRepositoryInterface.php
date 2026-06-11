<?php

namespace App\Repositories\Contracts;

use App\Models\SavingType;
use Illuminate\Support\Collection;

interface SavingTypeRepositoryInterface
{
    public function all(): Collection;

    public function create(array $attributes): SavingType;

    public function update(SavingType $savingType, array $attributes): bool;

    public function delete(SavingType $savingType): bool;
}
