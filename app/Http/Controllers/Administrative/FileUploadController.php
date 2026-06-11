<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Models\Upload;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
Use Illuminate\Support\Facades\Auth;

class FileUploadController extends Controller
{
    public function upload(Request $request)
    {
        try {
              $type = array(
                "jpg" => "image",
                "jpeg" => "image",
                "png" => "image",
                "svg" => "image",
                "webp" => "webp",
                "gif" => "gif",
                "mp4" => "video",
                "mpg" => "video",
                "mpeg" => "video",
                "webm" => "video",
                "ogg" => "video",
                "avi" => "video",
                "mov" => "video",
                "flv" => "video",
                "swf" => "video",
                "mkv" => "video",
                "wmv" => "video",
                "wma" => "audio",
                "aac" => "audio",
                "wav" => "audio",
                "mp3" => "audio",
                "zip" => "archive",
                "rar" => "archive",
                "7z" => "archive",
                "doc" => "document",
                "txt" => "document",
                "docx" => "document",
                "pdf" => "document",
                "csv" => "document",
                "xml" => "document",
                "ods" => "document",
                "xlr" => "document",
                "xls" => "document",
                "xlsx" => "document"
            );
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $extension = strtolower($file->getClientOriginalExtension());
                if (isset($type[$extension])) {
                    $file_original_name = explode('.', $file->getClientOriginalName());
                    $path = $file->store('uploads', 'public_dir');
                    $size = filesize(Storage::disk('public_dir')->path($path));
                    $upload = new Upload;
                    $upload->file_original_name = $file_original_name[0].'.'.$file_original_name[1];
                    $upload->file_name = $path;
                    $upload->user_id = Auth::user()->id;
                    $upload->type = $type[$extension];
                    $upload->file_size = $size;
                    $upload->extension = $extension;
                    $upload->save();
                    return response()->json([
                        'filePath' => $path
                        ]
                    , 200);
                } else {
                    return response()->json(['error' => 'Unsupported file type'], 400);
                }
            } else {
                return response()->json(['error' => 'No file uploaded'], 400);
            }
        } catch (\Throwable $th) {
            return response()->json(['error' => $th->getMessage()], 500);
        }
    }

    public function delete(Request $request)
    {
        try {
            $filePath = $request->input('filePath');
            if ($filePath && Storage::disk('public_dir')->exists($filePath)) {
                Storage::disk('public_dir')->delete($filePath);
                Upload::where('file_name', $filePath)->delete();
                return response()->json([
                    'message' => 'File deleted successfully'
                ], 200);
            } else {
                return response()->json(['error' => 'File not found'], 404);
            }
        } catch (\Throwable $th) {
            return response()->json(['error' =>$th->getMessage()], 500);
        }
    }


}
