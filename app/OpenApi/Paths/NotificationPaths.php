<?php

namespace App\OpenApi\Paths;

use OpenApi\Attributes as OA;

#[OA\Get(path: '/notifications', operationId: 'listNotifications', summary: 'List notifications (paginated)', tags: ['Notifications'], parameters: [
    new OA\Parameter(name: 'page', in: 'query', schema: new OA\Schema(type: 'integer', default: 1)),
    new OA\Parameter(name: 'limit', in: 'query', schema: new OA\Schema(type: 'integer', default: 10)),
], responses: [new OA\Response(response: 200, description: 'Notifications', content: new OA\JsonContent(ref: '#/components/schemas/ApiSuccessResponse'))])]
#[OA\Get(path: '/notifications/page', operationId: 'listAllNotifications', summary: 'List all notifications', tags: ['Notifications'], responses: [new OA\Response(response: 200, description: 'All notifications', content: new OA\JsonContent(ref: '#/components/schemas/ApiSuccessResponse'))])]
#[OA\Post(path: '/notifications/mark-as-read/{notification}', operationId: 'markNotificationRead', summary: 'Mark notification as read', tags: ['Notifications'], parameters: [new OA\Parameter(name: 'notification', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'Marked as read', content: new OA\JsonContent(ref: '#/components/schemas/ApiSuccessResponse'))])]
#[OA\Post(path: '/notifications/mark-all-as-read', operationId: 'markAllNotificationsRead', summary: 'Mark all notifications as read', tags: ['Notifications'], responses: [new OA\Response(response: 200, description: 'All marked as read', content: new OA\JsonContent(ref: '#/components/schemas/ApiSuccessResponse'))])]
#[OA\Get(path: '/notifications/unread-count', operationId: 'notificationUnreadCount', summary: 'Get unread notification count', tags: ['Notifications'], responses: [new OA\Response(response: 200, description: 'Unread count', content: new OA\JsonContent(ref: '#/components/schemas/ApiSuccessResponse'))])]
class NotificationPaths
{
}
