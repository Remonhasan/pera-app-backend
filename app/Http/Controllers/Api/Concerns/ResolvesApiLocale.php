<?php

namespace App\Http\Controllers\Api\Concerns;

use Illuminate\Http\Request;

trait ResolvesApiLocale
{
    protected function resolveLocale(Request $request, ?string $localeFromRoute = null): string
    {
        $candidate = $localeFromRoute;
        if ($candidate === null) {
            $candidate = $request->route('locale');
        }
        if ($candidate === null) {
            $candidate = $request->query('locale');
        }

        $locale = trim((string) ($candidate ?? app()->getLocale())) ?: 'bn';

        $allowed = config('translatable.locales', []);
        if (is_array($allowed) && in_array($locale, $allowed, true)) {
            app()->setLocale($locale);

            return $locale;
        }

        app()->setLocale('bn');

        return 'bn';
    }
}
