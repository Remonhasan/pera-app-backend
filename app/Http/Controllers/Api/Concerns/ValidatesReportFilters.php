<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Models\StudyGoal;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

trait ValidatesReportFilters
{
    /** @return array<string, mixed> */
    protected function validateDailyExpenseFilters(Request $request): array
    {
        $validated = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'expense_type_id' => ['nullable', 'integer', 'exists:expense_types,id'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        return $this->normalizeNullableIntFilters($validated, ['expense_type_id', 'user_id']);
    }

    /** @return array<string, mixed> */
    protected function validateExpenseTrackFilters(Request $request): array
    {
        $validated = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'budget_id' => ['nullable', 'integer', 'exists:budgets,id'],
            'expense_id' => ['nullable', 'integer', 'exists:expense_types,id'],
            'month' => ['nullable', 'integer', 'min:1', 'max:12'],
            'year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'month_from' => ['nullable', 'integer', 'min:1', 'max:12'],
            'month_to' => ['nullable', 'integer', 'min:1', 'max:12'],
            'year_from' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'year_to' => ['nullable', 'integer', 'min:1900', 'max:2100'],
        ]);

        return $this->normalizeNullableIntFilters(
            $validated,
            ['user_id', 'budget_id', 'expense_id', 'month', 'year', 'month_from', 'month_to', 'year_from', 'year_to'],
        );
    }

    /** @return array<string, mixed> */
    protected function validateExpenseTargetFilters(Request $request): array
    {
        $validated = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'expense_target_id' => ['nullable', 'integer', 'exists:expense_targets,id'],
            'expense_id' => ['nullable', 'integer', 'exists:expense_types,id'],
            'month' => ['nullable', 'integer', 'min:1', 'max:12'],
            'year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'month_from' => ['nullable', 'integer', 'min:1', 'max:12'],
            'month_to' => ['nullable', 'integer', 'min:1', 'max:12'],
            'year_from' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'year_to' => ['nullable', 'integer', 'min:1900', 'max:2100'],
        ]);

        return $this->normalizeNullableIntFilters(
            $validated,
            ['user_id', 'expense_target_id', 'expense_id', 'month', 'year', 'month_from', 'month_to', 'year_from', 'year_to'],
        );
    }

    /** @return array<string, mixed> */
    protected function validateSavingsFilters(Request $request): array
    {
        $validated = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'month_from' => ['nullable', 'integer', 'min:1', 'max:12'],
            'month_to' => ['nullable', 'integer', 'min:1', 'max:12'],
            'year_from' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'year_to' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'saving_type_id' => ['nullable', 'integer', 'exists:saving_types,id'],
            'bank_id' => ['nullable', 'integer', 'exists:banks,id'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        return $this->normalizeNullableIntFilters(
            $validated,
            ['month_from', 'month_to', 'year_from', 'year_to', 'saving_type_id', 'bank_id', 'user_id'],
        );
    }

    /** @return array<string, mixed> */
    protected function validateStudyFilters(Request $request): array
    {
        $validated = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'subject_id' => ['nullable', 'integer', 'exists:subjects,id'],
            'topic_id' => ['nullable', 'integer', 'exists:topics,id'],
            'job_id' => ['nullable', 'integer', 'exists:job_types,id'],
        ]);

        return $this->normalizeNullableIntFilters($validated, ['user_id', 'subject_id', 'topic_id', 'job_id']);
    }

    /** @return array<string, mixed> */
    protected function validateTopicwiseStudyGoalFilters(Request $request): array
    {
        $validated = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'subject_id' => ['nullable', 'integer', 'exists:subjects,id'],
            'topic_id' => ['nullable', 'integer', 'exists:topics,id'],
            'job_id' => ['nullable', 'integer', 'exists:job_types,id'],
            'goal_status' => ['nullable', 'string', Rule::in(StudyGoal::STUDY_GOAL_STATUSES)],
        ]);

        $normalized = $this->normalizeNullableIntFilters($validated, ['user_id', 'subject_id', 'topic_id', 'job_id']);

        if (array_key_exists('goal_status', $normalized) && $normalized['goal_status'] === '') {
            $normalized['goal_status'] = null;
        }

        return $normalized;
    }

    /**
     * @param  array<string, mixed>  $validated
     * @param  list<string>  $keys
     * @return array<string, mixed>
     */
    protected function normalizeNullableIntFilters(array $validated, array $keys): array
    {
        foreach ($keys as $key) {
            if (array_key_exists($key, $validated) && $validated[$key] === '') {
                $validated[$key] = null;
            }
        }

        return $validated;
    }
}
