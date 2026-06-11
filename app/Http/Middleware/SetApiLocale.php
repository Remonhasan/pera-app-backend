<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetApiLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $localeFromRoute = $request->route('locale');
        $locale = $localeFromRoute !== null
            ? trim((string) $localeFromRoute)
            : trim((string) $request->query('locale', ''));

        $locale = $locale !== '' ? $locale : 'bn';

        $allowed = config('translatable.locales', ['en', 'bn']);
        if (! is_array($allowed) || ! in_array($locale, $allowed, true)) {
            $locale = 'bn';
        }

        app()->setLocale($locale);

        return $next($request);
    }
}

