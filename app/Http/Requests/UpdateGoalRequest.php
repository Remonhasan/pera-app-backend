<?php

namespace App\Http\Requests;

use App\Models\Goal;
use App\Models\User;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGoalRequest extends FormRequest
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

        foreach (['user_id', 'bank_id', 'saving_type_id'] as $key) {
            if ($this->has($key) && $this->input($key) === '') {
                $merge[$key] = null;
            }
        }

        if ($this->has('description') && $this->input('description') === '') {
            $merge['description'] = null;
        }
        if ($this->has('drive_link') && $this->input('drive_link') === '') {
            $merge['drive_link'] = null;
        }

        if ($merge !== []) {
            $this->merge($merge);
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'user_id' => ['nullable', 'integer', $this->memberUserRule()],
            'bank_id' => ['nullable', 'integer', Rule::exists('banks', 'id')],
            'saving_type_id' => ['nullable', 'integer', Rule::exists('saving_types', 'id')],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['sometimes', 'required', 'date', 'after_or_equal:start_date'],
            'amount' => ['sometimes', 'required', 'numeric', 'min:0', 'max:99999999.99'],
            'description' => ['nullable', 'string'],
            'drive_link' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'status' => ['boolean'],
            'goal_status' => ['sometimes', 'required', 'string', Rule::in(Goal::GOAL_STATUSES)],
        ];
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
