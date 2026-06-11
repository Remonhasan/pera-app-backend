<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;

    public function index(Request $request): JsonResponse
    {
        $this->authorizeApiPermission('notification_list');

        $user = $this->apiUser();
        $limit = (int) $request->get('limit', 10);
        $page = (int) $request->get('page', 1);

        $totalUnread = Notification::query()->where('user_id', $user->id)->unread()->count();
        $totalNotifications = Notification::query()->where('user_id', $user->id)->count();

        $notifications = Notification::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->skip(($page - 1) * $limit)
            ->take($limit)
            ->get();

        return $this->successResponse([
            'notifications' => $notifications,
            'unread_count' => $totalUnread,
            'total' => $totalNotifications,
            'current_page' => $page,
            'per_page' => $limit,
            'last_page' => (int) ceil($totalNotifications / max($limit, 1)),
        ], 'Notifications retrieved successfully.');
    }

    public function page(): JsonResponse
    {
        $this->authorizeApiPermission('notification_list');

        $notifications = Notification::query()
            ->where('user_id', $this->apiUser()->id)
            ->orderByDesc('created_at')
            ->get();

        return $this->successResponse([
            'notifications' => $notifications,
        ], 'Notifications retrieved successfully.');
    }

    public function markAsRead(Notification $notification): JsonResponse
    {
        $this->authorizeApiPermission('notification_list');

        if ($notification->user_id !== $this->apiUser()->id) {
            return $this->errorResponse('Unauthorized.', 403);
        }

        $notification->markAsRead();

        return $this->successResponse([
            'unread_count' => Notification::query()
                ->where('user_id', $this->apiUser()->id)
                ->unread()
                ->count(),
        ], 'Notification marked as read.');
    }

    public function markAllAsRead(): JsonResponse
    {
        $this->authorizeApiPermission('notification_list');

        Notification::query()
            ->where('user_id', $this->apiUser()->id)
            ->unread()
            ->update(['is_read' => true]);

        return $this->successResponse([
            'unread_count' => 0,
        ], 'All notifications marked as read.');
    }

    public function unreadCount(): JsonResponse
    {
        $this->authorizeApiPermission('notification_list');

        $count = Notification::query()
            ->where('user_id', $this->apiUser()->id)
            ->unread()
            ->count();

        return $this->successResponse([
            'unread_count' => $count,
        ], 'Unread notification count retrieved successfully.');
    }
}
