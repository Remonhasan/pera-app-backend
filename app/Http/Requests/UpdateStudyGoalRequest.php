<?php

namespace App\Http\Requests;

use App\Models\StudyGoal;
use App\Models\Topic;
use App\Models\User;
use Carbon\Carbon;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateStudyGoalRequest extends FormRequest
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

        foreach (['user_id', 'topic_id', 'job_id'] as $key) {
            if ($this->has($key) && $this->input($key) === '') {
                $merge[$key] = null;
            }
        }

        foreach (['date_from', 'date_to', 'extended_date'] as $key) {
            if (! $this->has($key)) {
                continue;
            }

            $value = $this->input($key);

            if ($value === null || $value === '') {
                $merge[$key] = null;

                continue;
            }

            try {
                $merge[$key] = Carbon::parse($value)->toDateString();
            } catch (\Throwable) {
                // Leave the original value so the date rule can fail validation.
            }
        }

        if ($merge !== []) {
            $this->merge($merge);
        }
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $studyGoal = $this->route('study_goal');

            if (! $studyGoal instanceof StudyGoal) {
                return;
            }

            $dateFrom = $this->has('date_from')
                ? $this->input('date_from')
                : $studyGoal->date_from?->format('Y-m-d');
            $dateTo = $this->has('date_to')
                ? $this->input('date_to')
                : $studyGoal->date_to?->format('Y-m-d');

            if ($dateFrom !== null && $dateTo !== null && $dateTo < $dateFrom) {
                $validator->errors()->add(
                    'date_to',
                    'The date to field must be a date after or equal to date from.',
                );
            }
        });
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'user_id' => ['sometimes', 'nullable', 'integer', $this->memberUserRule()],
            'subject_id' => ['sometimes', 'required', 'integer', Rule::exists('subjects', 'id')],
            'topic_id' => ['sometimes', 'nullable', 'integer', Rule::exists('topics', 'id'), $this->topicBelongsToSubjectRule()],
            'job_id' => ['sometimes', 'nullable', 'integer', Rule::exists('job_types', 'id')],
            'date_from' => ['sometimes', 'nullable', 'date'],
            'date_to' => ['sometimes', 'nullable', 'date'],
            'extended_date' => ['sometimes', 'nullable', 'date'],
            'status' => ['sometimes', 'boolean'],
            'study_goal_status' => ['sometimes', 'required', 'string', Rule::in(StudyGoal::STUDY_GOAL_STATUSES)],
        ];
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
                $studyGoal = $this->route('study_goal');
                $subjectId = $studyGoal instanceof StudyGoal ? $studyGoal->subject_id : null;
            }

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
