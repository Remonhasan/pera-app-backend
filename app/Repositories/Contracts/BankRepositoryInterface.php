<?php

namespace App\Repositories\Contracts;

use App\Models\Bank;
use Illuminate\Support\Collection;

interface BankRepositoryInterface
{
    public function all(): Collection;

    public function create(array $attributes): Bank;

    public function update(Bank $bank, array $attributes): bool;

    public function delete(Bank $bank): bool;
}
