<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Get notifications for the authenticated user
     * (all notifications, with unread count returned separately)
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $limit = $request->get('limit', 10);
        $page = $request->get('page', 1);

        // Get counts
        $totalUnread = Notification::where('user_id', $user->id)->unread()->count();
        $totalNotifications = Notification::where('user_id', $user->id)->count();

        // Return all notifications with pagination (read + unread)
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $limit)
            ->take($limit)
            ->get();

        // Check if this is an Inertia request (shouldn't happen, but handle it)
        if ($request->header('X-Inertia')) {
            // Redirect to the notifications page route instead
            return redirect()->route('administrative.notifications.page');
        }

        // Return JSON for API/AJAX requests
        return response()->json([
            'success' => true,
            'notifications' => $notifications,
            'unread_count' => $totalUnread,
            'total' => $totalNotifications,
            'current_page' => $page,
            'per_page' => $limit,
            'last_page' => ceil($totalNotifications / $limit),
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, Notification $notification)
    {
        if ($notification->user_id !== auth()->id()) {
            // Check if Inertia request
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('error', 'Unauthorized');
            }
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $notification->markAsRead();

        // Check if Inertia request
        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('success', 'Notification marked as read');
        }

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read',
            'unread_count' => Notification::where('user_id', auth()->id())->unread()->count(),
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        Notification::where('user_id', auth()->id())
            ->unread()
            ->update(['is_read' => true]);

        // Check if Inertia request
        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('success', 'All notifications marked as read');
        }

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read',
            'unread_count' => 0,
        ]);
    }

    /**
     * Get unread count
     */
    public function unreadCount(Request $request)
    {
        $count = Notification::where('user_id', auth()->id())
            ->unread()
            ->count();

        // Check if Inertia request
        if ($request->header('X-Inertia')) {
            return redirect()->route('administrative.notifications.page');
        }

        return response()->json([
            'success' => true,
            'unread_count' => $count,
        ]);
    }

    /**
     * Get notifications page (all notifications, no pagination)
     */
    public function page(Request $request)
    {
        $user = auth()->user();

        // Return all notifications (read + unread)
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // If it's an AJAX request, return JSON
        if ($request->expectsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'notifications' => $notifications,
            ]);
        }

        // Otherwise, return Inertia page
        return Inertia::render('Administrative/Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }
}
