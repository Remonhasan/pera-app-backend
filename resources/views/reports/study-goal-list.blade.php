<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ __('study_goal_list_report.title') }}</title>
    @include('reports.partials.styles')
</head>
<body>
    <h1>{{ __('study_goal_list_report.header') }}</h1>
    <div class="meta">
        {{ __('study_goal_list_report.period') }}:
        @if (! empty($filters['date_from']) && ! empty($filters['date_to']))
            {{ $filters['date_from'] }} {{ __('study_goal_list_report.to') }} {{ $filters['date_to'] }}
        @else
            {{ __('study_goal_list_report.all_dates') }}
        @endif
        &nbsp;|&nbsp;
        {{ __('study_goal_list_report.generated') }}: {{ $formatter->dateTime('Y-m-d H:i') }}
    </div>

    <table class="data">
        <thead>
            <tr>
                <th>{{ __('study_goal_list_report.col_member') }}</th>
                <th>{{ __('study_goal_list_report.col_subject') }}</th>
                <th>{{ __('study_goal_list_report.col_topic') }}</th>
                <th>{{ __('study_goal_list_report.col_job_type') }}</th>
                <th>{{ __('study_goal_list_report.col_date_from') }}</th>
                <th>{{ __('study_goal_list_report.col_date_to') }}</th>
                <th>{{ __('study_goal_list_report.col_extended_date') }}</th>
                <th>{{ __('study_goal_list_report.col_study_goal_status') }}</th>
                <th>{{ __('study_goal_list_report.col_status') }}</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($rows as $row)
                <tr>
                    <td>{{ $row['member_name'] }}</td>
                    <td>{{ $row['subject_name'] }}</td>
                    <td>{{ $row['topic_name'] }}</td>
                    <td>{{ $row['job_type_name'] }}</td>
                    <td>{{ $row['date_from'] }}</td>
                    <td>{{ $row['date_to'] }}</td>
                    <td>{{ $row['extended_date'] }}</td>
                    <td>
                        @php
                            $statusKey = match ($row['study_goal_status'] ?? '') {
                                'doing' => 'goal_status_doing',
                                'completed' => 'goal_status_completed',
                                default => 'goal_status_pending',
                            };
                        @endphp
                        {{ __("study_goal_list_report.{$statusKey}") }}
                    </td>
                    <td>{{ $row['status'] ? __('study_goal_list_report.status_active') : __('study_goal_list_report.status_inactive') }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="8">{{ __('study_goal_list_report.total_row') }}</td>
                <td>{{ $formatter->integer($total_records) }}</td>
            </tr>
        </tfoot>
    </table>
</body>
</html>
