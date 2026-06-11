<?php

namespace App\Http\Requests;

use App\Models\Topic;
use App\Models\User;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $merge = [
            'status' => $this->boolean('status', true),
        ];

        if ($this->has('user_id') && $this->input('user_id') === '') {
            $merge['user_id'] = null;
        }

        if ($this->has('topic_id') && $this->input('topic_id') === '') {
            $merge['topic_id'] = null;
        }

        if ($this->has('job_ids')) {
            $merge['job_ids'] = $this->normalizeArrayInput('job_ids');
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
            'user_id' => ['nullable', 'integer', $this->memberUserRule()],
            'subject_id' => ['required', 'integer', Rule::exists('subjects', 'id')],
            'topic_id' => ['nullable', 'integer', Rule::exists('topics', 'id'), $this->topicBelongsToSubjectRule()],
            'job_ids' => ['nullable', 'array'],
            'job_ids.*' => ['integer', Rule::exists('job_types', 'id')],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'max:5120'],
            'files' => ['nullable', 'array'],
            'files.*' => ['file', 'max:10240'],
            'drive_link' => ['nullable', 'string', 'max:2048'],
            'status' => ['boolean'],
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
