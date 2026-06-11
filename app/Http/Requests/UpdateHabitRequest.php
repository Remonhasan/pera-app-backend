<?php

namespace App\Http\Requests;

use App\Models\Habit;
use App\Models\User;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateHabitRequest extends FormRequest
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

        if ($this->has('user_ids')) {
            $merge['user_ids'] = $this->normalizeArrayInput('user_ids');
        }

        if ($merge !== []) {
            $this->merge($merge);
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'user_ids' => ['sometimes', 'required', 'array', 'min:1'],
            'user_ids.*' => ['integer', $this->memberUserRule()],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['boolean'],
            'habit_status' => ['sometimes', 'required', 'string', Rule::in(Habit::HABIT_STATUSES)],
        ];
    }

    private function normalizeArrayInput(string $key): array
    {
        $value = $this->input($key);

        if ($value === null || $value === '') {
            return [];
        }

        return is_array($value) ? $value : [$value];
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
