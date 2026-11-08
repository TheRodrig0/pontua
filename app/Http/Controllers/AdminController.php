<?php

namespace App\Http\Controllers;

use App\Enums\TaxReceiptStatus;
use App\Enums\UserRole;
use App\Models\PointBucket;
use App\Models\Redemption;
use App\Models\Reward;
use App\Models\Setting;
use App\Models\TaxReceipt;
use App\Models\User;
use App\Enums\RedemptionStatus;
use App\Http\Requests\UpdateRedemptionStatusRequest;
use App\Mail\ApaeDailyBatchMail;
use App\Services\ApaeBatchService;
use App\Services\RedemptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AdminController extends Controller
{
    public function __construct(
        private readonly RedemptionService $redemptionService,
        private readonly ApaeBatchService $apaeBatchService
    ) {}

    public function redemptions(Request $request): JsonResponse
    {
        $redemptions = $this->redemptionService->indexForAdmin(
            status: $request->query('status')
        );

        $redemptions->through(fn($redemption) => $redemption->makeHidden(['processed_by']));

        return response()->json($redemptions);
    }

    public function updateRedemption(UpdateRedemptionStatusRequest $request, int $id): JsonResponse
    {
        $adminId = $request->user()->id;
        $status = $request->validated()['status'];

        $redemption = $status === 'completed'
            ? $this->redemptionService->complete($id, $adminId)
            : $this->redemptionService->cancel($id, $adminId);

        return response()->json($redemption->makeHidden(['processed_by']));
    }

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
            'pending_redemptions' => Redemption::where('status', RedemptionStatus::PENDING)->count(),
        ];

        $recentReceipts = TaxReceipt::with('user:id,name,nick,email')
            ->orderBy('id', 'desc')
            ->limit(20)
            ->get()
            ->each(function (TaxReceipt $receipt) {
                if ($receipt->user) {
                    $receipt->user->email = $receipt->user->maskedEmail();
                }
            });

        $users = User::select([
            'id',
            'name',
            'email',
            'nick',
            'role',
            'banned_at',
            'ban_reason',
            'moderation_notice',
            'scan_streak',
            'created_at',
        ])
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
                $u->email = $u->maskedEmail();
                $u->setAttribute('is_banned', $u->isBanned());
                return $u;
            });

        $rewards = Reward::orderBy('id', 'desc')->get();

        $settings = [
            'apae_email' => $this->apaeBatchService->resolveRecipientEmail(),
        ];

        return response()->json([
            'stats' => $stats,
            'recent_receipts' => $recentReceipts,
            'users' => $users,
            'rewards' => $rewards,
            'settings' => $settings,
        ]);
    }

    public function getSettings(): JsonResponse
    {
        $apaeEmail = $this->apaeBatchService->resolveRecipientEmail();

        return response()->json([
            'apae_email' => $apaeEmail,
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'apae_email' => ['required', 'string', 'email', 'max:255'],
        ]);

        Setting::set('apae_email', $validated['apae_email']);

        return response()->json([
            'message' => 'Configuração salva com sucesso.',
            'settings' => [
                'apae_email' => $validated['apae_email'],
            ],
        ]);
    }

    public function sendApaeBatch(): JsonResponse
    {
        $lock = Cache::lock('apae-batch-send', 60);
        if (! $lock->get()) {
            throw ValidationException::withMessages([
                'batch' => ['Um envio de lote já está em andamento. Aguarde alguns segundos.'],
            ]);
        }

        try {
            $receipts = $this->apaeBatchService->resolveReceiptsForManualOperation();

            if ($receipts->isEmpty()) {
                throw ValidationException::withMessages([
                    'batch' => ['Não há notas fiscais aprovadas disponíveis para envio no momento.'],
                ]);
            }

            $recipient = $this->apaeBatchService->resolveRecipientEmail();
            if (! $recipient || ! filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
                throw ValidationException::withMessages([
                    'apae_email' => ['Configure um e-mail institucional válido antes de enviar o lote.'],
                ]);
            }

            $today = now()->format('d/m/Y');
            $totalReceipts = $receipts->count();

            Mail::to($recipient)->send(
                new ApaeDailyBatchMail(
                    receipts: $receipts,
                    date: $today,
                    totalReceipts: $totalReceipts
                )
            );

            TaxReceipt::whereIn('id', $receipts->pluck('id'))
                ->whereNull('sent_to_apae_at')
                ->update(['sent_to_apae_at' => now()]);

            return response()->json([
                'message' => "Lote com {$totalReceipts} cupom(ns) enfileirado para envio ao e-mail {$recipient}.",
                'total_receipts' => $totalReceipts,
                'recipient' => $recipient,
            ]);
        } finally {
            $lock->release();
        }
    }

    public function downloadApaeBatch(): Response
    {
        $receipts = $this->apaeBatchService->resolveReceiptsForManualOperation();

        if ($receipts->isEmpty()) {
            throw ValidationException::withMessages([
                'batch' => ['Não há notas fiscais aprovadas disponíveis para geração do arquivo ZIP.'],
            ]);
        }

        $today = now()->format('d/m/Y');
        $safeDate = str_replace(['/', '\\'], '-', $today);
        $filename = "lote-apae-{$safeDate}.zip";
        $zipData = $this->apaeBatchService->generateBatchZip($receipts, $today);

        return response($zipData, 200, [
            'Content-Type' => 'application/zip',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    public function updateUser(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($request->has('nick') && is_string($request->input('nick'))) {
            $cleanNick = ltrim(trim($request->input('nick')), '@');
            $request->merge(['nick' => $cleanNick !== '' ? $cleanNick : null]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nick' => ['nullable', 'string', 'max:50', Rule::unique('users', 'nick')->ignore($user->id)],
            'role' => ['required', Rule::enum(UserRole::class)],
            'is_banned' => ['sometimes', 'boolean'],
            'ban_reason' => ['nullable', 'string', 'max:255'],
        ], [
            'nick.unique' => 'Este apelido já está em uso.',
        ]);

        $targetRole = $validated['role'] instanceof UserRole ? $validated['role'] : UserRole::tryFrom($validated['role']);
        if ($request->user()->id === $user->id && $targetRole !== UserRole::ADMIN) {
            throw ValidationException::withMessages([
                'role' => ['Você não pode remover o privilégio de administrador da sua própria conta.'],
            ]);
        }

        if ($request->user()->id === $user->id && ! empty($validated['is_banned'])) {
            throw ValidationException::withMessages([
                'is_banned' => ['Você não pode suspender a sua própria conta de administrador.'],
            ]);
        }

        $nameChanged = $validated['name'] !== $user->name;
        $nickChanged = array_key_exists('nick', $validated) && $validated['nick'] !== $user->nick;

        $updatePayload = [
            'name' => $validated['name'],
            'role' => $validated['role'],
        ];

        if (array_key_exists('nick', $validated)) {
            $updatePayload['nick'] = $validated['nick'];
        }

        if ($nameChanged || $nickChanged) {
            $updatePayload['moderation_notice'] = 'Seu nome ou @apelido foi ajustado pela moderação por estar em desacordo com as diretrizes da comunidade.';
        }

        if (array_key_exists('is_banned', $validated)) {
            if ($validated['is_banned']) {
                $updatePayload['banned_at'] = $user->banned_at ?? now();
                $updatePayload['ban_reason'] = $validated['ban_reason'] ?? 'Suspenso pela moderação.';
                $user->tokens()->delete();
            } else {
                $updatePayload['banned_at'] = null;
                $updatePayload['ban_reason'] = null;
            }
        }

        $user->update($updatePayload);
        Cache::forget('ranking_top_10');
        Cache::forget("ranking_performance_{$user->id}");

        return response()->json([
            'message' => 'Usuário atualizado com sucesso.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->maskedEmail(),
                'nick' => $user->nick,
                'role' => $user->role instanceof UserRole ? $user->role->value : $user->role,
                'is_banned' => $user->isBanned(),
                'banned_at' => $user->banned_at,
                'ban_reason' => $user->ban_reason,
                'moderation_notice' => $user->moderation_notice,
                'scan_streak' => $user->scan_streak,
                'created_at' => $user->created_at,
            ],
        ]);
    }
}
