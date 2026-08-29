<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel(
    channel: 'users.{userId}',
    callback: fn($user, $userId) => (int) $user->id === (int) $userId
);
