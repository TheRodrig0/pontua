<?php

namespace App\Parsers\Contract;

interface TaxReceiptParserInterface
{
    public function parse(string $raw): array;
}