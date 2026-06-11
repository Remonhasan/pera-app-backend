<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ __('topicwise_study_goal_report.title') }}</title>
    @include('reports.partials.styles', ['reportFontSize' => '9px'])
    <style>
        .section-title {
            font-family: 'noto sans bengali', 'DejaVu Sans', sans-serif;
            font-size: 11px;
            font-weight: bold;
            margin: 12px 0 6px;
            color: #1e3a5f;
        }
        .sub-table { margin-bottom: 10px; }
        .sub-table th { background: #4a6fa5; font-size: 8px; }
    </style>
</head>
<body>
    <h1>{{ __('topicwise_study_goal_report.header') }}</h1>
    <div class="meta">
        {{ __('topicwise_study_goal_report.period') }}:
        @if (! empty($filters['date_from']) && ! empty($filters['date_to']))
            {{ $filters['date_from'] }} {{ __('topicwise_study_goal_report.to') }} {{ $filters['date_to'] }}
        @else
            {{ __('topicwise_study_goal_report.all_dates') }}
        @endif
        &nbsp;|&nbsp;
        {{ __('topicwise_study_goal_report.generated') }}: {{ $formatter->dateTime('Y-m-d H:i') }}
    </div>

    <table class="data">
        <thead>
            <tr>
                <th>{{ __('topicwise_study_goal_report.col_subject') }}</th>
                <th>{{ __('topicwise_study_goal_report.col_topic') }}</th>
                <th>{{ __('topicwise_study_goal_report.col_total') }}</th>
                <th>{{ __('topicwise_study_goal_report.col_pending') }}</th>
                <th>{{ __('topicwise_study_goal_report.col_doing') }}</th>
                <th>{{ __('topicwise_study_goal_report.col_completed') }}</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($rows as $row)
                <tr>
                    <td>{{ $row['subject_name'] }}</td>
                    <td>{{ $row['topic_name'] }}</td>
                    <td>{{ $formatter->integer($row['total']) }}</td>
                    <td>{{ $formatter->integer($row['pending']) }}</td>
                    <td>{{ $formatter->integer($row['doing']) }}</td>
                    <td>{{ $formatter->integer($row['completed']) }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="2">{{ __('topicwise_study_goal_report.total_row') }}</td>
                <td colspan="4">{{ $formatter->integer($total_records) }}</td>
            </tr>
        </tfoot>
    </table>

    @foreach ($rows as $row)
        @if (! empty($row['goals']))
            <div class="section-title">{{ $row['subject_name'] }} — {{ $row['topic_name'] }}</div>
            <table class="data sub-table">
                <thead>
                    <tr>
                        <th>{{ __('topicwise_study_goal_report.col_member') }}</th>
                        <th>{{ __('topicwise_study_goal_report.col_job_type') }}</th>
                        <th>{{ __('topicwise_study_goal_report.col_date_from') }}</th>
                        <th>{{ __('topicwise_study_goal_report.col_date_to') }}</th>
                        <th>{{ __('topicwise_study_goal_report.col_extended_date') }}</th>
                        <th>{{ __('topicwise_study_goal_report.col_status') }}</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($row['goals'] as $goal)
                        <tr>
                            <td>{{ $goal['member_name'] }}</td>
                            <td>{{ $goal['job_type_name'] }}</td>
                            <td>{{ $goal['date_from'] ?? '—' }}</td>
                            <td>{{ $goal['date_to'] ?? '—' }}</td>
                            <td>{{ $goal['extended_date'] ?? '—' }}</td>
                            <td>
                                @php
                                    $statusKey = match ($goal['study_goal_status'] ?? '') {
                                        'doing' => 'status_doing',
                                        'completed' => 'status_completed',
                                        default => 'status_pending',
                                    };
                                @endphp
                                {{ __("topicwise_study_goal_report.{$statusKey}") }}
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    @endforeach
</body>
</html>
