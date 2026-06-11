<?php

namespace App\Repositories;

use App\Models\Bank;
use App\Repositories\Contracts\BankRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentBankRepository implements BankRepositoryInterface
{
    public function all(): Collection
    {
        return Bank::query()
            ->orderBy('name')
            ->get();
    }

    public function create(array $attributes): Bank
    {
        return Bank::create($attributes);
    }

    public function update(Bank $bank, array $attributes): bool
    {
        return $bank->update($attributes);
    }

    public function delete(Bank $bank): bool
    {
        return (bool) $bank->delete();
    }
}
