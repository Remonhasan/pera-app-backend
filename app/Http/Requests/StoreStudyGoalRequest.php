<?php

namespace App\Http\Requests;

use App\Models\StudyGoal;
use App\Models\Topic;
use App\Models\User;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStudyGoalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $merge = [
            'status' => $this->boolean('status', true),
            'study_goal_status' => $this->input('study_goal_status', StudyGoal::STATUS_PENDING),
        ];

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
                $merge[$key] = \Carbon\Carbon::parse($value)->toDateString();
            } catch (\Throwable) {
                // Leave the original value so the date rule can fail validation.
            }
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
            'job_id' => ['nullable', 'integer', Rule::exists('job_types', 'id')],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'extended_date' => ['nullable', 'date'],
            'status' => ['boolean'],
            'study_goal_status' => ['required', 'string', Rule::in(StudyGoal::STUDY_GOAL_STATUSES)],
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
