<?php

namespace App\Services;

use App\Models\Exam;
use App\Repositories\Contracts\ExamRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class ExamService
{
    public function __construct(private readonly ExamRepositoryInterface $exams) {}

    public function listExams(): Collection
    {
        return $this->exams->allWithRelations();
    }

    public function getExam(Exam $exam): Exam
    {
        return $this->exams->findWithRelations($exam);
    }

    /** @param  array<string, mixed>  $filters */
    public function buildListExport(array $filters): array
    {
        $rows = $this->filterExams($this->listExams(), $filters)
            ->map(fn (Exam $exam) => [
                'name' => $exam->name,
                'job_type_name' => $exam->jobType?->name ?? '—',
                'exam_date' => $exam->exam_date?->format('Y-m-d') ?? '—',
                'expected_exam_date' => $exam->expected_exam_date?->format('Y-m-d') ?? '—',
                'remaining_days' => $this->formatRemainingDaysLabel($exam->exam_date),
                'expected_remaining_days' => $this->formatRemainingDaysLabel($exam->expected_exam_date),
                'exam_status' => $exam->exam_status,
                'status' => $exam->status,
            ])
            ->values()
            ->all();

        return [
            'filters' => $filters,
            'rows' => $rows,
            'total_records' => count($rows),
        ];
    }

    /** @param  array<string, mixed>  $filters */
    public function filterExams(Collection $exams, array $filters): Collection
    {
        return $exams->filter(function (Exam $exam) use ($filters) {
            if (! empty($filters['job_type_id']) && (int) $exam->job_type_id !== (int) $filters['job_type_id']) {
                return false;
            }

            if (! empty($filters['exam_status']) && $exam->exam_status !== $filters['exam_status']) {
                return false;
            }

            $dateValue = $exam->exam_date?->format('Y-m-d')
                ?? $exam->expected_exam_date?->format('Y-m-d');

            if (! empty($filters['date_from']) || ! empty($filters['date_to'])) {
                if ($dateValue === null) {
                    return false;
                }

                if (! empty($filters['date_from']) && $dateValue < $filters['date_from']) {
                    return false;
                }

                if (! empty($filters['date_to']) && $dateValue > $filters['date_to']) {
                    return false;
                }
            }

            return true;
        })->values();
    }

    private function formatRemainingDaysLabel(mixed $date): string
    {
        if ($date === null) {
            return '—';
        }

        $target = $date instanceof \Carbon\CarbonInterface
            ? $date->copy()->startOfDay()
            : \Carbon\Carbon::parse($date)->startOfDay();
        $days = (int) now()->startOfDay()->diffInDays($target, false);

        if ($days === 0) {
            return 'Today';
        }

        if ($days < 0) {
            return abs($days).' days overdue';
        }

        return $days.' days';
    }

    /**
     * @param  array<string, mixed>  $validated
     * @param  list<UploadedFile>  $imageFiles
     */
    public function createExam(
        array $validated,
        ?UploadedFile $applicationFile,
        ?UploadedFile $admitCardFile,
        array $imageFiles,
        ?int $actorId,
    ): ?Exam {
        $payload = [
            'job_type_id' => isset($validated['job_type_id']) ? (int) $validated['job_type_id'] : null,
            'name' => $validated['name'],
            'exam_date' => $validated['exam_date'] ?? null,
            'expected_exam_date' => $validated['expected_exam_date'] ?? null,
            'application_file' => $this->storeUploadedFile($applicationFile),
            'admit_card_file' => $this->storeUploadedFile($admitCardFile),
            'images' => $this->storeUploadedFiles($imageFiles),
            'status' => $validated['status'] ?? true,
            'exam_status' => $validated['exam_status'] ?? Exam::STATUS_PENDING,
        ];

        if ($actorId !== null) {
            $payload['created_by'] = $actorId;
            $payload['updated_by'] = $actorId;
        }

        return $this->exams->create($payload);
    }

    /**
     * @param  array<string, mixed>  $validated
     * @param  list<UploadedFile>  $imageFiles
     */
    public function updateExam(
        Exam $exam,
        array $validated,
        ?UploadedFile $applicationFile,
        ?UploadedFile $admitCardFile,
        array $imageFiles,
        ?int $actorId,
    ): bool {
        $payload = [];

        if (array_key_exists('job_type_id', $validated)) {
            $payload['job_type_id'] = $validated['job_type_id'] !== null
                ? (int) $validated['job_type_id']
                : null;
        }
        if (array_key_exists('name', $validated)) {
            $payload['name'] = $validated['name'];
        }
        if (array_key_exists('exam_date', $validated)) {
            $payload['exam_date'] = $validated['exam_date'];
        }
        if (array_key_exists('expected_exam_date', $validated)) {
            $payload['expected_exam_date'] = $validated['expected_exam_date'];
        }
        if (array_key_exists('status', $validated)) {
            $payload['status'] = (bool) $validated['status'];
        }
        if (array_key_exists('exam_status', $validated)) {
            $payload['exam_status'] = $validated['exam_status'];
        }
        if ($actorId !== null) {
            $payload['updated_by'] = $actorId;
        }

        if (array_key_exists('keep_application_file', $validated) || $applicationFile !== null) {
            $keepPath = array_key_exists('keep_application_file', $validated)
                ? $validated['keep_application_file']
                : $exam->application_file;

            $payload['application_file'] = $this->resolveSingleFile(
                $keepPath,
                $applicationFile,
                $exam->application_file,
            );
        }

        if (array_key_exists('keep_admit_card_file', $validated) || $admitCardFile !== null) {
            $keepPath = array_key_exists('keep_admit_card_file', $validated)
                ? $validated['keep_admit_card_file']
                : $exam->admit_card_file;

            $payload['admit_card_file'] = $this->resolveSingleFile(
                $keepPath,
                $admitCardFile,
                $exam->admit_card_file,
            );
        }

        if (array_key_exists('keep_images', $validated) || $imageFiles !== []) {
            $keepPaths = array_key_exists('keep_images', $validated)
                ? $validated['keep_images']
                : ($exam->images ?? []);

            $payload['images'] = $this->mergeStoredFiles(
                $keepPaths,
                $imageFiles,
                $exam->images ?? [],
            );
        }

        return $this->exams->update($exam, $payload);
    }

    public function deleteExam(Exam $exam): bool
    {
        $this->deleteStoredPath($exam->application_file);
        $this->deleteStoredPath($exam->admit_card_file);
        $this->deleteStoredPaths($exam->images ?? []);

        return $this->exams->delete($exam);
    }

    private function storeUploadedFile(?UploadedFile $file): ?string
    {
        if (! $file instanceof UploadedFile) {
            return null;
        }

        return $file->store('uploads', 'public_dir');
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

    private function resolveSingleFile(
        mixed $keepPath,
        ?UploadedFile $newFile,
        ?string $previousPath,
    ): ?string {
        if ($newFile instanceof UploadedFile) {
            $this->deleteStoredPath($previousPath);

            return $newFile->store('uploads', 'public_dir');
        }

        if ($keepPath === '' || $keepPath === null) {
            $this->deleteStoredPath($previousPath);

            return null;
        }

        return is_string($keepPath) && $keepPath !== '' ? $keepPath : $previousPath;
    }

    /**
     * @param  list<string>  $keepPaths
     * @param  list<UploadedFile>  $newFiles
     * @param  list<string>  $previousPaths
     * @return list<string>|null
     */
    private function mergeStoredFiles(array $keepPaths, array $newFiles, array $previousPaths): ?array
    {
        $normalizedKeepPaths = array_values(array_filter(array_map(
            fn ($path) => $this->normalizeStoredPath($path),
            $keepPaths,
        )));

        $removed = array_diff($previousPaths, $normalizedKeepPaths);
        $this->deleteStoredPaths(array_values($removed));

        $paths = $normalizedKeepPaths;

        foreach ($newFiles as $file) {
            if ($file instanceof UploadedFile) {
                $paths[] = $file->store('uploads', 'public_dir');
            }
        }

        return $paths === [] ? null : $paths;
    }

    private function normalizeStoredPath(mixed $path): ?string
    {
        if (! is_string($path) || $path === '') {
            return null;
        }

        if (str_contains($path, 'path=')) {
            $query = [];
            parse_str((string) parse_url($path, PHP_URL_QUERY), $query);

            if (! empty($query['path']) && is_string($query['path'])) {
                return $query['path'];
            }
        }

        return $path;
    }

    private function deleteStoredPath(?string $path): void
    {
        if (is_string($path) && $path !== '' && Storage::disk('public_dir')->exists($path)) {
            Storage::disk('public_dir')->delete($path);
        }
    }

    /** @param  list<string>  $paths */
    private function deleteStoredPaths(array $paths): void
    {
        foreach ($paths as $path) {
            $this->deleteStoredPath($path);
        }
    }
}
