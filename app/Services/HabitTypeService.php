<?php

namespace App\Services;

use App\Models\HabitType;
use App\Repositories\Contracts\HabitTypeRepositoryInterface;
use Illuminate\Support\Collection;

class HabitTypeService
{
    public function __construct(private readonly HabitTypeRepositoryInterface $habitTypes) {}

    public function listHabitTypes(): Collection
    {
        return $this->habitTypes->all();
    }

    /** @param  array<string, mixed>  $validated */
    public function createHabitType(array $validated): ?HabitType
    {
        return $this->habitTypes->create([
            'name' => $validated['name'],
            'status' => $validated['status'] ?? true,
        ]);
    }

    /** @param  array<string, mixed>  $validated */
    public function updateHabitType(HabitType $habitType, array $validated): bool
    {
        $payload = [];

        if (array_key_exists('name', $validated)) {
            $payload['name'] = $validated['name'];
        }
        if (array_key_exists('status', $validated)) {
            $payload['status'] = (bool) $validated['status'];
        }

        return $this->habitTypes->update($habitType, $payload);
    }

    public function deleteHabitType(HabitType $habitType): bool
    {
        return $this->habitTypes->delete($habitType);
    }
}
