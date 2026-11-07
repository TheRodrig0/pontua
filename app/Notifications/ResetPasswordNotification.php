<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly string $url,
        private readonly int $expiresInMinutes
    ) {
        // Envia só depois do commit e fora da requisição (sem diferença de tempo de resposta).
        $this->afterCommit();
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Redefinição de Senha - Pontua')
            ->view('emails.reset-password', [
                'user' => $notifiable,
                'url' => $this->url,
                'expiresInMinutes' => $this->expiresInMinutes,
            ]);
    }
}

