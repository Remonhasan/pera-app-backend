<?php

namespace App\Services;

use App\Models\ExpenseType;
use App\Repositories\Contracts\ExpenseTypeRepositoryInterface;
use Illuminate\Support\Collection;

class ExpenseTypeService
{
    public function __construct(private readonly ExpenseTypeRepositoryInterface $expenseTypes) {}

    public function listExpenseTypes(): Collection
    {
        return $this->expenseTypes->all();
    }

    /** @return list<array{id: int, name: string}> */
    public function expenseTypeOptions(): array
    {
        return ExpenseType::query()
            ->where('status', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (ExpenseType $type) => [
                'id' => $type->id,
                'name' => $type->name,
            ])
            ->all();
    }

    /** @param  array<string, mixed>  $validated */
    public function createExpenseType(array $validated): ?ExpenseType
    {
        return $this->expenseTypes->create([
            'name' => $validated['name'],
            'status' => $validated['status'] ?? true,
        ]);
    }

    /** @param  array<string, mixed>  $validated */
    public function updateExpenseType(ExpenseType $expenseType, array $validated): bool
    {
        $payload = [];

        if (array_key_exists('name', $validated)) {
            $payload['name'] = $validated['name'];
        }
        if (array_key_exists('status', $validated)) {
            $payload['status'] = (bool) $validated['status'];
        }

        return $this->expenseTypes->update($expenseType, $payload);
    }

    public function deleteExpenseType(ExpenseType $expenseType): bool
    {
        return $this->expenseTypes->delete($expenseType);
    }
}
