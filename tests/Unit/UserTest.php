<?php

namespace Tests\Unit;

use App\Models\User;
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    public function test_masked_email_formats_correctly(): void
    {
        $user = new User();

        $user->email = 'rodrigo.aluno@fatec.sp.gov.br';
        $this->assertEquals('r***o@fatec.sp.gov.br', $user->maskedEmail());

        $user->email = 'ab@fatec.sp.gov.br';
        $this->assertEquals('a*@fatec.sp.gov.br', $user->maskedEmail());

        $user->email = 'a@fatec.sp.gov.br';
        $this->assertEquals('*@fatec.sp.gov.br', $user->maskedEmail());

        $user->email = 'invalido';
        $this->assertEquals('***', $user->maskedEmail());
    }
}

