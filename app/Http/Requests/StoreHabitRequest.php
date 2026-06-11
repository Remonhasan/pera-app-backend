<?php

namespace App\Http\Requests;

use App\Models\Habit;
use App\Models\User;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreHabitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $merge = [
            'status' => $this->boolean('status', true),
            'habit_status' => $this->input('habit_status', Habit::STATUS_PENDING),
        ];

        if ($this->has('user_ids')) {
            $merge['user_ids'] = $this->normalizeArrayInput('user_ids');
        }

        $this->merge($merge);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['integer', $this->memberUserRule()],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['boolean'],
            'habit_status' => ['required', 'string', Rule::in(Habit::HABIT_STATUSES)],
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
