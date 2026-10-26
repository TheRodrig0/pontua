<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <meta name="color-scheme" content="light dark">
    <title inertia>{{ config('app.name', 'Pontua') }}</title>

    <script>
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

        if (shouldBeDark) {
            document.documentElement.classList.add('dark');
            document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', 'dark');
        } else if (savedTheme === 'light') {
            document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', 'light');
        }
    </script>

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>

<body>
    @inertia
</body>

</html>
