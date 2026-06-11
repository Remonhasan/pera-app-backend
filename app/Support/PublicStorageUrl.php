<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

class PublicStorageUrl
{
    public static function fromPath(?string $path): ?string
    {
        if ($path === null || trim($path) === '') {
            return null;
        }

        $normalized = trim(str_replace('\\', '/', $path));

        if (preg_match('/^https?:\/\//i', $normalized)) {
            return $normalized;
        }

        return Storage::disk('public_dir')->url(ltrim($normalized, '/'));
    }
}
