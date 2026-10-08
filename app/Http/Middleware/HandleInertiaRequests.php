<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $userData = null;
        if ($user) {
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'nick' => $user->nick,
                'avatar_url' => $user->avatar_url,
                'role' => $user->role?->value,
            ];
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $userData,
            ],
        ];
    }
}
