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

class MemberAuthController extends Controller
{
    use ApiResponseTrait;

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()
            ->memberRole()
            ->wherePhone($validated['phone'])
            ->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return $this->errorResponse(
                trans('auth.failed'),
                422,
                ['phone' => [trans('auth.failed')]],
            );
        }

        if (! $user->status) {
            return $this->errorResponse(
                'Your account is inactive.',
                422,
                ['phone' => ['Your account is inactive.']],
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

    public function logout(): JsonResponse
    {
        auth('api')->logout();

        return $this->successResponse(null, 'Logout successful.');
    }
}
