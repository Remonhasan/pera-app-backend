<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ __('daily_expense_report.title') }}</title>
    @include('reports.partials.styles')
</head>
<body>
    <h1>{{ __('daily_expense_report.header') }}</h1>
    <div class="meta">
        {{ __('daily_expense_report.period') }}:
        @if (! empty($filters['date_from']) && ! empty($filters['date_to']))
            {{ $filters['date_from'] }} {{ __('daily_expense_report.to') }} {{ $filters['date_to'] }}
        @else
            {{ __('daily_expense_report.all_dates') }}
        @endif
        &nbsp;|&nbsp;
        {{ __('daily_expense_report.generated') }}: {{ $formatter->dateTime('Y-m-d H:i') }}
    </div>

    <table class="data">
        <thead>
            <tr>
                <th style="width: 4%">#</th>
                <th style="width: 10%">{{ __('daily_expense_report.col_date') }}</th>
                <th style="width: 14%">{{ __('daily_expense_report.col_member') }}</th>
                <th style="width: 12%">{{ __('daily_expense_report.col_expense_type') }}</th>
                <th style="width: 14%">{{ __('daily_expense_report.col_name') }}</th>
                <th style="width: 10%" class="num">{{ __('daily_expense_report.col_amount') }}</th>
                <th style="width: 36%">{{ __('daily_expense_report.col_description') }}</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($rows as $index => $row)
                <tr>
                    <td>{{ $formatter->integer($index + 1) }}</td>
                    <td>{{ $row['date'] ?? '—' }}</td>
                    <td>{{ $row['member_name'] }}</td>
                    <td>{{ $row['expense_type_name'] }}</td>
                    <td>{{ $row['name'] ?? '—' }}</td>
                    <td class="num">{{ $formatter->decimal($row['amount']) }}</td>
                    <td>{{ $row['description'] ?? '—' }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="5">{{ __('daily_expense_report.total_row') }}</td>
                <td class="num">{{ $formatter->decimal($total_amount) }}</td>
                <td></td>
            </tr>
        </tfoot>
    </table>
</body>
</html>
