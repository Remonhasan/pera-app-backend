<?php

namespace App\Repositories;

use App\Models\SavingType;
use App\Repositories\Contracts\SavingTypeRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentSavingTypeRepository implements SavingTypeRepositoryInterface
{
    public function all(): Collection
    {
        return SavingType::query()
            ->orderBy('name')
            ->get();
    }

    public function create(array $attributes): SavingType
    {
        return SavingType::create($attributes);
    }

    public function update(SavingType $savingType, array $attributes): bool
    {
        return $savingType->update($attributes);
    }

    public function delete(SavingType $savingType): bool
    {
        return (bool) $savingType->delete();
    }
}
