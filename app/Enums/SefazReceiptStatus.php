<?php

namespace App\Enums;

enum SefazReceiptStatus
{
    case SUCCESS;
    case NOT_FOUND;
    case CANCELED;
    case DENIED;

    public function message(): ?string
    {
        return match ($this) {
            self::NOT_FOUND => 'Link inválido ou nota fiscal não encontrada.',
            self::CANCELED => 'Esta nota fiscal foi cancelada.',
            self::DENIED => 'Esta nota fiscal foi denegada pela SEFAZ.',
            self::SUCCESS => null,
        };
    }
}