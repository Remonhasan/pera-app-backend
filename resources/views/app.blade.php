@php
    $adminLocale = session('admin_locale', 'en');
    $htmlLang = $adminLocale === 'bn' ? 'bn' : str_replace('_', '-', app()->getLocale());
@endphp
<!DOCTYPE html>
<html lang="{{ $htmlLang }}" class="{{ $adminLocale === 'bn' ? 'admin-locale-bn' : '' }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title inertia>{{ config('app.name', 'Pera') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link
        href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Noto+Color+Emoji&family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap"
        rel="stylesheet" />
    <link rel="icon" href="data:," />
    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased bg-[#F3F4FF]">
    @inertia
</body>

</html>