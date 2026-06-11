<?php

namespace App\OpenApi\Paths;

use OpenApi\Attributes as OA;

#[OA\Get(
    path: '/dashboard',
    operationId: 'memberDashboard',
    summary: 'Member dashboard',
    description: 'Returns dashboard data for the authenticated member.',
    tags: ['Dashboard'],
    parameters: [
        new OA\Parameter(name: 'date_from', in: 'query', schema: new OA\Schema(type: 'string', format: 'date')),
        new OA\Parameter(name: 'date_to', in: 'query', schema: new OA\Schema(type: 'string', format: 'date')),
    ],
    responses: [
        new OA\Response(response: 200, description: 'Dashboard data', content: new OA\JsonContent(ref: '#/components/schemas/ApiSuccessResponse')),
        new OA\Response(response: 403, description: 'Forbidden'),
    ],
)]
#[OA\Get(
    path: '/admin/dashboard',
    operationId: 'adminDashboard',
    summary: 'Admin dashboard',
    description: 'Returns admin dashboard widgets based on user permissions.',
    tags: ['Dashboard'],
    parameters: [
        new OA\Parameter(name: 'date_from', in: 'query', schema: new OA\Schema(type: 'string', format: 'date')),
        new OA\Parameter(name: 'date_to', in: 'query', schema: new OA\Schema(type: 'string', format: 'date')),
    ],
    responses: [
        new OA\Response(response: 200, description: 'Dashboard data', content: new OA\JsonContent(ref: '#/components/schemas/ApiSuccessResponse')),
        new OA\Response(response: 403, description: 'Forbidden'),
    ],
)]
#[OA\Get(
    path: '/members',
    operationId: 'listMembers',
    summary: 'List members',
    description: 'List all members. Available to members and admins with user_list permission.',
    tags: ['Members'],
    responses: [
        new OA\Response(response: 200, description: 'Members list', content: new OA\JsonContent(ref: '#/components/schemas/ApiSuccessResponse')),
    ],
)]
#[OA\Get(
    path: '/notices',
    operationId: 'listMemberNotices',
    summary: 'List active notices (member)',
    tags: ['Notices'],
    responses: [
        new OA\Response(response: 200, description: 'Notices list', content: new OA\JsonContent(ref: '#/components/schemas/ApiSuccessResponse')),
    ],
)]
#[OA\Post(
    path: '/files/upload',
    operationId: 'uploadFile',
    summary: 'Upload file',
    description: 'Upload a file (image, document, etc.). Admin only.',
    tags: ['Files'],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(
                required: ['file'],
                properties: [new OA\Property(property: 'file', type: 'string', format: 'binary')],
            ),
        ),
    ),
    responses: [
        new OA\Response(response: 200, description: 'File uploaded', content: new OA\JsonContent(ref: '#/components/schemas/ApiSuccessResponse')),
    ],
)]
#[OA\Post(
    path: '/files/delete',
    operationId: 'deleteFile',
    summary: 'Delete file',
    tags: ['Files'],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['filePath'],
            properties: [new OA\Property(property: 'filePath', type: 'string', example: 'uploads/example.jpg')],
        ),
    ),
    responses: [
        new OA\Response(response: 200, description: 'File deleted', content: new OA\JsonContent(ref: '#/components/schemas/ApiSuccessResponse')),
    ],
)]
class MiscPaths
{
}
