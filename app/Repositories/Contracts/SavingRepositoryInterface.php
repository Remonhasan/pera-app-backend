<?php

namespace App\Repositories\Contracts;

use App\Models\Saving;
use Illuminate\Support\Collection;

interface SavingRepositoryInterface
{
    public function allWithRelations(): Collection;

    public function create(array $attributes): Saving;

    public function update(Saving $saving, array $attributes): bool;

    public function delete(Saving $saving): bool;
}
