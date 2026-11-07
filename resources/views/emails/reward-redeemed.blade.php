<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Resgate - Pontua</title>
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
              <span style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Resgate</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td align="center" style="padding: 32px 28px; text-align: center;">
        <h1 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 800; color: #0f172a; text-align: center; line-height: 1.3;">
          Código de Resgate
        </h1>
        <p style="margin: 0 0 24px 0; font-size: 14px; color: #475569; text-align: center; line-height: 1.5;">
          Olá, <strong>{{ $user->name }}</strong>! Sua solicitação para <strong>{{ $redemption->reward?->name ?? 'Recompensa' }}</strong> ({{ $redemption->points_cost }} pts) foi confirmada.
        </p>

        <!-- Voucher Box -->
        <table align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; margin: 0 auto 20px auto; text-align: center;">
          <tr>
            <td align="center" style="padding: 20px 16px; text-align: center;">
              <span style="display: block; font-size: 12px; font-weight: 500; color: #64748b; margin-bottom: 6px;">
                Apresente na Administração da FATEC:
              </span>
              <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: 2px; padding: 4px 0;">
                {{ $redemption->voucher_code }}
              </div>
              <span style="display: block; font-size: 11px; color: #94a3b8; margin-top: 6px;">
                Uso único &bull; Pontos reservados da sua carteira
              </span>
            </td>
          </tr>
        </table>

        <p style="margin: 0 0 24px 0; font-size: 13px; color: #64748b; text-align: center; line-height: 1.5;">
          Basta apresentar este código na Administração da FATEC para retirar o seu prêmio.
        </p>

        <!-- Button -->
        <table align="center" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
          <tr>
            <td align="center">
              <a href="{{ url('/dashboard') }}" style="display: inline-block; background-color: #4bb9a6; color: #ffffff; font-size: 13px; font-weight: 700; padding: 11px 24px; border-radius: 8px; text-decoration: none;">
                Acessar o Pontua &rarr;
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

  </table>
</body>
</html>
