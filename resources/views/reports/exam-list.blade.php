<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ __('exam_list_report.title') }}</title>
    @include('reports.partials.styles')
</head>
<body>
    <h1>{{ __('exam_list_report.header') }}</h1>
    <div class="meta">
        {{ __('exam_list_report.period') }}:
        @if (! empty($filters['date_from']) && ! empty($filters['date_to']))
            {{ $filters['date_from'] }} {{ __('exam_list_report.to') }} {{ $filters['date_to'] }}
        @else
            {{ __('exam_list_report.all_dates') }}
        @endif
        &nbsp;|&nbsp;
        {{ __('exam_list_report.generated') }}: {{ $formatter->dateTime('Y-m-d H:i') }}
    </div>

    <table class="data">
        <thead>
            <tr>
                <th>{{ __('exam_list_report.col_name') }}</th>
                <th>{{ __('exam_list_report.col_job_type') }}</th>
                <th>{{ __('exam_list_report.col_exam_date') }}</th>
                <th>{{ __('exam_list_report.col_expected_exam_date') }}</th>
                <th>{{ __('exam_list_report.col_remaining_days') }}</th>
                <th>{{ __('exam_list_report.col_expected_remaining_days') }}</th>
                <th>{{ __('exam_list_report.col_exam_status') }}</th>
                <th>{{ __('exam_list_report.col_status') }}</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($rows as $row)
                <tr>
                    <td>{{ $row['name'] }}</td>
                    <td>{{ $row['job_type_name'] }}</td>
                    <td>{{ $row['exam_date'] }}</td>
                    <td>{{ $row['expected_exam_date'] }}</td>
                    <td>{{ $row['remaining_days'] }}</td>
                    <td>{{ $row['expected_remaining_days'] }}</td>
                    <td>
                        @php
                            $statusKey = match ($row['exam_status'] ?? '') {
                                'completed' => 'exam_status_completed',
                                'passed' => 'exam_status_passed',
                                default => 'exam_status_pending',
                            };
                        @endphp
                        {{ __("exam_list_report.{$statusKey}") }}
                    </td>
                    <td>{{ $row['status'] ? __('exam_list_report.status_active') : __('exam_list_report.status_inactive') }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="7">{{ __('exam_list_report.total_row') }}</td>
                <td>{{ $formatter->integer($total_records) }}</td>
            </tr>
        </tfoot>
    </table>
</body>
</html>
