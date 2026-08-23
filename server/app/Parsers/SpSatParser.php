<?php

namespace App\Parsers;

use App\Parsers\Contract\TaxReceiptParserInterface;

class SpSatParser implements TaxReceiptParserInterface
{
    public function parse(string $raw): array
    {
        return [];
    }
}