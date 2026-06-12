<?php

namespace App\Http\Requests;

use App\Models\Exam;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateExamRequest extends FormRequest
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

        if ($this->has('job_type_id') && $this->input('job_type_id') === '') {
            $merge['job_type_id'] = null;
        }

        foreach (['exam_date', 'expected_exam_date'] as $key) {
            if ($this->has($key) && $this->input($key) === '') {
                $merge[$key] = null;
            }
        }

        if ($this->boolean('keep_images_updated') || $this->has('keep_images')) {
            $merge['keep_images'] = $this->normalizeArrayInput('keep_images');
        }

        foreach (['keep_application_file', 'keep_admit_card_file'] as $key) {
            if ($this->has($key) && $this->input($key) === '') {
                $merge[$key] = null;
            }
        }

        if ($merge !== []) {
            $this->merge($merge);
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'job_type_id' => ['sometimes', 'nullable', 'integer', Rule::exists('job_types', 'id')],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'exam_date' => ['sometimes', 'nullable', 'date'],
            'expected_exam_date' => ['sometimes', 'nullable', 'date'],
            'application_file' => ['nullable', 'file', 'max:10240'],
            'admit_card_file' => ['nullable', 'file', 'max:10240'],
            'keep_application_file' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'keep_admit_card_file' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'max:5120'],
            'keep_images' => ['sometimes', 'array'],
            'keep_images.*' => ['string', 'max:2048'],
            'keep_images_updated' => ['sometimes', 'boolean'],
            'status' => ['sometimes', 'boolean'],
            'exam_status' => ['sometimes', 'required', 'string', Rule::in(Exam::EXAM_STATUSES)],
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
}
