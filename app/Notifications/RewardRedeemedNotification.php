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
        $voucherCode = $this->redemption->voucher_code;
        $isAacc = ($this->redemption->reward?->tag?->value ?? $this->redemption->reward?->tag) === 'aacc';

        $subject = $isAacc
            ? "Protocolo de Horas AACC: {$voucherCode} - Pontua"
            : "Código de Resgate: {$voucherCode} - Pontua";

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.reward-redeemed', [
                'redemption' => $this->redemption,
                'user' => $notifiable,
            ]);
    }
}

