<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuthUserResource;
use App\Http\Traits\ApiResponseTrait;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AdminAuthController extends Controller
{
    use ApiResponseTrait;

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()
            ->where('email', $validated['email'])
            ->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return $this->errorResponse(
                trans('auth.failed'),
                422,
                ['email' => [trans('auth.failed')]],
            );
        }

        if (! $user->status) {
            return $this->errorResponse(
                'Your account is inactive.',
                422,
                ['email' => ['Your account is inactive.']],
            );
        }

        if ($user->hasRole(User::MEMBER_ROLE, User::MEMBER_GUARD)) {
            return $this->errorResponse(
                'You do not have permission to access the admin API.',
                422,
                ['email' => ['You do not have permission to access the admin API.']],
            );
        }

        if ($user->hasRole('user')) {
            return $this->errorResponse(
                'You do not have permission to access the admin API.',
                422,
                ['email' => ['You do not have permission to access the admin API.']],
            );
        }

        if (! $user->roles()->where('guard_name', User::ADMIN_GUARD)->exists()) {
            return $this->errorResponse(
                'You do not have permission to access the admin API.',
                422,
                ['email' => ['You do not have permission to access the admin API.']],
            );
        }

        $user->load('roles');
        $user->update(['last_login_at' => now()]);
        $token = JWTAuth::fromUser($user);

        return $this->successResponse([
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => JWTAuth::factory()->getTTL() * 60,
            'user' => new AuthUserResource($user),
        ], 'Login successful.');
    }
}
