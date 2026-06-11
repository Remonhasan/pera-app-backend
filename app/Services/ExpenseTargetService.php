<?php

namespace App\Services;

use App\Models\ExpenseTarget;
use App\Models\User;
use App\Repositories\Contracts\ExpenseTargetRepositoryInterface;
use Illuminate\Support\Collection;

class ExpenseTargetService
{
    public function __construct(private readonly ExpenseTargetRepositoryInterface $expenseTargets) {}

    public function listExpenseTargets(): Collection
    {
        return $this->expenseTargets->allWithRelations();
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
    public function createExpenseTarget(array $validated): ?ExpenseTarget
    {
        return $this->expenseTargets->create([
            'user_id' => isset($validated['user_id'])
                ? (int) $validated['user_id']
                : null,
            'budget_type_id' => (int) $validated['budget_type_id'],
            'month' => (int) $validated['month'],
            'year' => (int) $validated['year'],
            'amount' => $validated['amount'],
            'status' => $validated['status'] ?? true,
        ]);
    }

    /** @param  array<string, mixed>  $validated */
    public function updateExpenseTarget(ExpenseTarget $expenseTarget, array $validated): bool
    {
        $payload = [];

        if (array_key_exists('user_id', $validated)) {
            $payload['user_id'] = $validated['user_id'] !== null
                ? (int) $validated['user_id']
                : null;
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
        if (array_key_exists('amount', $validated)) {
            $payload['amount'] = $validated['amount'];
        }
        if (array_key_exists('status', $validated)) {
            $payload['status'] = (bool) $validated['status'];
        }

        return $this->expenseTargets->update($expenseTarget, $payload);
    }

    public function deleteExpenseTarget(ExpenseTarget $expenseTarget): bool
    {
        return $this->expenseTargets->delete($expenseTarget);
    }
}
