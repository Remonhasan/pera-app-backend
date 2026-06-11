<?php

namespace App\Repositories;

use App\Models\Saving;
use App\Repositories\Contracts\SavingRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentSavingRepository implements SavingRepositoryInterface
{
    public function allWithRelations(): Collection
    {
        return Saving::query()
            ->with([
                'user:id,name,phone',
                'bank:id,name',
                'savingType:id,name',
                'creator:id,name',
                'updater:id,name',
            ])
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->get();
    }

    public function create(array $attributes): Saving
    {
        return Saving::create($attributes);
    }

    public function update(Saving $saving, array $attributes): bool
    {
        return $saving->update($attributes);
    }

    public function delete(Saving $saving): bool
    {
        return (bool) $saving->delete();
    }
}
