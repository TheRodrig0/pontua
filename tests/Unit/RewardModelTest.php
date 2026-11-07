<?php

namespace Tests\Unit;

use App\Models\Reward;
use PHPUnit\Framework\TestCase;

class RewardModelTest extends TestCase
{
    public function test_url_image_accessor_converts_absolute_http_storage_url_to_relative(): void
    {
        $reward = new Reward();
        $reward->url_image = 'http://pontuaffr.com.br/storage/rewards/test.jpg';

        $this->assertEquals('/storage/rewards/test.jpg', $reward->url_image);
    }

    public function test_url_image_accessor_converts_absolute_https_storage_url_to_relative(): void
    {
        $reward = new Reward();
        $reward->url_image = 'https://pontuaffr.com.br/storage/rewards/test.jpg';

        $this->assertEquals('/storage/rewards/test.jpg', $reward->url_image);
    }

    public function test_url_image_accessor_keeps_relative_storage_path(): void
    {
        $reward = new Reward();
        $reward->url_image = '/storage/rewards/test.jpg';

        $this->assertEquals('/storage/rewards/test.jpg', $reward->url_image);
    }

    public function test_url_image_accessor_prefixes_storage_if_missing(): void
    {
        $reward = new Reward();
        $reward->url_image = 'rewards/test.jpg';

        $this->assertEquals('/storage/rewards/test.jpg', $reward->url_image);
    }

    public function test_url_image_accessor_keeps_external_urls(): void
    {
        $reward = new Reward();
        $reward->url_image = 'https://images.unsplash.com/photo-sample';

        $this->assertEquals('https://images.unsplash.com/photo-sample', $reward->url_image);
    }

    public function test_url_image_accessor_handles_null(): void
    {
        $reward = new Reward();
        $reward->url_image = null;

        $this->assertNull($reward->url_image);
    }
}

