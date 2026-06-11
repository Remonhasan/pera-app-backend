<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ __('expense_track_report.title') }}</title>
    @include('reports.partials.styles', ['reportFontSize' => '8px'])
</head>
<body>
    <h1>{{ __('expense_track_report.header') }}</h1>
    <div class="meta">
        {{ __('expense_track_report.period') }}:
        @if (! empty($filters['month']) && ! empty($filters['year']))
            {{ $filters['month'] }}/{{ $filters['year'] }}
        @elseif (! empty($filters['month_from']) || ! empty($filters['month_to']) || ! empty($filters['year_from']) || ! empty($filters['year_to']))
            {{ $filters['month_from'] ?? '…' }}/{{ $filters['year_from'] ?? '…' }}
            {{ __('expense_track_report.to') }}
            {{ $filters['month_to'] ?? '…' }}/{{ $filters['year_to'] ?? '…' }}
        @else
            {{ __('expense_track_report.all_periods') }}
        @endif
        &nbsp;|&nbsp;
        {{ __('expense_track_report.generated') }}: {{ $formatter->dateTime('Y-m-d H:i') }}
    </div>

    <table class="data">
        <thead>
            <tr>
                <th style="width: 3%">#</th>
                <th style="width: 11%">{{ __('expense_track_report.col_member') }}</th>
                <th style="width: 11%">{{ __('expense_track_report.col_budget_type') }}</th>
                <th style="width: 8%">{{ __('expense_track_report.col_month') }}</th>
                <th style="width: 6%">{{ __('expense_track_report.col_year') }}</th>
                <th style="width: 10%" class="num">{{ __('expense_track_report.col_budget_amount') }}</th>
                <th style="width: 10%" class="num">{{ __('expense_track_report.col_total_expense') }}</th>
                <th style="width: 11%">{{ __('expense_track_report.col_mission_status') }}</th>
                <th style="width: 9%" class="num">{{ __('expense_track_report.col_extra_cost') }}</th>
                <th style="width: 11%" class="num">{{ __('expense_track_report.col_remaining_to_spend') }}</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($rows as $index => $row)
                <tr>
                    <td>{{ $formatter->integer($index + 1) }}</td>
                    <td>{{ $row['member_name'] }}</td>
                    <td>{{ $row['budget_type_name'] }}</td>
                    <td>{{ $row['month'] ?? '—' }}</td>
                    <td>{{ $row['year'] ?? '—' }}</td>
                    <td class="num">{{ $formatter->decimal($row['budget_amount']) }}</td>
                    <td class="num">{{ $formatter->decimal($row['total_expense']) }}</td>
                    <td>
                        {{ $row['mission_completed']
                            ? __('expense_track_report.mission_completed')
                            : __('expense_track_report.mission_in_progress') }}
                    </td>
                    <td class="num">
                        {{ $row['mission_completed'] ? $formatter->decimal($row['extra_cost']) : '—' }}
                    </td>
                    <td class="num">
                        {{ ! $row['mission_completed'] ? $formatter->decimal($row['remaining_to_spend']) : '—' }}
                    </td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="5">{{ __('expense_track_report.total_row') }}</td>
                <td class="num">{{ $formatter->decimal($summary['total_budget'] ?? 0) }}</td>
                <td class="num">{{ $formatter->decimal($summary['total_expense'] ?? 0) }}</td>
                <td></td>
                <td class="num">{{ $formatter->decimal($summary['total_extra_cost'] ?? 0) }}</td>
                <td class="num">{{ $formatter->decimal($summary['total_remaining_to_spend'] ?? 0) }}</td>
            </tr>
        </tfoot>
    </table>
</body>
</html>
