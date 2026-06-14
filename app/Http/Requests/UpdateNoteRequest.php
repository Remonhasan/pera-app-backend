<?php

namespace App\Http\Requests;

use App\Models\Topic;
use App\Models\User;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $merge = [];

        if ($this->has('status')) {
            $merge['status'] = $this->boolean('status');
        }
        if ($this->has('user_id') && $this->input('user_id') === '') {
            $merge['user_id'] = null;
        }
        if ($this->has('topic_id') && $this->input('topic_id') === '') {
            $merge['topic_id'] = null;
        }
        if ($this->inputKeyExists('job_ids')) {
            $merge['job_ids'] = $this->normalizeArrayInput('job_ids');
        }
        if ($this->inputKeyExists('keep_images') || $this->boolean('keep_images_updated')) {
            $merge['keep_images'] = $this->normalizeArrayInput('keep_images');
        }
        if ($this->inputKeyExists('keep_files') || $this->boolean('keep_files_updated')) {
            $merge['keep_files'] = $this->normalizeArrayInput('keep_files');
        }
        if ($this->has('drive_link')) {
            $value = $this->input('drive_link');
            $merge['drive_link'] = ($value === null || $value === '')
                ? null
                : (is_string($value) ? trim($value) : null);
        }

        $this->merge($merge);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'user_id' => ['sometimes', 'nullable', 'integer', $this->memberUserRule()],
            'subject_id' => ['sometimes', 'required', 'integer', Rule::exists('subjects', 'id')],
            'topic_id' => ['sometimes', 'nullable', 'integer', Rule::exists('topics', 'id'), $this->topicBelongsToSubjectRule()],
            'job_ids' => ['sometimes', 'nullable', 'array'],
            'job_ids.*' => ['integer', Rule::exists('job_types', 'id')],
            'keep_images' => ['nullable', 'array'],
            'keep_images.*' => ['string', 'max:500'],
            'keep_images_updated' => ['sometimes', 'boolean'],
            'keep_files' => ['nullable', 'array'],
            'keep_files.*' => ['string', 'max:500'],
            'keep_files_updated' => ['sometimes', 'boolean'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'max:5120'],
            'files' => ['nullable', 'array'],
            'files.*' => ['file', 'max:10240'],
            'drive_link' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'status' => ['sometimes', 'boolean'],
        ];
    }

    private function normalizeArrayInput(string $key): array
    {
        $value = $this->input($key);

        if ($value === null || $value === '') {
            return [];
        }

        return is_array($value) ? $value : [$value];
    }

    private function inputKeyExists(string $key): bool
    {
        return array_key_exists($key, $this->all());
    }

    private function memberUserRule(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            if ($value === null) {
                return;
            }

            $exists = User::query()
                ->whereKey($value)
                ->memberRole()
                ->exists();

            if (! $exists) {
                $fail('The selected member is invalid.');
            }
        };
    }

    private function topicBelongsToSubjectRule(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            if ($value === null) {
                return;
            }

            $subjectId = $this->input('subject_id');
            if ($subjectId === null) {
                return;
            }

            $exists = Topic::query()
                ->whereKey($value)
                ->where('subject_id', $subjectId)
                ->exists();

            if (! $exists) {
                $fail('The selected topic does not belong to the selected subject.');
            }
        };
    }
}
