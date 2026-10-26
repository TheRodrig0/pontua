<?php

namespace App\Http\Controllers;

use App\Enums\TaxReceiptStatus;
use App\Enums\UserRole;
use App\Models\PointBucket;
use App\Models\Reward;
use App\Models\TaxReceipt;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    public function overview(): JsonResponse
    {
        $stats = [
            'total_users' => User::count(),
            'total_receipts' => TaxReceipt::count(),
            'approved_receipts' => TaxReceipt::where('status', TaxReceiptStatus::APPROVED)->count(),
            'pending_receipts' => TaxReceipt::where('status', TaxReceiptStatus::PENDING)->count(),
            'rejected_receipts' => TaxReceipt::where('status', TaxReceiptStatus::REJECTED)->count(),
            'total_value_donated' => (float) TaxReceipt::where('status', TaxReceiptStatus::APPROVED)->sum('value'),
            'total_points_distributed' => (int) PointBucket::sum('initial_points'),
            'total_rewards' => Reward::count(),
        ];

        $recentReceipts = TaxReceipt::with('user:id,name,nick,email')
            ->orderBy('id', 'desc')
            ->limit(20)
            ->get();

        $users = User::select(['id', 'name', 'email', 'nick', 'role', 'scan_streak', 'created_at'])
            ->withCount(['taxReceipts as total_receipts'])
            ->withSum(
                ['pointBuckets as current_balance' => fn($query) => $query->active()],
                'remaining_points'
            )
            ->orderBy('id', 'asc')
            ->limit(50)
            ->get()
            ->map(function (User $u) {
                $u->current_balance = (int) $u->current_balance;
                $u->total_receipts = (int) $u->total_receipts;
                return $u;
            });

        $rewards = Reward::orderBy('id', 'desc')->get();

        return response()->json([
            'stats' => $stats,
            'recent_receipts' => $recentReceipts,
            'users' => $users,
            'rewards' => $rewards,
        ]);
    }

    public function updateUser(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nick' => ['nullable', 'string', 'max:50', Rule::unique('users', 'nick')->ignore($user->id)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', Rule::enum(UserRole::class)],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        if (array_key_exists('nick', $validated) && $validated['nick'] !== null) {
            $cleanNick = ltrim(trim($validated['nick']), '@');
            $validated['nick'] = $cleanNick !== '' ? $cleanNick : null;
        }

        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Usuário atualizado com sucesso.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'nick' => $user->nick,
                'role' => $user->role instanceof UserRole ? $user->role->value : $user->role,
                'scan_streak' => $user->scan_streak,
                'created_at' => $user->created_at,
            ],
        ]);
    }
}
