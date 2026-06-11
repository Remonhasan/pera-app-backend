<?php

namespace App\Support;

class PhoneNormalizer
{
    public static function toLocalNumber(?string $phone): string
    {
        $normalized = trim((string) $phone);

        if ($normalized === '') {
            return '';
        }

        if (str_starts_with($normalized, '+880')) {
            $normalized = trim(substr($normalized, 4));
        } elseif (str_starts_with($normalized, '+88')) {
            $normalized = trim(substr($normalized, 3));
        } else {
            $normalized = ltrim($normalized, '+');
        }

        return self::normalizeBangladeshLocalNumber($normalized);
    }

    public static function normalizeBangladeshLocalNumber(string $phone): string
    {
        $digits = preg_replace('/\D+/', '', $phone) ?? '';

        if ($digits === '') {
            return '';
        }

        if (str_starts_with($digits, '880') && strlen($digits) === 13) {
            $digits = substr($digits, 3);
        }

        if (strlen($digits) === 10 && str_starts_with($digits, '1')) {
            return '0' . $digits;
        }

        if (strlen($digits) === 11 && str_starts_with($digits, '01')) {
            return $digits;
        }

        return $digits;
    }

    /** @return list<string> */
    public static function variants(?string $phone): array
    {
        $raw = trim((string) $phone);

        if ($raw === '') {
            return [];
        }

        $local = self::toLocalNumber($raw);
        $withoutLeadingZero = ltrim($local, '0');

        return array_values(array_unique(array_filter([
            $raw,
            $local,
            $withoutLeadingZero,
            '0' . $withoutLeadingZero,
            '+88' . $withoutLeadingZero,
            '+880' . $withoutLeadingZero,
        ])));
    }
}
