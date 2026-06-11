<?php

namespace App\Services;

use App\Models\BudgetType;
use App\Repositories\Contracts\BudgetTypeRepositoryInterface;
use Illuminate\Support\Collection;

class BudgetTypeService
{
    public function __construct(private readonly BudgetTypeRepositoryInterface $budgetTypes) {}

    public function listBudgetTypes(): Collection
    {
        return $this->budgetTypes->all();
    }

    /** @return list<array{id: int, name: string}> */
    public function budgetTypeOptions(): array
    {
        return BudgetType::query()
            ->where('status', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (BudgetType $type) => [
                'id' => $type->id,
                'name' => $type->name,
            ])
            ->all();
    }

    /** @param  array<string, mixed>  $validated */
    public function createBudgetType(array $validated): ?BudgetType
    {
        return $this->budgetTypes->create([
            'name' => $validated['name'],
            'status' => $validated['status'] ?? true,
        ]);
    }

    /** @param  array<string, mixed>  $validated */
    public function updateBudgetType(BudgetType $budgetType, array $validated): bool
    {
        $payload = [];

        if (array_key_exists('name', $validated)) {
            $payload['name'] = $validated['name'];
        }
        if (array_key_exists('status', $validated)) {
            $payload['status'] = (bool) $validated['status'];
        }

        return $this->budgetTypes->update($budgetType, $payload);
    }

    public function deleteBudgetType(BudgetType $budgetType): bool
    {
        return $this->budgetTypes->delete($budgetType);
    }
}
