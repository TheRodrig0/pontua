<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinição de Senha - Pontua</title>
  <style>
    body {
      margin: 0;
      padding: 24px 12px;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
    a {
      text-decoration: none;
    }
  </style>
</head>
<body style="margin: 0; padding: 32px 12px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <tr>
      <td style="padding: 24px 28px 20px 28px; border-bottom: 1px solid #f1f5f9;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td align="left">
              <a href="{{ url('/') }}" style="display: inline-block; text-decoration: none;">
                <table cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td valign="middle" style="padding-right: 10px;">
                      <img src="{{ url('images/logo.svg') }}" width="32" height="32" alt="Logo Pontua" style="display: block; border: 0;">
                    </td>
                    <td valign="middle">
                      <span style="font-size: 20px; font-weight: 900; letter-spacing: -0.5px; color: #0f172a;">PONTUA<span style="color: #ea7349;">.</span></span>
                    </td>
                  </tr>
                </table>
              </a>
            </td>
            <td align="right" valign="middle">
              <span style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Segurança</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td align="center" style="padding: 32px 28px; text-align: center;">
        <h1 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 800; color: #0f172a; text-align: center; line-height: 1.3;">
          Redefinição de Senha
        </h1>
        <p style="margin: 0 0 24px 0; font-size: 14px; color: #475569; text-align: center; line-height: 1.5;">
          Olá, <strong>{{ $user->name ?? 'Usuário' }}</strong>! Recebemos uma solicitação para redefinir a senha da sua conta no Pontua.
        </p>

        <!-- CTA Button -->
        <table align="center" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto 24px auto;">
          <tr>
            <td align="center">
              <a href="{{ $url }}" style="display: inline-block; background-color: #4bb9a6; color: #ffffff; font-size: 14px; font-weight: 700; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
                Redefinir Minha Senha &rarr;
              </a>
            </td>
          </tr>
        </table>

        <!-- Security Notice Box -->
        <table align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; margin: 0 auto 20px auto; text-align: center;">
          <tr>
            <td align="center" style="padding: 16px; text-align: center;">
              <span style="display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                Informações de Segurança:
              </span>
              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                Este link expira em <strong>{{ $expiresInMinutes }} minutos</strong> e é de uso único.
              </p>
            </td>
          </tr>
        </table>

        <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
          Se você não solicitou a alteração, fique tranquilo: nenhuma ação é necessária e sua senha atual permanece segura.
        </p>
      </td>
    </tr>

  </table>
</body>
</html>
