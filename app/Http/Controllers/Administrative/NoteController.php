<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNoteRequest;
use App\Http\Requests\UpdateNoteRequest;
use App\Models\Note;
use App\Services\JobTypeService;
use App\Services\NoteService;
use App\Services\SubjectService;
use App\Services\TopicService;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class NoteController extends Controller
{
    public function __construct(
        private readonly NoteService $noteService,
        private readonly SubjectService $subjectService,
        private readonly TopicService $topicService,
        private readonly JobTypeService $jobTypeService,
    ) {}

    public function index()
    {
        try {
            return Inertia::render('Administrative/Note/Index', [
                'notes' => $this->noteService->listNotes(),
                'members' => $this->noteService->memberOptions(),
                'subjects' => $this->subjectService->subjectOptions(),
                'topics' => $this->topicService->topicOptions(),
                'jobTypes' => $this->jobTypeService->jobTypeOptions(),
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function create() {}

    public function noteFile(Request $request, Note $note)
    {
        abort_unless($request->user()->can('note_list'), 403);

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

    public function store(StoreNoteRequest $request)
    {
        try {
            $validated = $request->validated();
            unset($validated['images'], $validated['files']);

            $note = $this->noteService->createNote(
                $validated,
                $this->normalizeUploadedFiles($request->file('images')),
                $this->normalizeUploadedFiles($request->file('files')),
                auth()->id(),
            );
            if (! $note) {
                return redirect()->back()->with('error', 'Note created failed.');
            }

            return redirect()->route('administrative.note.index')->with('success', 'Note created successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function edit(Note $note)
    {
        return redirect()->route('administrative.note.index');
    }

    public function update(UpdateNoteRequest $request, Note $note)
    {
        try {
            $validated = $request->validated();
            unset($validated['images'], $validated['files']);

            $this->noteService->updateNote(
                $note,
                $validated,
                $this->normalizeUploadedFiles($request->file('images')),
                $this->normalizeUploadedFiles($request->file('files')),
                auth()->id(),
            );

            return redirect()->route('administrative.note.index')->with('success', 'Note updated successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function destroy(Note $note)
    {
        $this->noteService->deleteNote($note);

        return redirect()->route('administrative.note.index')->with('success', 'Note deleted successfully.');
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
