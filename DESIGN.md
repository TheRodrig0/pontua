# DESIGN.md — Pontua Design System

Especificação visual do **Pontua**: cores, superfícies, tipografia, grade, espaçamentos, componentes, motion e acessibilidade.

---

## 1. Direção Visual

- **Estilo:** **Flat 2.0 / Editorial Flat** com toque tátil sutil (bordas `1px`, divisórias horizontais, contraste chapado e espaço em branco aberto).
- **Fundo contínuo na landing:** uma única superfície base (`bg-white dark:bg-app-landing-dark`) em todas as seções, sem faixas alternadas.
- **Zero estética genérica de IA:** sem blobs/gradientes difusos de fundo, sem *glassmorphism*, sem sombras borradas pesadas e sem bordas laterais coloridas em cards.

---

## 2. Cores e Tokens (`resources/css/app.css`)

Use sempre os tokens definidos em `:root` e `@theme` em `resources/css/app.css`.

### 2.1 Paleta da Marca

| Token | Hex | Uso |
| :--- | :--- | :--- |
| `app-teal` | `#4bb9a6` | Destaque primário no dark mode, superfícies de marca e elementos gráficos |
| `app-teal-deep` | `#1e7869` | Botões primários, links e textos de destaque no **light mode** |
| `app-teal-hover` | `#3da392` | Hover de superfícies `app-teal` |
| `app-teal-light` | `#5bc6b3` | Hover de botões `app-teal` no dark mode |
| `app-teal-ink` | `#141c1b` | Texto de alto contraste sobre `app-teal` |
| `app-coral` | `#ea7349` | Acento secundário no dark mode e detalhes gráficos |
| `app-coral-heading` | `#d86238` | Texto de destaque coral no **light mode** |
| `app-coral-deep` | `#c2410c` | Ícones e textos coral de alto contraste no light mode |
| `app-navy` | `#3b475c` | **Cor padrão de títulos e textos principais no light mode** |
| `app-navy-dark` | `#273142` | Blocos escuros de alto contraste |
| `app-gold` | `#f2c84b` | Destaques de conquista e prioridade |
| `app-gold-dark` | `#e0a96d` | Variação dourada escura |

### 2.2 Superfícies (Light & Dark)

| Camada | Light Mode | Dark Mode |
| :--- | :--- | :--- |
| **Canvas (Landing)** | `bg-white` (`#ffffff`) | `dark:bg-app-landing-dark` (`#1c2026`) |
| **Cards (Landing)** | `bg-[#F5F7F9]` | `dark:bg-app-receipt-dark` (`#242931`) |
| **Sub-superfície interna** | `bg-white` (`#ffffff`) | `dark:bg-[#171b22]` |
| **Hover / Elevado** | `bg-app-bg` (`#eff3f6`) | `dark:bg-app-elevated-dark` (`#2e3440`) |
| **Canvas (App)** | `bg-app-bg` (`#eff3f6`) | `dark:bg-app-darkbg` (`#111827`) |
| **Cards (App)** | `bg-white` (`#ffffff`) | `dark:bg-app-darkcard` (`#182234`) |
| **Rodapé** | `bg-[#18202c]` | `dark:bg-[#12151a]` |

### 2.3 Neutros, Texto e Bordas

- **Texto principal:** `text-app-navy dark:text-slate-100`
- **Texto secundário:** `text-slate-600 dark:text-slate-300`
- **Metadados / rótulos:** `text-slate-500 dark:text-slate-400` ou `text-app-graytext` (`#7a889b`)
- **Bordas neutras:** `border-app-navy/10 dark:border-white/10` (variações `/8` e `/12`)
- **Divisórias editoriais:** `divide-y divide-app-navy/10 dark:divide-white/10` e `border-y border-app-navy/10 dark:border-white/10`

---

## 3. Tipografia

- **Display e UI:** `'Poppins', sans-serif` (`400`–`900`).
- **Corpo auxiliar:** `'Inter', sans-serif`.
- **Monospace (`font-mono`):** códigos e identificadores tabulares.

| Nível | Classes | Regra |
| :--- | :--- | :--- |
| **Hero `<h1>`** | `text-[2.125rem] sm:text-5xl md:text-[clamp(2.65rem,4.35vw,5.15rem)] font-black leading-[1.15] tracking-tight` | Alinhado à esquerda |
| **Section `<h2>`** | `landing-heading text-left text-[1.625rem] sm:text-4xl font-black tracking-tight leading-[1.14]` | `text-wrap: balance` |
| **Section Kicker** | `block text-xs font-extrabold text-app-teal-deep dark:text-app-teal` | **Apenas texto verde**, sem fundo ou borda |
| **Card `<h3>`** | `landing-heading text-lg sm:text-xl font-black tracking-tight leading-snug` | 2–5 palavras |
| **Corpo** | `landing-copy text-xs sm:text-sm leading-relaxed` | `text-wrap: pretty`, 1 linha curta em cards |
| **Números** | `tabular-nums` | Obrigatório em valores, datas e posições |

- Nunca fixar `height` em botões, badges ou cards com texto (usar `min-h-*` + padding).
- Nunca usar `text-align: justify`.

---

## 4. Layout, Grade e Espaçamentos

- **Container:** `w-full md:max-w-[min(86vw,100rem)] mx-auto px-5 sm:px-6`.
- **Padding vertical de seção:** `py-12 sm:py-16` uniforme.
- **Hero:** `min-h-dvh pt-16 sm:pt-18 flex flex-col justify-between`.
- **Alinhamento de títulos:** todos os cabeçalhos de seção sempre alinhados à esquerda no topo da seção (`space-y-8` até o conteúdo).
- **Bento Grid assimétrico:** `grid-cols-1 lg:grid-cols-6 gap-5` (`4 + 2` na 1ª linha, `3 + 3` na 2ª linha), empilhando em 1 coluna no mobile.
- **Raios de borda:**
  - Cards principais: `rounded-2xl` (`16px`)
  - Sub-cards e inputs: `rounded-xl` (`12px`) ou `rounded-lg` (`8px`)
  - Botões CTA e pílulas de status: `rounded-full`

---

## 5. Componentes Base

- **Header:** fixo (`h-16 sm:h-18`), `bg-white dark:bg-app-landing-dark`. Link ativo usa **apenas cor de texto verde** (`text-app-teal-deep dark:text-app-teal`), sem fundo pill nem borda.
- **Botão primário (Landing):** `min-h-12 px-6 py-3 rounded-full bg-app-teal-deep hover:bg-[#176155] dark:bg-app-teal dark:hover:bg-app-teal-light text-white dark:text-app-teal-ink text-sm font-bold`.
- **Botão secundário (Landing):** `min-h-12 px-5 py-3 rounded-full bg-transparent hover:bg-app-bg dark:hover:bg-app-elevated-dark text-slate-700 dark:text-slate-200 text-sm font-semibold`.
- **Listas de conteúdo / FAQ:** divisórias `border-y` + `divide-y` sobre o fundo contínuo, em vez de empilhar caixas cinza.
- **Acordeão:** `<details name="...">` nativo exclusivo, sem headings dentro de `<summary>`, ícone antes do rótulo e transição via `::details-content` + `interpolate-size: allow-keywords`.
- **Formulários e Modais (App):** `.input-field-app`, `.btn-primary-teal`, `.modal-overlay`, `.modal-card`.

---

## 6. Motion e Acessibilidade

- **Transições de UI:** `<= 250ms` com `cubic-bezier(0.22, 1, 0.36, 1)` (nunca `linear`).
- **Movimento reduzido:** condicionar animações espaciais a `@media (prefers-reduced-motion: no-preference)` / `motion-safe:`.
- **Alvos de toque:** mínimo `min-h-11` (`44px`) ou `min-h-12` (`48px`).
- **Foco visível:** `focus-visible:outline-2 focus-visible:outline-app-teal-deep dark:focus-visible:outline-app-teal focus-visible:outline-offset-2`.
- **Contraste:** WCAG AA (4.5:1 texto normal, 3:1 texto grande e componentes); nunca depender só de cor para indicar estado.
- **Decorativos:** elementos puramente visuais e ícones redundantes sempre com `aria-hidden="true"`.

---

## 7. Anti-Padrões de Design

- Não empilhar caixas `#F5F7F9` repetidas para listas simples de texto.
- Não adicionar bordas coloridas laterais ou topos gradientes em cards.
- Não aplicar fundo/pill em links ativos do Header ou em kickers de seção.
- Não usar sombras borradas pesadas (`shadow-xl`), blobs `blur-3xl` ou *glassmorphism*.
- Não misturar alinhamentos de título entre seções (ex.: centralizado em uma e à esquerda em outra).
- Não encher cards com parágrafos longos ou múltiplos rótulos redundantes.
