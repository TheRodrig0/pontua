<?php

namespace App\Parsers;

use App\Parsers\Contract\TaxReceiptParserInterface;

class NfeParser implements TaxReceiptParserInterface
{
    public function parse(string $raw): array
    {
        return [];
    }
}
