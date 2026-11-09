const LARAVEL_VALIDATION_DICTIONARY: Record<string, Record<string, string>> = {
    'validation.required': {
        name: 'Informe o seu nome completo.',
        email: 'Informe o seu endereço de e-mail.',
        password: 'Informe a sua senha de acesso.',
        nick: 'Informe um apelido válido.',
        url: 'O link da nota fiscal é obrigatório.',
        amount: 'Informe a quantidade de pontos para doar.',
        recipient_id: 'Selecione um estudante destinatário.',
        default: 'Este campo é obrigatório.',
    },
    'validation.email': {
        default: 'Informe um endereço de e-mail válido.',
    },
    'validation.min.string': {
        password: 'A senha precisa ter no mínimo 8 caracteres.',
        name: 'O nome informado é muito curto.',
        default: 'Este campo não atingiu o tamanho mínimo exigido.',
    },
    'validation.max.string': {
        name: 'O nome informado excede o limite de caracteres.',
        nick: 'O apelido pode ter no máximo 50 caracteres.',
        default: 'Este campo excede o limite máximo de caracteres.',
    },
    'validation.unique': {
        email: 'Este e-mail já está cadastrado na plataforma.',
        nick: 'Este @apelido já está em uso por outro estudante.',
        access_key: 'Esta nota fiscal já foi inserida no sistema.',
        default: 'Este registro já está cadastrado no sistema.',
    },
    'validation.confirmed': {
        password: 'A confirmação da senha não coincide.',
        default: 'A confirmação do campo não coincide.',
    },
    'validation.current_password': {
        password: 'A senha atual informada está incorreta.',
        default: 'A senha informada está incorreta.',
    },
    'validation.exists': {
        recipient_id: 'O destinatário selecionado não foi encontrado.',
        default: 'O item selecionado é inválido.',
    },
    'validation.not_in': {
        recipient_id: 'Você não pode doar pontos para si mesmo.',
        default: 'O valor selecionado não é permitido.',
    },
    'validation.min.numeric': {
        amount: 'A doação mínima é de 1 ponto.',
        cost: 'O custo mínimo deve ser de 1 ponto.',
        default: 'O valor informado é menor que o mínimo permitido.',
    },
    'Unauthenticated.': {
        default: 'Sua sessão expirou. Faça login novamente para continuar.',
    },
    'passwords.token': {
        default: 'O código ou link de redefinição de senha é inválido ou expirou.',
    },
    'passwords.user': {
        default: 'Não encontramos nenhum estudante cadastrado com este endereço de e-mail.',
    },
    'passwords.throttled': {
        default: 'Aguarde alguns instantes antes de tentar novamente.',
    },
    'passwords.sent': {
        default: 'Enviamos o link de redefinição de senha para o seu e-mail.',
    },
    'passwords.reset': {
        default: 'A sua senha foi redefinida com sucesso.',
    },
};

export function translateLaravelValidationError(rawMessage: string | undefined | null, field = 'default'): string {
    const hasMessage = Boolean(rawMessage && rawMessage.trim());
    if (!hasMessage) {
        return 'Ocorreu um erro ao validar os dados informados.';
    }

    const trimmed = rawMessage!.trim();
    const dictionaryEntry = LARAVEL_VALIDATION_DICTIONARY[trimmed];
    const hasDictionaryEntry = Boolean(dictionaryEntry);

    if (hasDictionaryEntry) {
        return dictionaryEntry[field] || dictionaryEntry.default;
    }

    const isRawValidationKey = trimmed.startsWith('validation.');
    if (isRawValidationKey) {
        if (trimmed.includes('min')) {
            return field === 'password'
                ? 'A senha precisa ter no mínimo 8 caracteres.'
                : 'O valor informado é menor que o mínimo exigido.';
        }
        if (trimmed.includes('unique')) {
            return 'Este dado já está cadastrado no sistema.';
        }
        if (trimmed.includes('confirmed')) {
            return 'A confirmação da senha não coincide.';
        }
        if (trimmed.includes('email')) {
            return 'Informe um formato de e-mail válido.';
        }
        if (trimmed.includes('required')) {
            return 'Preencha todos os campos obrigatórios.';
        }
        return 'Verifique os campos destacados e tente novamente.';
    }

    return trimmed;
}
