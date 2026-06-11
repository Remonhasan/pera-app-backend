<?php

namespace App\Http\Requests;

use App\Models\User;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExpenseTargetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'status' => $this->boolean('status', true),
            'user_id' => $this->nullableInteger('user_id'),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'user_id' => ['nullable', 'integer', $this->memberUserRule()],
            'budget_type_id' => ['required', 'integer', Rule::exists('budget_types', 'id')],
            'month' => ['required', 'integer', 'min:1', 'max:12'],
            'year' => ['required', 'integer', 'min:2000', 'max:2100'],
            'amount' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'status' => ['boolean'],
        ];
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
            if ($value === null) {
                return;
            }

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
