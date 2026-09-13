<?php

namespace App\Services;

use App\Models\Reward;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Support\Facades\Storage;

class RewardService
{
    public function index(int $perPage): CursorPaginator
    {
        $rewards = Reward::where('is_active', true)
            ->cursorPaginate($perPage);

        return $rewards;
    }

    public function show(int $id): Reward
    {
        $reward = Reward::findOrFail($id);

        return $reward;
    }

    public function store(array $data): Reward
    {
        if (isset($data['image'])) {
            $path = $data['image']->store('rewards', 'public');
            $data['url_image'] = Storage::disk('public')->url($path);
        }

        $reward = Reward::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'tag' => $data['tag'],
            'url_image' => $data['url_image'] ?? null,
            'cost' => $data['cost'],
            'is_active' => $data['is_active'] ?? true,
        ]);

        return $reward;
    }

    public function update(int $id, array $data): Reward
    {
        $reward = Reward::findOrFail($id);

        if (isset($data['image'])) {
            $path = $data['image']->store('rewards', 'public');
            $data['url_image'] = Storage::disk('public')->url($path);
        }

        $reward->update($data);

        return $reward;
    }

    public function destroy(int $id): array
    {
        $reward = Reward::findOrFail($id);

        $reward->delete();

        $successPayload = [
            'message' => 'Recompensa deletada com sucesso.',
        ];

        return $successPayload;
    }
}