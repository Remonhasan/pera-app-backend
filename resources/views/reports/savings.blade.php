<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ __('savings_report.title') }}</title>
    @include('reports.partials.styles', ['reportFontSize' => '9px'])
</head>
<body>
    <h1>{{ __('savings_report.header') }}</h1>
    <div class="meta">
        {{ __('savings_report.period') }}:
        @if ($monthYearPeriod = $formatter->monthYearPeriodLabel($filters))
            {{ $monthYearPeriod }}
        @elseif (! empty($filters['date_from']) && ! empty($filters['date_to']))
            {{ $filters['date_from'] }} {{ __('savings_report.to') }} {{ $filters['date_to'] }}
        @else
            {{ __('savings_report.all_dates') }}
        @endif
        &nbsp;|&nbsp;
        {{ __('savings_report.generated') }}: {{ $formatter->dateTime('Y-m-d H:i') }}
    </div>

    <table class="data">
        <thead>
            <tr>
                <th style="width: 3%">#</th>
                <th style="width: 9%">{{ __('savings_report.col_date') }}</th>
                <th style="width: 12%">{{ __('savings_report.col_member') }}</th>
                <th style="width: 10%">{{ __('savings_report.col_bank') }}</th>
                <th style="width: 11%">{{ __('savings_report.col_saving_type') }}</th>
                <th style="width: 6%">{{ __('savings_report.col_month') }}</th>
                <th style="width: 6%">{{ __('savings_report.col_year') }}</th>
                <th style="width: 9%" class="num">{{ __('savings_report.col_amount') }}</th>
                <th style="width: 34%">{{ __('savings_report.col_description') }}</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($rows as $index => $row)
                <tr>
                    <td>{{ $formatter->integer($index + 1) }}</td>
                    <td>{{ $row['date'] ?? '—' }}</td>
                    <td>{{ $row['member_name'] }}</td>
                    <td>{{ $row['bank_name'] }}</td>
                    <td>{{ $row['saving_type_name'] }}</td>
                    <td>
                        @if (! empty($row['month']))
                            {{ $formatter->monthName((int) $row['month']) }}
                        @else
                            —
                        @endif
                    </td>
                    <td>{{ $row['year'] ?? '—' }}</td>
                    <td class="num">{{ $formatter->decimal($row['amount']) }}</td>
                    <td>{{ $row['description'] ?? '—' }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="7">{{ __('savings_report.total_row') }}</td>
                <td class="num">{{ $formatter->decimal($total_amount) }}</td>
                <td></td>
            </tr>
        </tfoot>
    </table>
</body>
</html>
