<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\Expense;
use App\Models\User;
use App\Repositories\Contracts\ExpenseRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class ExpenseService
{
    public function __construct(private readonly ExpenseRepositoryInterface $expenses) {}

    public function listExpenses(): Collection
    {
        return $this->expenses->allWithRelations();
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
    public function createExpense(array $validated, ?UploadedFile $imageFile, ?int $actorId): ?Expense
    {
        $payload = [
            'user_id' => (int) $validated['user_id'],
            'expense_type_id' => (int) $validated['expense_type_id'],
            'budget_type_id' => isset($validated['budget_type_id'])
                ? (int) $validated['budget_type_id']
                : null,
            'name' => $validated['name'],
            'month' => (int) $validated['month'],
            'year' => (int) $validated['year'],
            'date' => $validated['date'] ?? null,
            'amount' => $validated['amount'],
            'description' => $validated['description'] ?? null,
            'drive_link' => $validated['drive_link'] ?? null,
            'image' => $imageFile ? $imageFile->store('uploads', 'public_dir') : null,
            'status' => $validated['status'] ?? true,
        ];

        $payload['budget_id'] = $this->resolveBudgetId($payload);

        if ($actorId !== null) {
            $payload['created_by'] = $actorId;
            $payload['updated_by'] = $actorId;
        }

        return $this->expenses->create($payload);
    }

    /** @param  array<string, mixed>  $validated */
    public function updateExpense(
        Expense $expense,
        array $validated,
        ?UploadedFile $imageFile,
        bool $clearImage,
        ?int $actorId,
    ): bool {
        $payload = [];

        if (array_key_exists('user_id', $validated)) {
            $payload['user_id'] = (int) $validated['user_id'];
        }
        if (array_key_exists('expense_type_id', $validated)) {
            $payload['expense_type_id'] = (int) $validated['expense_type_id'];
        }
        if (array_key_exists('budget_type_id', $validated)) {
            $payload['budget_type_id'] = $validated['budget_type_id'] !== null
                ? (int) $validated['budget_type_id']
                : null;
        }
        if (array_key_exists('name', $validated)) {
            $payload['name'] = $validated['name'];
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
        if (array_key_exists('description', $validated)) {
            $payload['description'] = $validated['description'];
        }
        if (array_key_exists('drive_link', $validated)) {
            $payload['drive_link'] = $validated['drive_link'];
        }
        if (array_key_exists('status', $validated)) {
            $payload['status'] = (bool) $validated['status'];
        }
        if ($actorId !== null) {
            $payload['updated_by'] = $actorId;
        }

        if (
            array_key_exists('user_id', $payload)
            || array_key_exists('budget_type_id', $payload)
            || array_key_exists('month', $payload)
            || array_key_exists('year', $payload)
        ) {
            $payload['budget_id'] = $this->resolveBudgetId([
                'user_id' => $payload['user_id'] ?? $expense->user_id,
                'budget_type_id' => $payload['budget_type_id'] ?? $expense->budget_type_id,
                'month' => $payload['month'] ?? $expense->month,
                'year' => $payload['year'] ?? $expense->year,
            ]);
        }

        if ($imageFile) {
            if ($expense->image) {
                Storage::disk('public_dir')->delete($expense->image);
            }
            $payload['image'] = $imageFile->store('uploads', 'public_dir');
        } elseif ($clearImage && $expense->image) {
            Storage::disk('public_dir')->delete($expense->image);
            $payload['image'] = null;
        }

        return $this->expenses->update($expense, $payload);
    }

    public function deleteExpense(Expense $expense): bool
    {
        if ($expense->image) {
            Storage::disk('public_dir')->delete($expense->image);
        }

        return $this->expenses->delete($expense);
    }

    /** @param  array{user_id?: int|null, budget_type_id?: int|null, month?: int|null, year?: int|null}  $data */
    private function resolveBudgetId(array $data): ?int
    {
        $userId = $data['user_id'] ?? null;
        $budgetTypeId = $data['budget_type_id'] ?? null;
        $month = $data['month'] ?? null;
        $year = $data['year'] ?? null;

        if ($userId === null || $budgetTypeId === null || $month === null || $year === null) {
            return null;
        }

        return Budget::query()
            ->where('user_id', (int) $userId)
            ->where('budget_type_id', (int) $budgetTypeId)
            ->where('month', (int) $month)
            ->where('year', (int) $year)
            ->value('id');
    }
}
