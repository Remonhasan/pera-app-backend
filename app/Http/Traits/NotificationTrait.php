<?php

namespace App\Http\Traits;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

trait NotificationTrait
{
    public function createNotification(
        int $userId,
        string $type,
        string $title,
        string $message,
        ?string $link = null,
        ?array $data = null
    ): ?Notification {
        try {
            if (!Schema::hasTable('notifications')) {
                Log::error('Notifications table does not exist. Please run migrations.');
                return null;
            }

            $user = User::find($userId);
            if (!$user) {
                Log::warning("User not found for notification: user_id={$userId}");
                return null;
            }

            return Notification::create([
                'user_id' => $userId,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'link' => $link,
                'data' => $data,
                'is_read' => false,
            ]);
        } catch (\Throwable $th) {
            Log::error('Notification creation failed: ' . $th->getMessage(), [
                'user_id' => $userId,
                'type' => $type,
                'title' => $title,
            ]);
            return null;
        }
    }
}

