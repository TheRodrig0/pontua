<div align="center">

  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/pontua-logo-dark.svg" />
    <source media="(prefers-color-scheme: light)" srcset="docs/brand/pontua-logo-light.svg" />
    <img src="docs/brand/pontua-logo-light.svg" alt="PONTUA." width="280" />
  </picture>

  <br>
  
  <p>
    <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
    <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
    <img src="https://img.shields.io/badge/Inertia.js-9553E9?style=for-the-badge&logo=inertia&logoColor=white" alt="Inertia.js" />
    <img src="https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/PHP_8.3+-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP 8.3+" />
    <img src="https://img.shields.io/badge/Laravel_13-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel 13" />
    <img src="https://img.shields.io/badge/Supabase_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase PostgreSQL" />
    <img src="https://img.shields.io/badge/Oracle_Cloud-F80000?style=for-the-badge&logo=oracle&logoColor=white" alt="Oracle Cloud" />
    <img src="https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare" />
    <img src="https://img.shields.io/badge/Brevo-0B996F?style=for-the-badge&logo=brevo&logoColor=white" alt="Brevo" />
  </p>

  <p>
    <strong>Português</strong> &nbsp;|&nbsp;
    <a href="README.en.md">English</a>
  </p>

</div>

---

> **Fatec Franco da Rocha** — Tecnologia em Gestão da Tecnologia da Informação  
> Artigo publicado no **VI SIMBAJU** — Simpósio da Bacia do Juquery (Energia e Tecnologia)

---

<br>

# 01 · Sobre o Projeto

O **Pontua** é uma aplicação web desenvolvida para modernizar e impulsionar a campanha de arrecadação de cupons fiscais da **Fatec Franco da Rocha (FFR)** em benefício da **APAE** (*Associação de Pais e Amigos dos Excepcionais*).

Na operação tradicional, as notas fiscais recebidas pela entidade precisam ser registradas no programa *Nota Fiscal Paulista* dentro de um **prazo legal máximo de 40 dias**. A dependência de uma urna física, o transporte presencial semanal e a triagem manual de papéis geravam gargalos operacionais, perda de notas vencidas e baixa participação estudantil.

<br>

| Modelo Tradicional (Urna Física) | Solução Pontua (Fluxo Digital) |
| :--- | :--- |
| Coleta restrita a uma urna física no campus. | **Leitura Instantânea:** QR Code via câmera ou digitação da chave de 44 dígitos. |
| Transporte semanal e triagem manual exaustiva na APAE. | **Validação SEFAZ-SP:** Extração automática de dados fiscais e bloqueio de duplicatas. |
| Perda constante de notas pelo prazo legal de 40 dias. | **Lote Diário Automatizado:** Envio de CSV estruturado diretamente para a APAE à meia-noite. |
| Baixa adesão dos alunos por falta de retorno palpável. | **Gamificação e AACC:** Pontos acumulativos (FIFO), *streaks*, loja e certificados oficiais. |

<br>
<br>

# 02 · Pesquisa em Campo

Para validar as dores do modelo manual e o impacto potencial do sistema de recompensas, foi aplicado um levantamento quantitativo (*survey*) com a comunidade acadêmica da **Fatec Franco da Rocha (FFR)**, complementado por entrevista qualitativa com a coordenação do curso.

* **Perfil da Amostra:** 20 respondentes (**95%** alunos dos cursos de GTI, GEEE e DSM; **5%** funcionários administrativos).
* **Gargalo de Adesão:** Embora **75%** já conhecessem o programa de doação, **53,3%** doavam raramente e **26,7%** nunca haviam doado.
* **Principais Motivos:** Esquecimento de guardar as notas em papel (**84,6%**), falta de incentivo (**30,8%**) e trabalho para guardar e depositar na urna física (**23,1%**).
* **Validação da Solução:** **95%** afirmaram que participariam com maior frequência caso houvesse incentivos como **horas complementares (AACC)** e brindes.

<br>

<table>
  <tr>
    <td width="50%" align="center">
      <img src="docs/research/01-perfil-participantes.png" alt="Perfil dos participantes" width="100%" />
    </td>
    <td width="50%" align="center">
      <img src="docs/research/02-cursos.png" alt="Distribuição por curso" width="100%" />
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="docs/research/03-conhecimento-programa.png" alt="Conhecimento prévio do programa" width="100%" />
    </td>
    <td width="50%" align="center">
      <img src="docs/research/04-frequencia-doacao.png" alt="Frequência de doação de notas fiscais" width="100%" />
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="docs/research/05-motivos-baixa-doacao.png" alt="Motivos para não doar ou doar com pouca frequência" width="100%" />
    </td>
    <td width="50%" align="center">
      <img src="docs/research/06-impacto-incentivos-aacc.png" alt="Impacto de incentivos como horas AACC e brindes" width="100%" />
    </td>
  </tr>
</table>

<br>

# 03 · Processos de Negócio (BPMN)

A arquitetura de software foi orientada pela modelagem de processos (**BPMN**) para eliminar os gargalos operacionais do modelo manual.


### 1. Cenário Inicial (Fluxo Manual com Urna Física)

<p align="center">
  <img src="docs/process-maps/process-map-initial.svg" alt="Mapa de Processos - Cenário Inicial (Manual)" width="90%" />
</p>

* **Gargalos mapeados:** Deslocamento semanal obrigatório da coordenação, desamasso manual de cupons na APAE, digitação no sistema *Nota Bem* e perdas financeiras por expiração do prazo legal de 40 dias.

<br>

### 2. Cenário Proposto (Automação Completa com o Pontua)

<p align="center">
  <img src="docs/process-maps/process-map-proposed.svg" alt="Mapa de Processos - Cenário Proposto (Pontua)" width="100%" />
</p>

* **Comunidade Acadêmica (Doador):** Escaneia o QR Code, acompanha a validação, acumula pontos, transfere saldo ou resgata prêmios/horas AACC.
* **Sistema Pontua:** Processa assincronamente na SEFAZ e bifurca o fluxo: (1) credita pontos com multiplicador de sequência na carteira; (2) consolida o lote diário em CSV à meia-noite (`00:00`) e despacha para a APAE.
* **Administração FFR:** Valida o voucher para entrega de brindes ou homologação de certificados AACC.
* **APAE:** Recebe os lotes fiscais digitais formatados por e-mail, sem contato com papel.

<br>

# 04 · Funcionalidades

### Módulo do Usuário (Comunidade Acadêmica)

* **Leitor de QR Code Integrado:** Leitura em tempo real via câmera (`jsQR` / `qr-scanner`) ou entrada manual.
* **Carteira e Extrato de Pontos:** Controle transacional de créditos e débitos com regra de expiração **FIFO**.
* **Gamificação e Streaks:** Bônus multiplicadores por dias consecutivos de doação e ranking acadêmico dinâmico.
* **Transferência entre Alunos:** Repasse direto de saldo de pontos entre usuários cadastrados.
* **Loja e Certificados AACC:** Resgate de itens físicos e emissão de certificados de horas complementares com autenticação.

<br>

### Módulo Administrativo e Governança

* **Painel de Controle:** Métricas operacionais em tempo real de notas, arrecadação repassada e engajamento.
* **Despacho Automático para a APAE:** Rotina diária (`SendApaeDailyBatchJob`) que consolida e envia o lote de cupons por e-mail.
* **Gestão de Recompensas e Estoque:** Controle de inventário de produtos e validação de códigos de resgate.
* **Moderação e Conformidade LGPD:** Registro de advertências, bloqueio auditado de contas e mascaramento de dados sensíveis.

<br>

# 05 · Stack Tecnológica

| Camada | Tecnologia | Finalidade |
| :--- | :--- | :--- |
| **Linguagens Front-end** | **HTML5, CSS3, JavaScript & TypeScript** | Estrutura semântica, estilização, interatividade e tipagem estática |
| **Front-end** | **React 19 + Inertia.js + Vite** | Interface SPA reativa orientada a componentes e empacotamento via Node.js |
| **Estilização** | **Tailwind CSS v4** | Sistema visual utilitário e responsivo |
| **Back-end** | **PHP 8.3+ / Laravel 13** | Regras de negócio, filas assíncronas (`Jobs`), agendamento (`Schedule`) e segurança |
| **Autenticação** | **Laravel Sanctum** | Autenticação SPA segura via cookies com proteção CSRF |
| **Banco de Dados** | **PostgreSQL (Supabase) / SQLite** | Modelagem relacional estrita com integridade referencial |
| **Mensageria** | **Brevo (SMTP)** | E-mails transacionais de recuperação de senha, vouchers e lotes da APAE |
| **Infraestrutura** | **Oracle Cloud (OCI) + Cloudflare** | Hospedagem de aplicação, proxy reverso, SSL/TLS, CDN e proteção WAF |

<br>

# 06 · Instalação e Execução Local

### Pré-requisitos
* PHP 8.3+ (extensões `pdo`, `mbstring`, `openssl`, `curl`)
* Composer
* Node.js 20+ e npm

<br>

### Passo a Passo

```bash
# 1. Clonar repositório e acessar diretório
git clone https://github.com/TheRodrig0/pontua.git
cd pontua

# 2. Instalar dependências
composer install
npm install

# 3. Configurar ambiente e chave
cp .env.example .env
php artisan key:generate

# 4. Criar banco local e executar migrações com seeders
touch database/database.sqlite
php artisan migrate --seed
```

<br>

Inicie os serviços de desenvolvimento:

```bash
# Terminal 1: Servidor web
php artisan serve

# Terminal 2: Compilação de assets (Vite)
npm run dev

# Terminal 3 (Opcional): Worker de filas em segundo plano
php artisan queue:work
```

Acesse em: `http://localhost:8000`

<br>

# 07 · Equipe e Instituições

### Autores
* **Marcos Vinicius de Oliveira Campos**
* **Murilo Decanini dos Santos**
* **Nicolas Santiago Baroco**
* **Rafael Costa Perondi**
* **Rodrigo Jeronimo de Queiroz Silva** ([@TheRodrig0](https://github.com/TheRodrig0))

<br>

### Instituições Envolvidas
* **Fatec Franco da Rocha (FFR):** Instituição de ensino superior — ambiente de pesquisa, desenvolvimento e validação.
* **APAE:** Organização da sociedade civil beneficiada pelos lotes automatizados de cupons fiscais.

<br>

# 08 · Licença

Distribuído sob os termos da licença disponível no arquivo [LICENSE](LICENSE).
