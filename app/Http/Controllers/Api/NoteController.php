<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Api\Concerns\NormalizesUploadedFiles;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNoteRequest;
use App\Http\Requests\UpdateNoteRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Note;
use App\Services\JobTypeService;
use App\Services\NoteService;
use App\Services\SubjectService;
use App\Services\TopicService;
use App\Support\ApiUserContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NoteController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;
    use NormalizesUploadedFiles;

    public function __construct(
        private readonly NoteService $noteService,
        private readonly SubjectService $subjectService,
        private readonly TopicService $topicService,
        private readonly JobTypeService $jobTypeService,
    ) {}

    public function index(): JsonResponse
    {
        $this->authorizeApiPermission('note_list');

        return $this->successResponse([
            'notes' => $this->noteService->listNotes(),
            'members' => $this->noteService->memberOptions(),
            'subjects' => $this->subjectService->subjectOptions(),
            'topics' => $this->topicService->topicOptions(),
            'jobTypes' => $this->jobTypeService->jobTypeOptions(),
        ], 'Note list retrieved successfully.');
    }

    public function show(Note $note): JsonResponse
    {
        $this->authorizeApiPermission('note_list');

        return $this->successResponse(
            $this->noteService->getNote($note),
            'Note retrieved successfully.',
        );
    }

    public function store(StoreNoteRequest $request): JsonResponse
    {
        $this->authorizeApiPermission('note_create');

        $validated = $request->validated();
        unset($validated['images'], $validated['files']);

        $note = $this->noteService->createNote(
            $validated,
            $this->normalizeUploadedFiles($request->file('images')),
            $this->normalizeUploadedFiles($request->file('files')),
            ApiUserContext::actorId(),
        );

        if (! $note) {
            return $this->errorResponse('Failed to create note.', 422);
        }

        return $this->successResponse($note, 'Note created successfully.', 201);
    }

    public function update(UpdateNoteRequest $request, Note $note): JsonResponse
    {
        $this->authorizeApiPermission('note_edit');

        $validated = $request->validated();
        unset($validated['images'], $validated['files']);

        $this->noteService->updateNote(
            $note,
            $validated,
            $this->normalizeUploadedFiles($request->file('images')),
            $this->normalizeUploadedFiles($request->file('files')),
            ApiUserContext::actorId(),
        );

        return $this->successResponse($note->fresh(), 'Note updated successfully.');
    }

    public function destroy(Note $note): JsonResponse
    {
        $this->authorizeApiPermission('note_delete');

        $this->noteService->deleteNote($note);

        return $this->successResponse(null, 'Note deleted successfully.');
    }

    public function file(Request $request, Note $note): StreamedResponse
    {
        $this->authorizeApiPermission('note_list');

        $path = $request->query('path');
        $paths = array_merge($note->images ?? [], $note->files ?? []);

        if (! is_string($path) || ! in_array($path, $paths, true)) {
            abort(404);
        }

        if (! Storage::disk('public_dir')->exists($path)) {
            abort(404);
        }

        return Storage::disk('public_dir')->response($path, basename($path), [
            'Content-Disposition' => 'inline',
        ]);
    }
}
