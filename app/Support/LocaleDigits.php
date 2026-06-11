<?php

namespace App\Support;

final class LocaleDigits
{
    /** @var array<string, string> */
    private const ASCII_TO_BENGALI = [
        '0' => '০',
        '1' => '১',
        '2' => '২',
        '3' => '৩',
        '4' => '৪',
        '5' => '৫',
        '6' => '৬',
        '7' => '৭',
        '8' => '৮',
        '9' => '৯',
    ];

    public static function asciiToBengali(string $value): string
    {
        return strtr($value, self::ASCII_TO_BENGALI);
    }

    public static function forApiLocale(string $value, string $locale): string
    {
        return $locale === 'bn' ? self::asciiToBengali($value) : $value;
    }
}
