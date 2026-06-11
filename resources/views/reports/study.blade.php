<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ __('study_report.title') }}</title>
    @include('reports.partials.styles')
</head>
<body>
    <h1>{{ __('study_report.header') }}</h1>
    <div class="meta">
        {{ __('study_report.period') }}:
        @if (! empty($filters['date_from']) && ! empty($filters['date_to']))
            {{ $filters['date_from'] }} {{ __('study_report.to') }} {{ $filters['date_to'] }}
        @else
            {{ __('study_report.all_dates') }}
        @endif
        &nbsp;|&nbsp;
        {{ __('study_report.generated') }}: {{ $formatter->dateTime('Y-m-d H:i') }}
    </div>

    <table class="data">
        <thead>
            <tr>
                <th style="width: 4%">#</th>
                <th style="width: 10%">{{ __('study_report.col_date') }}</th>
                <th style="width: 14%">{{ __('study_report.col_member') }}</th>
                <th style="width: 14%">{{ __('study_report.col_subject') }}</th>
                <th style="width: 14%">{{ __('study_report.col_topic') }}</th>
                <th style="width: 16%">{{ __('study_report.col_job_type') }}</th>
                <th style="width: 28%">{{ __('study_report.col_drive_link') }}</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($rows as $index => $row)
                <tr>
                    <td>{{ $formatter->integer($index + 1) }}</td>
                    <td>{{ $row['date'] ?? '—' }}</td>
                    <td>{{ $row['member_name'] }}</td>
                    <td>{{ $row['subject_name'] }}</td>
                    <td>{{ $row['topic_name'] }}</td>
                    <td>{{ $row['job_type_names'] }}</td>
                    <td>{{ $row['drive_link'] ?? '—' }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="6">{{ __('study_report.total_row') }}</td>
                <td>{{ $formatter->integer($total_records) }}</td>
            </tr>
        </tfoot>
    </table>
</body>
</html>
