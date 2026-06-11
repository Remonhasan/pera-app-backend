<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Upload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FileUploadController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;

    /** @var array<string, string> */
    private const FILE_TYPES = [
        'jpg' => 'image',
        'jpeg' => 'image',
        'png' => 'image',
        'svg' => 'image',
        'webp' => 'webp',
        'gif' => 'gif',
        'mp4' => 'video',
        'mpg' => 'video',
        'mpeg' => 'video',
        'webm' => 'video',
        'ogg' => 'video',
        'avi' => 'video',
        'mov' => 'video',
        'flv' => 'video',
        'swf' => 'video',
        'mkv' => 'video',
        'wmv' => 'video',
        'wma' => 'audio',
        'aac' => 'audio',
        'wav' => 'audio',
        'mp3' => 'audio',
        'zip' => 'archive',
        'rar' => 'archive',
        '7z' => 'archive',
        'doc' => 'document',
        'txt' => 'document',
        'docx' => 'document',
        'pdf' => 'document',
        'csv' => 'document',
        'xml' => 'document',
        'ods' => 'document',
        'xlr' => 'document',
        'xls' => 'document',
        'xlsx' => 'document',
    ];

    public function upload(Request $request): JsonResponse
    {
        $this->authorizeApiAdmin();

        if (! $request->hasFile('file')) {
            return $this->errorResponse('No file uploaded.', 422);
        }

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());

        if (! isset(self::FILE_TYPES[$extension])) {
            return $this->errorResponse('Unsupported file type.', 422);
        }

        $fileOriginalName = explode('.', $file->getClientOriginalName());
        $path = $file->store('uploads', 'public_dir');
        $size = filesize(Storage::disk('public_dir')->path($path));

        Upload::query()->create([
            'file_original_name' => $fileOriginalName[0].'.'.$fileOriginalName[1],
            'file_name' => $path,
            'user_id' => $this->apiUser()->id,
            'type' => self::FILE_TYPES[$extension],
            'file_size' => $size,
            'extension' => $extension,
        ]);

        return $this->successResponse(['filePath' => $path], 'File uploaded successfully.');
    }

    public function delete(Request $request): JsonResponse
    {
        $this->authorizeApiAdmin();

        $validated = $request->validate([
            'filePath' => ['required', 'string'],
        ]);

        $filePath = $validated['filePath'];

        if (! Storage::disk('public_dir')->exists($filePath)) {
            return $this->errorResponse('File not found.', 404);
        }

        Storage::disk('public_dir')->delete($filePath);
        Upload::query()->where('file_name', $filePath)->delete();

        return $this->successResponse(null, 'File deleted successfully.');
    }
}
