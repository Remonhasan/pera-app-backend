<?php

namespace App\Repositories;

use App\Models\Withdraw;
use App\Repositories\Contracts\WithdrawRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentWithdrawRepository implements WithdrawRepositoryInterface
{
    public function allWithRelations(): Collection
    {
        return Withdraw::query()
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

    public function create(array $attributes): Withdraw
    {
        return Withdraw::create($attributes);
    }

    public function update(Withdraw $withdraw, array $attributes): bool
    {
        return $withdraw->update($attributes);
    }

    public function delete(Withdraw $withdraw): bool
    {
        return (bool) $withdraw->delete();
    }
}
