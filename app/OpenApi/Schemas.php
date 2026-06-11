<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'ApiSuccessResponse',
    properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'message', type: 'string', example: 'Success'),
        new OA\Property(property: 'data', type: 'object', nullable: true),
    ],
)]
#[OA\Schema(
    schema: 'ApiErrorResponse',
    properties: [
        new OA\Property(property: 'success', type: 'boolean', example: false),
        new OA\Property(property: 'message', type: 'string', example: 'An error occurred'),
        new OA\Property(property: 'errors', type: 'object', nullable: true),
    ],
)]
#[OA\Schema(
    schema: 'MemberLoginRequest',
    required: ['phone', 'password'],
    properties: [
        new OA\Property(property: 'phone', type: 'string', example: '01712345678'),
        new OA\Property(property: 'password', type: 'string', format: 'password', example: 'Abc1234!'),
    ],
)]
#[OA\Schema(
    schema: 'AdminLoginRequest',
    required: ['email', 'password'],
    properties: [
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'admin@gmail.com'),
        new OA\Property(property: 'password', type: 'string', format: 'password', example: 'Abc1234!'),
    ],
)]
#[OA\Schema(
    schema: 'LoginResponse',
    properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'message', type: 'string', example: 'Login successful.'),
        new OA\Property(
            property: 'data',
            properties: [
                new OA\Property(property: 'token', type: 'string'),
                new OA\Property(property: 'token_type', type: 'string', example: 'bearer'),
                new OA\Property(property: 'expires_in', type: 'integer', example: 3600),
                new OA\Property(property: 'user', ref: '#/components/schemas/AuthUser'),
            ],
            type: 'object',
        ),
    ],
)]
#[OA\Schema(
    schema: 'AuthUser',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'name', type: 'string', example: 'John Doe'),
        new OA\Property(property: 'phone', type: 'string', nullable: true, example: '01712345678'),
        new OA\Property(property: 'email', type: 'string', format: 'email', nullable: true),
        new OA\Property(property: 'image', type: 'string', nullable: true),
        new OA\Property(property: 'status', type: 'boolean', example: true),
        new OA\Property(property: 'last_login_at', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'account_type', type: 'string', enum: ['admin', 'member'], example: 'admin'),
        new OA\Property(
            property: 'roles',
            type: 'array',
            items: new OA\Items(
                properties: [
                    new OA\Property(property: 'name', type: 'string'),
                    new OA\Property(property: 'guard_name', type: 'string'),
                    new OA\Property(property: 'label', type: 'string', nullable: true),
                ],
                type: 'object',
            ),
        ),
        new OA\Property(
            property: 'permissions',
            type: 'array',
            items: new OA\Items(type: 'string'),
            example: ['budget_list', 'user_create'],
        ),
    ],
)]
#[OA\Schema(
    schema: 'DateRangeFilters',
    properties: [
        new OA\Property(property: 'date_from', type: 'string', format: 'date', nullable: true),
        new OA\Property(property: 'date_to', type: 'string', format: 'date', nullable: true),
    ],
)]
class Schemas
{
}
