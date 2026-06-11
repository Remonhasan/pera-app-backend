<?php

namespace App\Http\Requests;

use App\Models\User;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $merge = [];

        if ($this->has('status')) {
            $merge['status'] = $this->boolean('status');
        }
        if ($this->has('description')) {
            $merge['description'] = $this->nullableString('description');
        }
        if ($this->has('drive_link')) {
            $merge['drive_link'] = $this->nullableString('drive_link');
        }
        if ($this->has('date')) {
            $merge['date'] = $this->nullableDate('date');
        }
        if ($this->has('clear_expense_image')) {
            $merge['clear_expense_image'] = $this->boolean('clear_expense_image');
        }
        if ($this->has('budget_type_id')) {
            $merge['budget_type_id'] = $this->nullableInteger('budget_type_id');
        }

        $this->merge($merge);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'user_id' => ['sometimes', 'required', 'integer', $this->memberUserRule()],
            'expense_type_id' => ['sometimes', 'required', 'integer', Rule::exists('expense_types', 'id')],
            'budget_type_id' => ['sometimes', 'nullable', 'integer', Rule::exists('budget_types', 'id')],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'month' => ['sometimes', 'required', 'integer', 'min:1', 'max:12'],
            'year' => ['sometimes', 'required', 'integer', 'min:2000', 'max:2100'],
            'date' => ['sometimes', 'nullable', 'date'],
            'amount' => ['sometimes', 'required', 'numeric', 'min:0', 'max:99999999.99'],
            'description' => ['sometimes', 'nullable', 'string', 'max:65535'],
            'drive_link' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'image' => ['nullable', 'image', 'max:5120'],
            'clear_expense_image' => ['sometimes', 'boolean'],
            'status' => ['sometimes', 'boolean'],
        ];
    }

    private function nullableString(string $key): ?string
    {
        $value = $this->input($key);
        if ($value === null || $value === '') {
            return null;
        }

        return is_string($value) ? trim($value) : null;
    }

    private function nullableDate(string $key): ?string
    {
        $value = $this->input($key);
        if ($value === null || $value === '') {
            return null;
        }

        return is_string($value) ? $value : null;
    }

    private function nullableInteger(string $key): ?int
    {
        $value = $this->input($key);
        if ($value === null || $value === '') {
            return null;
        }

        return is_numeric($value) ? (int) $value : null;
    }

    private function memberUserRule(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            $exists = User::query()
                ->whereKey($value)
                ->memberRole()
                ->exists();

            if (! $exists) {
                $fail('The selected member is invalid.');
            }
        };
    }
}
