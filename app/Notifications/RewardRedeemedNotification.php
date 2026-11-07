<?php

namespace App\Notifications;

use App\Models\Redemption;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RewardRedeemedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public array $backoff = [10, 60, 300];

    public function __construct(
        public readonly Redemption $redemption
    ) {
        // Envia apenas após a transação do banco ser confirmada com sucesso (commit)
        $this->afterCommit();
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $rewardName = $this->redemption->reward?->name ?? 'Recompensa';
        $pointsCost = $this->redemption->points_cost;
        $voucherCode = $this->redemption->voucher_code;

        return (new MailMessage)
            ->subject("Código de Resgate: {$voucherCode} - Pontua")
            ->greeting("Olá, {$notifiable->name}!")
            ->line("Seu pedido de resgate foi realizado com sucesso no Pontua.")
            ->line("**Recompensa:** {$rewardName}")
            ->line("**Pontos utilizados:** {$pointsCost} PTS")
            ->line("**Código de Resgate:**")
            ->line("# {$voucherCode}")
            ->line("Para retirar seu prêmio, apresente este código de resgate na Administração/Coordenação da FATEC.")
            ->line("Os pontos correspondentes já foram reservados da sua conta. Caso o pedido seja cancelado, os pontos serão estornados automaticamente.");
    }
}

