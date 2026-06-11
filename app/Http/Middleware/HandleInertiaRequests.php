<?php

namespace App\Http\Middleware;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        try {
            $user = $request->user();

            // Optimize user data to reduce header size
            $userData = null;
            if ($user) {
                $roleNames = $user->roles()->pluck('name')->toArray();
                $userData = [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'image' => $user->image,
                    'roles' => array_map(fn ($name) => ['name' => $name], $roleNames),
                ];
            }

            $permissions = [];
            if ($user) {
                $permissions = $user->getAllPermissions()->pluck('name')->toArray();
            }

            $unreadCount = 0;
            if ($user) {
                $unreadCount = Notification::where('user_id', $user->id)->unread()->count();
            }

            return [
                ...parent::share($request),
                'admin_locale' => fn () => $request->session()->get('admin_locale', 'en'),
                'auth' => [
                    'user' => $userData,
                    'permissions' => $permissions,
                ],
                'flash' => [
                    'success' => fn () => $request->session()->get('success'),
                    'error' => fn () => $request->session()->get('error'),
                    'info' => fn () => $request->session()->get('info'),
                    'warning' => fn () => $request->session()->get('warning'),
                ],
                'csrf_token' => csrf_token(),
                'unread_notifications_count' => $unreadCount,
            ];
        } catch (\Throwable $e) {
            Log::error('HandleInertiaRequests share failed: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                ...parent::share($request),
                'admin_locale' => fn () => $request->session()->get('admin_locale', 'en'),
                'auth' => ['user' => null, 'permissions' => []],
                'flash' => [
                    'success' => fn () => null,
                    'error' => fn () => null,
                    'info' => fn () => null,
                    'warning' => fn () => null,
                ],
                'csrf_token' => csrf_token(),
                'unread_notifications_count' => 0,
            ];
        }
    }
}
