<?php

namespace App\Services;

use App\Models\SavingType;
use App\Repositories\Contracts\SavingTypeRepositoryInterface;
use Illuminate\Support\Collection;

class SavingTypeService
{
    public function __construct(private readonly SavingTypeRepositoryInterface $savingTypes) {}

    public function listSavingTypes(): Collection
    {
        return $this->savingTypes->all();
    }

    /** @return list<array{id: int, name: string}> */
    public function savingTypeOptions(): array
    {
        return SavingType::query()
            ->where('status', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (SavingType $type) => [
                'id' => $type->id,
                'name' => $type->name,
            ])
            ->all();
    }

    /** @param  array<string, mixed>  $validated */
    public function createSavingType(array $validated): ?SavingType
    {
        return $this->savingTypes->create([
            'name' => $validated['name'],
            'status' => $validated['status'] ?? true,
        ]);
    }

    /** @param  array<string, mixed>  $validated */
    public function updateSavingType(SavingType $savingType, array $validated): bool
    {
        $payload = [];

        if (array_key_exists('name', $validated)) {
            $payload['name'] = $validated['name'];
        }
        if (array_key_exists('status', $validated)) {
            $payload['status'] = (bool) $validated['status'];
        }

        return $this->savingTypes->update($savingType, $payload);
    }

    public function deleteSavingType(SavingType $savingType): bool
    {
        return $this->savingTypes->delete($savingType);
    }
}
