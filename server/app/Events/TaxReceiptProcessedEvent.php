<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\TaxReceipt;

class TaxReceiptProcessedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        private readonly TaxReceipt $taxReceipt
    ) {
    }

    public function broadcastOn(): Channel
    {
        return new PrivateChannel("users.{$this->taxReceipt->user_id}");
    }

    public function broadcastAs(): string
    {
        return 'TaxReceiptProcessedEvent';
    }

    public function broadcastWith(): array
    {
        return [
            'taxReceipt' => [
                'id' => $this->taxReceipt->id,
                'status' => $this->taxReceipt->status,
                'points_earned' => $this->taxReceipt->points_earned,
                'value' => $this->taxReceipt->value,
                'access_key' => $this->taxReceipt->access_key,
                'original_url' => $this->taxReceipt->original_url,
                'created_at' => $this->taxReceipt->created_at,
                'updated_at' => $this->taxReceipt->updated_at,
            ],
        ];
    }
}
