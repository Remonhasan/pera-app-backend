<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuthUserResource;
use App\Http\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    use ApiResponseTrait;

    public function me(): JsonResponse
    {
        $user = auth('api')->user();
        $user->load('roles');

        return $this->successResponse(
            new AuthUserResource($user),
            'Authenticated user retrieved successfully.',
        );
    }
}
