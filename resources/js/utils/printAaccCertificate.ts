export interface AaccCertificateData {
    studentName: string;
    studentEmail?: string | null;
    rewardName: string;
    pointsCost: number;
    voucherCode: string;
    issuedAt?: string | null;
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function openAaccCertificatePrint(data: AaccCertificateData): void {
    const printWindow = window.open('', '_blank', 'width=1120,height=800');
    if (!printWindow) {
        window.alert('Permita a abertura de pop-ups no navegador para salvar o Certificado em PDF.');
        return;
    }

    const formattedDate = data.issuedAt
        ? new Date(data.issuedAt).toLocaleDateString('pt-BR')
        : new Date().toLocaleDateString('pt-BR');

    const studentName = escapeHtml(data.studentName || 'Estudante');
    const voucherCode = escapeHtml(data.voucherCode);

    const hoursMatch =
        data.rewardName.match(/\((\d+)\s*h(?:oras?)?\)/i) ||
        data.rewardName.match(/\b(\d+)\s*horas?\b/i);
    const extractedHours = hoursMatch ? parseInt(hoursMatch[1], 10) : null;
    const hoursLabel =
        extractedHours !== null
            ? `${extractedHours} ${extractedHours === 1 ? 'hora' : 'horas'}`
            : null;

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Certificado Pontua - ${voucherCode}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        @page {
            size: A4 landscape;
            margin: 0;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        html, body {
            background-color: #f1f5f9;
            font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #3b475c;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        body {
            padding: 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .toolbar {
            width: 297mm;
            max-width: 100%;
            margin-bottom: 16px;
            background: #273142;
            color: #ffffff;
            padding: 12px 24px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .toolbar span {
            font-size: 13px;
            font-weight: 500;
            color: #cbd5e1;
        }
        .toolbar-actions {
            display: flex;
            gap: 10px;
        }
        .btn-print {
            background: #4bb9a6;
            color: #ffffff;
            border: none;
            padding: 9px 20px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            font-family: inherit;
        }
        .btn-close {
            background: transparent;
            color: #cbd5e1;
            border: 1px solid #475569;
            padding: 9px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            font-family: inherit;
        }

        /* Moldura A4 Paisagem elegante com proporção equilibrada */
        .page-sheet {
            width: 297mm;
            height: 210mm;
            background: #ffffff;
            border: 1.5px solid #e2e8f0;
            box-shadow: 0 12px 32px rgba(59, 71, 92, 0.08);
            padding: 28mm 32mm;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        /* 1. Header (Logo + Certificado) */
        .header-block {
            width: 100%;
        }
        .brand-row {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 6mm;
        }
        .brand-name {
            font-family: 'Poppins', sans-serif;
            font-size: 26px;
            font-weight: 900;
            color: #3b475c;
            letter-spacing: -0.05em;
        }
        .brand-name span {
            color: #ea7349;
        }
        .title-main {
            font-size: 34px;
            font-weight: 800;
            letter-spacing: 4px;
            color: #273142;
            line-height: 1.1;
        }
        .title-sub {
            display: inline-block;
            margin-top: 2.5mm;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 2.5px;
            color: #4bb9a6;
        }

        /* 2. Corpo Central (Aluno + Texto com distância equilibrada) */
        .body-block {
            width: 100%;
            margin-top: 10mm;
        }
        .student-label {
            font-size: 11.5px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 2.5px;
            color: #7a889b;
            margin-bottom: 3mm;
        }
        .student-name {
            font-size: 40px;
            font-weight: 800;
            color: #273142;
            line-height: 1.15;
            letter-spacing: -0.5px;
        }
        .name-divider {
            width: 240px;
            height: 2px;
            background: #ea7349;
            margin: 4mm auto 6mm auto;
        }
        .description {
            max-width: 220mm;
            font-size: 15.5px;
            line-height: 1.7;
            color: #3b475c;
            margin: 0 auto;
        }
        .description strong {
            color: #273142;
        }

        /* 3. Rodapé posicionado naturalmente */
        .footer-block {
            width: 100%;
            margin-top: auto;
        }
        .footer-divider {
            width: 100%;
            height: 1.5px;
            background: #f1f5f9;
            margin-bottom: 5mm;
        }
        .footer-content {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .meta-box {
            display: flex;
            flex-direction: column;
        }
        .meta-box.left {
            align-items: flex-start;
        }
        .meta-box.right {
            align-items: flex-end;
        }
        .meta-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: #7a889b;
            letter-spacing: 1.5px;
            margin-bottom: 2mm;
        }
        .meta-value {
            font-size: 16px;
            font-weight: 600;
            color: #273142;
        }
        .meta-code {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 15.5px;
            font-weight: 800;
            color: #273142;
            letter-spacing: 1.5px;
            background: #f8fafc;
            border: 1.5px solid #9aa6b8;
            padding: 6px 18px;
            border-radius: 6px;
        }

        @media print {
            html, body {
                background: #ffffff;
                padding: 0;
                margin: 0;
            }
            .toolbar {
                display: none !important;
            }
            .page-sheet {
                border: none;
                box-shadow: none;
                width: 297mm;
                height: 210mm;
                overflow: hidden;
                page-break-after: avoid;
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="toolbar">
        <span>Para anexar no SIGA, clique em "Salvar PDF / Imprimir" e escolha "Salvar como PDF".</span>
        <div class="toolbar-actions">
            <button type="button" class="btn-print" onclick="window.print()">Salvar PDF / Imprimir</button>
            <button type="button" class="btn-close" onclick="window.close()">Fechar</button>
        </div>
    </div>

    <div class="page-sheet">
        <div class="header-block">
            <div class="brand-row">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="34" height="34">
                    <g transform="rotate(-6 24 24)">
                        <rect x="2" y="2" width="44" height="44" rx="10" fill="#4BB9A6" />
                        <g transform="translate(12, 12)">
                            <path fill="#FFFFFF" fill-rule="evenodd" clip-rule="evenodd" d="M 4 5.75 C 4 4.5 5 3.5 6.25 3.5 H 14 C 17.5 3.5 20.25 6.1 20.25 9.25 C 20.25 12.35 17.5 14.5 14 14.5 H 8 V 18.75 C 8 19.7 7.2 20.5 6.25 20.5 C 5.3 20.5 4 19.7 4 18.75 V 5.75 Z M 8 7 V 11.25 H 13.75 C 15.2 11.25 16.5 10.35 16.5 9.2 C 16.5 8 15.2 7 13.75 7 H 8 Z" />
                            <circle cx="17.75" cy="18.25" r="2.25" fill="#EA7349" />
                        </g>
                    </g>
                </svg>
                <span class="brand-name">PONTUA<span>.</span></span>
            </div>
            <h1 class="title-main">CERTIFICADO</h1>
            <div class="title-sub">ATIVIDADES COMPLEMENTARES &bull; AACC</div>
        </div>

        <div class="body-block">
            <div class="student-label">Certificamos que</div>
            <div class="student-name">${studentName}</div>
            <div class="name-divider"></div>
            <p class="description">
                participou das ações de engajamento social e arrecadação fiscal na <strong>FATEC Franco da Rocha</strong>
                em apoio à <strong>APAE</strong>${
                    hoursLabel
                        ? `, totalizando o cumprimento de <strong>${hoursLabel}</strong> de atividades complementares.`
                        : ' em atividades complementares (AACC).'
                }
            </p>
        </div>

        <div class="footer-block">
            <div class="footer-divider"></div>
            <div class="footer-content">
                <div class="meta-box left">
                    <div class="meta-label">Data de Emissão</div>
                    <div class="meta-value">${formattedDate}</div>
                </div>

                <div class="meta-box right">
                    <div class="meta-label">Código de Autenticidade</div>
                    <div class="meta-code">${voucherCode}</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
}
