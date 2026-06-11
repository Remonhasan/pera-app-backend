<?php

namespace App\Http\Requests;

use App\Models\Exam;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $merge = [
            'status' => $this->boolean('status', true),
            'exam_status' => $this->input('exam_status', Exam::STATUS_PENDING),
        ];

        if ($this->has('job_type_id') && $this->input('job_type_id') === '') {
            $merge['job_type_id'] = null;
        }

        foreach (['exam_date', 'expected_exam_date'] as $key) {
            if ($this->has($key) && $this->input($key) === '') {
                $merge[$key] = null;
            }
        }

        $this->merge($merge);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'job_type_id' => ['nullable', 'integer', Rule::exists('job_types', 'id')],
            'name' => ['required', 'string', 'max:255'],
            'exam_date' => ['nullable', 'date'],
            'expected_exam_date' => ['nullable', 'date'],
            'application_file' => ['nullable', 'file', 'max:10240'],
            'admit_card_file' => ['nullable', 'file', 'max:10240'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'max:5120'],
            'status' => ['boolean'],
            'exam_status' => ['required', 'string', Rule::in(Exam::EXAM_STATUSES)],
        ];
    }
}
