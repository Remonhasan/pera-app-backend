<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTopicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('status')) {
            $this->merge(['status' => $this->boolean('status')]);
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'subject_id' => ['sometimes', 'required', 'integer', Rule::exists('subjects', 'id')],
            'topic' => ['sometimes', 'required', 'string', 'max:255'],
            'status' => ['sometimes', 'boolean'],
        ];
    }
}
