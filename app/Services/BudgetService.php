<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\User;
use App\Repositories\Contracts\BudgetRepositoryInterface;
use Illuminate\Support\Collection;

class BudgetService
{
    public function __construct(private readonly BudgetRepositoryInterface $budgets) {}

    public function listBudgets(): Collection
    {
        return $this->budgets->allWithRelations();
    }

    /** @return list<array{id: int, name: string, phone: string|null}> */
    public function memberOptions(): array
    {
        return User::query()
            ->memberRole()
            ->orderBy('name')
            ->get(['id', 'name', 'phone'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
            ])
            ->all();
    }

    /** @param  array<string, mixed>  $validated */
    public function createBudget(array $validated, ?int $actorId): ?Budget
    {
        $payload = [
            'user_id' => (int) $validated['user_id'],
            'budget_type_id' => (int) $validated['budget_type_id'],
            'month' => (int) $validated['month'],
            'year' => (int) $validated['year'],
            'date' => $validated['date'] ?? null,
            'amount' => $validated['amount'],
            'status' => $validated['status'] ?? true,
        ];

        if ($actorId !== null) {
            $payload['created_by'] = $actorId;
            $payload['updated_by'] = $actorId;
        }

        return $this->budgets->create($payload);
    }

    /** @param  array<string, mixed>  $validated */
    public function updateBudget(Budget $budget, array $validated, ?int $actorId): bool
    {
        $payload = [];

        if (array_key_exists('user_id', $validated)) {
            $payload['user_id'] = (int) $validated['user_id'];
        }
        if (array_key_exists('budget_type_id', $validated)) {
            $payload['budget_type_id'] = (int) $validated['budget_type_id'];
        }
        if (array_key_exists('month', $validated)) {
            $payload['month'] = (int) $validated['month'];
        }
        if (array_key_exists('year', $validated)) {
            $payload['year'] = (int) $validated['year'];
        }
        if (array_key_exists('date', $validated)) {
            $payload['date'] = $validated['date'];
        }
        if (array_key_exists('amount', $validated)) {
            $payload['amount'] = $validated['amount'];
        }
        if (array_key_exists('status', $validated)) {
            $payload['status'] = (bool) $validated['status'];
        }
        if ($actorId !== null) {
            $payload['updated_by'] = $actorId;
        }

        return $this->budgets->update($budget, $payload);
    }

    public function deleteBudget(Budget $budget): bool
    {
        return $this->budgets->delete($budget);
    }
}
