<?php

namespace App\Support;

class ReportFormatter
{
    private const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

    public function __construct(private readonly string $locale = 'en') {}

    public function isBangla(): bool
    {
        return $this->locale === 'bn';
    }

    public function integer(int|float $value): string
    {
        return $this->localizeDigits(number_format((float) $value, 0, '.', ','));
    }

    public function decimal(int|float $value, int $decimals = 2): string
    {
        return $this->localizeDigits(number_format((float) $value, $decimals, '.', ','));
    }

    public function dateTime(string $format = 'Y-m-d H:i'): string
    {
        return $this->localizeDigits(now()->format($format));
    }

    public function digits(string $value): string
    {
        return $this->localizeDigits($value);
    }

    public function monthName(?int $month): string
    {
        if ($month === null || $month < 1 || $month > 12) {
            return '…';
        }

        $intlLocale = $this->isBangla() ? 'bn_BD' : 'en_GB';
        $formatter = new \IntlDateFormatter(
            $intlLocale,
            \IntlDateFormatter::NONE,
            \IntlDateFormatter::NONE,
            null,
            null,
            'MMMM',
        );

        $formatted = $formatter->format(mktime(0, 0, 0, $month, 1, 2000));

        return is_string($formatted) && $formatted !== '' ? $formatted : '…';
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function monthYearPeriodLabel(array $filters): ?string
    {
        $hasMonthYear = ! empty($filters['month_from'])
            || ! empty($filters['month_to'])
            || ! empty($filters['year_from'])
            || ! empty($filters['year_to']);

        if (! $hasMonthYear) {
            return null;
        }

        $monthFrom = $this->monthName(
            isset($filters['month_from']) ? (int) $filters['month_from'] : null,
        );
        $monthTo = $this->monthName(
            isset($filters['month_to']) ? (int) $filters['month_to'] : null,
        );
        $yearFrom = isset($filters['year_from']) ? (string) $filters['year_from'] : '…';
        $yearTo = isset($filters['year_to']) ? (string) $filters['year_to'] : '…';

        return sprintf('(%s - %s) - (%s - %s)', $monthFrom, $monthTo, $yearFrom, $yearTo);
    }

    private function localizeDigits(string $value): string
    {
        if (! $this->isBangla()) {
            return $value;
        }

        return str_replace(range(0, 9), self::BN_DIGITS, $value);
    }
}
