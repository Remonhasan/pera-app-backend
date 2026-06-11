<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Services\UserService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['required', 'email', 'lowercase', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
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
                        $fail('You do not have permission to create users with the ' . $role->name . ' role.');
                    }
                },
            ],
        ];
    }
}

