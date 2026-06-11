<?php

namespace App\Repositories\Contracts;

use App\Models\Withdraw;
use Illuminate\Support\Collection;

interface WithdrawRepositoryInterface
{
    public function allWithRelations(): Collection;

    public function create(array $attributes): Withdraw;

    public function update(Withdraw $withdraw, array $attributes): bool;

    public function delete(Withdraw $withdraw): bool;
}
