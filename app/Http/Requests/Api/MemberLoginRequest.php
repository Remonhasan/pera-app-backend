<?php

namespace App\Http\Requests\Api;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class MemberLoginRequest extends FormRequest
{
    private ?User $authenticatedUser = null;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'phone' => ['required'],
            'password' => ['required'],
        ];
    }

    public function authenticate(): string
    {
        $user = User::query()
            ->memberRole()
            ->wherePhone((string) $this->input('phone'))
            ->first();
        if (! $user || ! Hash::check((string) $this->input('password'), $user->password)) {
            throw ValidationException::withMessages([
                'phone' => trans('auth.failed'),
            ]);
        }
       
        if (! $user->status) {
            throw ValidationException::withMessages([
                'phone' => 'Your account is inactive.',
            ]);
        }
        
        $user->update(['last_login_at' => now()]);

        $this->authenticatedUser = $user;

        return JWTAuth::fromUser($user);
    }

    public function authenticatedUser(): ?User
    {
        return $this->authenticatedUser;
    }
}
