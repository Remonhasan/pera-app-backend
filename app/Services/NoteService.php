<?php

namespace App\Services;

use App\Models\JobType;
use App\Models\Note;
use App\Models\User;
use App\Repositories\Contracts\NoteRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class NoteService
{
    public function __construct(private readonly NoteRepositoryInterface $notes) {}

    public function listNotes(): Collection
    {
        $jobTypeMap = $this->jobTypeMap();

        return $this->notes->allWithRelations()
            ->map(fn (Note $note) => $this->enrichNote($note, $jobTypeMap));
    }

    public function getNote(Note $note): Note
    {
        return $this->enrichNote(
            $this->notes->findWithRelations($note),
            $this->jobTypeMap(),
        );
    }

    /** @return list<array{id: int, name: string, phone: string|null}> */
    public function memberOptions(): array
    {
        return User::query()
            ->memberRole()
            ->orderBy('name')
            ->get(['id', 'name', 'phone'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
            ])
            ->all();
    }

    /**
     * @param  array<string, mixed>  $validated
     * @param  list<UploadedFile>  $imageFiles
     * @param  list<UploadedFile>  $documentFiles
     */
    public function createNote(
        array $validated,
        array $imageFiles,
        array $documentFiles,
        ?int $actorId,
    ): ?Note {
        $payload = [
            'user_id' => isset($validated['user_id']) ? (int) $validated['user_id'] : null,
            'subject_id' => (int) $validated['subject_id'],
            'topic_id' => isset($validated['topic_id']) ? (int) $validated['topic_id'] : null,
            'job_ids' => $this->normalizeJobIds($validated['job_ids'] ?? null),
            'images' => $this->storeUploadedFiles($imageFiles),
            'files' => $this->storeUploadedFiles($documentFiles),
            'drive_link' => $validated['drive_link'] ?? null,
            'status' => $validated['status'] ?? true,
        ];

        if ($actorId !== null) {
            $payload['created_by'] = $actorId;
            $payload['updated_by'] = $actorId;
        }

        return $this->notes->create($payload);
    }

    /**
     * @param  array<string, mixed>  $validated
     * @param  list<UploadedFile>  $imageFiles
     * @param  list<UploadedFile>  $documentFiles
     */
    public function updateNote(
        Note $note,
        array $validated,
        array $imageFiles,
        array $documentFiles,
        ?int $actorId,
    ): bool {
        $payload = [];

        if (array_key_exists('user_id', $validated)) {
            $payload['user_id'] = $validated['user_id'] !== null
                ? (int) $validated['user_id']
                : null;
        }
        if (array_key_exists('subject_id', $validated)) {
            $payload['subject_id'] = (int) $validated['subject_id'];
        }
        if (array_key_exists('topic_id', $validated)) {
            $payload['topic_id'] = $validated['topic_id'] !== null
                ? (int) $validated['topic_id']
                : null;
        }
        if (array_key_exists('job_ids', $validated)) {
            $payload['job_ids'] = $this->normalizeJobIds($validated['job_ids']);
        }
        if (array_key_exists('drive_link', $validated)) {
            $payload['drive_link'] = $validated['drive_link'];
        }
        if (array_key_exists('status', $validated)) {
            $payload['status'] = (bool) $validated['status'];
        }
        if ($actorId !== null) {
            $payload['updated_by'] = $actorId;
        }

        if (
            array_key_exists('keep_images', $validated)
            || ($validated['keep_images_updated'] ?? false)
            || $imageFiles !== []
        ) {
            $keepPaths = array_key_exists('keep_images', $validated)
                ? $validated['keep_images']
                : ($note->images ?? []);

            $payload['images'] = $this->mergeStoredFiles(
                $keepPaths,
                $imageFiles,
                $note->images ?? [],
            );
        }

        if (
            array_key_exists('keep_files', $validated)
            || ($validated['keep_files_updated'] ?? false)
            || $documentFiles !== []
        ) {
            $keepPaths = array_key_exists('keep_files', $validated)
                ? $validated['keep_files']
                : ($note->files ?? []);

            $payload['files'] = $this->mergeStoredFiles(
                $keepPaths,
                $documentFiles,
                $note->files ?? [],
            );
        }

        return $this->notes->update($note, $payload);
    }

    public function deleteNote(Note $note): bool
    {
        $this->deleteStoredPaths($note->images ?? []);
        $this->deleteStoredPaths($note->files ?? []);

        return $this->notes->delete($note);
    }

    /** @return Collection<int, JobType> */
    private function jobTypeMap(): Collection
    {
        return JobType::query()
            ->get(['id', 'name'])
            ->keyBy('id');
    }

    /** @param  Collection<int, JobType>  $jobTypeMap */
    private function enrichNote(Note $note, Collection $jobTypeMap): Note
    {
        $jobNames = collect($note->job_ids ?? [])
            ->map(fn ($id) => $jobTypeMap->get((int) $id)?->name)
            ->filter()
            ->values()
            ->all();

        $note->setAttribute('job_type_names', $jobNames);

        return $note;
    }

    /** @param  mixed  $jobIds */
    private function normalizeJobIds(mixed $jobIds): ?array
    {
        if ($jobIds === null || $jobIds === []) {
            return null;
        }

        if (! is_array($jobIds)) {
            return null;
        }

        $ids = array_values(array_unique(array_map('intval', $jobIds)));

        return $ids === [] ? null : $ids;
    }

    /** @param  list<UploadedFile>  $files */
    private function storeUploadedFiles(array $files): ?array
    {
        $paths = [];

        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $paths[] = $file->store('uploads', 'public_dir');
            }
        }

        return $paths === [] ? null : $paths;
    }

    /**
     * @param  list<string>  $keepPaths
     * @param  list<UploadedFile>  $newFiles
     * @param  list<string>  $previousPaths
     * @return list<string>|null
     */
    private function mergeStoredFiles(array $keepPaths, array $newFiles, array $previousPaths): ?array
    {
        $removed = array_diff($previousPaths, $keepPaths);
        $this->deleteStoredPaths(array_values($removed));

        $paths = array_values(array_filter($keepPaths, fn ($path) => is_string($path) && $path !== ''));

        foreach ($newFiles as $file) {
            if ($file instanceof UploadedFile) {
                $paths[] = $file->store('uploads', 'public_dir');
            }
        }

        return $paths === [] ? null : $paths;
    }

    /** @param  list<string>  $paths */
    private function deleteStoredPaths(array $paths): void
    {
        foreach ($paths as $path) {
            if (is_string($path) && $path !== '' && Storage::disk('public_dir')->exists($path)) {
                Storage::disk('public_dir')->delete($path);
            }
        }
    }
}
