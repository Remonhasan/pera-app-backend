<?php

namespace App\Services;

use App\Models\Bank;
use App\Repositories\Contracts\BankRepositoryInterface;
use Illuminate\Support\Collection;

class BankService
{
    public function __construct(private readonly BankRepositoryInterface $banks) {}

    public function listBanks(): Collection
    {
        return $this->banks->all();
    }

    /** @return list<array{id: int, name: string}> */
    public function bankOptions(): array
    {
        return Bank::query()
            ->where('status', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Bank $bank) => [
                'id' => $bank->id,
                'name' => $bank->name,
            ])
            ->all();
    }

    /** @param  array<string, mixed>  $validated */
    public function createBank(array $validated): ?Bank
    {
        return $this->banks->create([
            'name' => $validated['name'],
            'status' => $validated['status'] ?? true,
        ]);
    }

    /** @param  array<string, mixed>  $validated */
    public function updateBank(Bank $bank, array $validated): bool
    {
        $payload = [];

        if (array_key_exists('name', $validated)) {
            $payload['name'] = $validated['name'];
        }
        if (array_key_exists('status', $validated)) {
            $payload['status'] = (bool) $validated['status'];
        }

        return $this->banks->update($bank, $payload);
    }

    public function deleteBank(Bank $bank): bool
    {
        return $this->banks->delete($bank);
    }
}
