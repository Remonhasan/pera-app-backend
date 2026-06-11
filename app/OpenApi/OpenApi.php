<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\OpenApi(
    info: new OA\Info(
        title: 'Pera Mobile API',
        version: '1.0.0',
        description: 'REST API for the Pera mobile application. Supports admin and member authentication via JWT bearer tokens. Admin endpoints require Spatie web-guard permissions (e.g. budget_list, user_create).',
    ),
    servers: [
        new OA\Server(url: '/api', description: 'API base path'),
    ],
    security: [['bearerAuth' => []]],
    tags: [
        new OA\Tag(name: 'Authentication', description: 'Login, logout, and current user'),
        new OA\Tag(name: 'Dashboard', description: 'Admin and member dashboards'),
        new OA\Tag(name: 'Users & Access', description: 'Users, roles, and permissions'),
        new OA\Tag(name: 'Finance', description: 'Budgets, expenses, savings, and goals'),
        new OA\Tag(name: 'Study', description: 'Subjects, topics, notes, study goals, and exams'),
        new OA\Tag(name: 'Tasks & Habits', description: 'Task and habit management'),
        new OA\Tag(name: 'Notices', description: 'Member notices and admin notice management'),
        new OA\Tag(name: 'Reports', description: 'Administrative reports and PDF exports'),
        new OA\Tag(name: 'Notifications', description: 'In-app notifications'),
        new OA\Tag(name: 'Files', description: 'File upload and delete'),
        new OA\Tag(name: 'Members', description: 'Member list for mobile'),
    ],
)]
#[OA\SecurityScheme(
    securityScheme: 'bearerAuth',
    type: 'http',
    description: 'JWT token from POST /api/login or POST /api/admin/login. Format: Bearer {token}',
    scheme: 'bearer',
    bearerFormat: 'JWT',
)]
class OpenApi
{
}
