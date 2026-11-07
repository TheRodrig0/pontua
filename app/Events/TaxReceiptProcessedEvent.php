<?php

namespace App\Events;

use App\Models\TaxReceipt;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaxReceiptProcessedEvent
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly TaxReceipt $taxReceipt
    ) {
    }
}
