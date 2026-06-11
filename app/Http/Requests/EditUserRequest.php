<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Services\UserService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class EditUserRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $merge = [
            'password' => $this->password === '' ? null : $this->password,
        ];

        if ($this->has('clear_user_image')) {
            $merge['clear_user_image'] = $this->boolean('clear_user_image');
        }

        if ($this->has('clear_user_signature')) {
            $merge['clear_user_signature'] = $this->boolean('clear_user_signature');
        }

        $this->merge($merge);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => [
                'required',
                'email',
                'lowercase',
                Rule::unique(User::class, 'email')->ignore(optional($this->route('user'))->id),
            ],
            'password' => ['nullable', 'string', 'min:8'],
            'image' => ['nullable', 'image', 'max:5120'],
            'signature' => ['nullable', 'image', 'max:5120'],
            'clear_user_image' => ['sometimes', 'boolean'],
            'clear_user_signature' => ['sometimes', 'boolean'],
            'status' => ['required', 'integer', Rule::in([0, 1])],
            'role' => [
                'required',
                'string',
                Rule::exists('roles', 'name')->where(
                    fn ($query) => $query->where(
                        'guard_name',
                        User::guardForRoleName((string) $this->input('role', '')),
                    ),
                ),
                function ($attribute, $value, $fail) {
                    $role = User::findRoleByName((string) $value);
                    if (!$role) {
                        return;
                    }

                    $userService = app(UserService::class);
                    if (!$userService->canCreateRole($this->user(), $role->name)) {
                        $fail('You do not have permission to assign the ' . $role->name . ' role.');
                    }
                },
            ],
        ];
    }
}

