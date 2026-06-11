<?php

namespace App\Http\Controllers\Api\Concerns;

use Illuminate\Http\UploadedFile;

trait NormalizesUploadedFiles
{
    private function normalizeUploadedFile(mixed $file): ?UploadedFile
    {
        return $file instanceof UploadedFile ? $file : null;
    }

    /** @return list<UploadedFile> */
    private function normalizeUploadedFiles(mixed $files): array
    {
        if ($files === null) {
            return [];
        }

        if ($files instanceof UploadedFile) {
            return [$files];
        }

        if (is_array($files)) {
            return array_values(array_filter(
                $files,
                fn ($file) => $file instanceof UploadedFile,
            ));
        }

        return [];
    }
}
