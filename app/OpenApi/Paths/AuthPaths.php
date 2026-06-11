<?php

namespace App\OpenApi\Paths;

use OpenApi\Attributes as OA;

#[OA\Post(
    path: '/login',
    operationId: 'memberLogin',
    summary: 'Member login',
    description: 'Authenticate a member using phone number and password. Returns a JWT bearer token.',
    tags: ['Authentication'],
    security: [],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/MemberLoginRequest'),
    ),
    responses: [
        new OA\Response(response: 200, description: 'Login successful', content: new OA\JsonContent(ref: '#/components/schemas/LoginResponse')),
        new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ApiErrorResponse')),
    ],
)]
#[OA\Post(
    path: '/admin/login',
    operationId: 'adminLogin',
    summary: 'Admin login',
    description: 'Authenticate an administrator using email and password. Returns a JWT bearer token with roles and permissions.',
    tags: ['Authentication'],
    security: [],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/AdminLoginRequest'),
    ),
    responses: [
        new OA\Response(response: 200, description: 'Login successful', content: new OA\JsonContent(ref: '#/components/schemas/LoginResponse')),
        new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ApiErrorResponse')),
    ],
)]
#[OA\Get(
    path: '/me',
    operationId: 'getAuthenticatedUser',
    summary: 'Get authenticated user',
    description: 'Returns the current user profile, roles, and permissions.',
    tags: ['Authentication'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Authenticated user',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string'),
                    new OA\Property(property: 'data', ref: '#/components/schemas/AuthUser'),
                ],
            ),
        ),
        new OA\Response(response: 401, description: 'Unauthenticated'),
    ],
)]
#[OA\Post(
    path: '/logout',
    operationId: 'logout',
    summary: 'Logout',
    description: 'Invalidate the current JWT token.',
    tags: ['Authentication'],
    responses: [
        new OA\Response(response: 200, description: 'Logout successful', content: new OA\JsonContent(ref: '#/components/schemas/ApiSuccessResponse')),
        new OA\Response(response: 401, description: 'Unauthenticated'),
    ],
)]
class AuthPaths
{
}
