<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'PONTUA') - Solidariedade APAE</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <!-- Anti-flash script for Dark Mode -->
    <script>
        (function () {
            const savedTheme = localStorage.getItem('theme') || localStorage.getItem('pontua_theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        })();
    </script>
    
    @vite(['resources/css/app.css'])

    <style>
        /* ======================================================
           SIDEBAR LAYOUT — State-Driven CSS
           Expanded  : [data-collapsed="false"] → w-64
           Collapsed : [data-collapsed="true"]  → w-[72px]
        ====================================================== */

        :root {
            --sidebar-expanded: 256px;
            --sidebar-collapsed: 72px;
        }

        #main-sidebar {
            width: var(--sidebar-expanded);
            transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: visible;
            position: relative;
            height: 100vh;
            max-height: 100vh;
        }

        /* Collapsed state on the aside element itself */
        #main-sidebar[data-collapsed="true"] {
            width: var(--sidebar-collapsed);
        }

        /* ---- Logo area ---- */
        .sidebar-logo-area {
            height: 72px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            padding: 0 16px;
            border-bottom: 1px solid transparent;
            flex-shrink: 0;
        }

        #main-sidebar[data-collapsed="true"] .sidebar-logo-area {
            justify-content: center;
            padding: 0;
        }

        /* Toggle button: always floats on the right edge of the sidebar */
        #sidebar-toggle-btn {
            position: absolute;
            right: -13px;
            top: calc(72px / 2 - 13px);
            z-index: 50;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            border: 1px solid #e2e8f0;
            background: #fff;
            box-shadow: 0 1px 4px rgba(59,71,92,0.12);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #94a3b8;
            transition: background 0.15s, color 0.15s, box-shadow 0.15s;
            flex-shrink: 0;
        }

        #sidebar-toggle-btn:hover {
            background: #f8fafc;
            color: #475569;
            box-shadow: 0 2px 8px rgba(59,71,92,0.18);
        }

        /* ---- Logo link ---- */
        .sidebar-logo-link {
            display: flex;
            align-items: center;
            gap: 10px;
            overflow: hidden;
            text-decoration: none;
            min-width: 0;
        }

        #main-sidebar[data-collapsed="true"] .sidebar-logo-link {
            gap: 0;
        }

        /* Text that slides/fades out */
        .sidebar-label {
            display: block;
            overflow: hidden;
            white-space: nowrap;
            opacity: 1;
            max-width: 200px;
            transition: max-width 0.2s ease, opacity 0.15s ease;
        }

        #main-sidebar[data-collapsed="true"] .sidebar-label {
            max-width: 0;
            opacity: 0;
            pointer-events: none;
        }

        /* ---- Nav links ---- */
        .sidebar-nav-link {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            border-radius: 12px;
            font-size: 0.875rem;
            font-weight: 500;
            text-decoration: none;
            transition: background-color 0.15s, color 0.15s;
            white-space: nowrap;
            overflow: hidden;
        }

        #main-sidebar[data-collapsed="true"] .sidebar-nav-link {
            justify-content: center;
            padding: 10px 0;
            gap: 0;
        }

        .sidebar-nav-link .nav-icon {
            flex-shrink: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* ---- Bottom user card ---- */
        .sidebar-user-card {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px;
            border-radius: 12px;
            overflow: hidden;
        }

        #main-sidebar[data-collapsed="true"] .sidebar-user-card {
            justify-content: center;
            padding: 8px 0;
            gap: 0;
        }

        .sidebar-logout-link {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            border-radius: 8px;
            overflow: hidden;
        }

        #main-sidebar[data-collapsed="true"] .sidebar-logout-link {
            justify-content: center;
            padding: 8px 0;
            gap: 0;
        }

        /* ---- Bottom theme toggle button ---- */
        .sidebar-theme-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            border-radius: 12px;
            overflow: hidden;
            width: 100%;
            cursor: pointer;
            border: none;
            background: transparent;
            font-size: 0.875rem;
            font-weight: 500;
            transition: background-color 0.15s, color 0.15s;
            white-space: nowrap;
        }

        #main-sidebar[data-collapsed="true"] .sidebar-theme-btn {
            justify-content: center;
            padding: 8px 0;
            gap: 0;
        }

        .sidebar-theme-btn .theme-icon {
            flex-shrink: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    </style>
</head>
<body class="antialiased bg-[#eff3f6] text-[#3b475c] h-screen overflow-hidden font-sans flex flex-col">

    <div class="flex h-screen w-full overflow-hidden relative" id="app-container">
        
        <!-- ================================================
             SIDEBAR
        ================================================ -->
        <aside id="main-sidebar" data-collapsed="false"
               class="bg-white border-r border-[#e2e8f0] flex flex-col justify-between z-30 shrink-0 h-screen max-h-screen relative">

            <!-- Toggle Button (always on the right border line) -->
            <button id="sidebar-toggle-btn" type="button" title="Recolher menu">
                <svg id="collapse-icon" class="w-3.5 h-3.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <!-- TOP: Logo + Nav -->
            <div class="flex flex-col min-w-0 flex-1 overflow-hidden">
                <div class="sidebar-logo-area shrink-0">
                    <!-- Logo -->
                    <a href="/dashboard" class="sidebar-logo-link" title="PONTUA Dashboard">
                        <div class="w-10 h-10 rounded-xl bg-[#4bb9a6] flex items-center justify-center text-white font-poppins font-extrabold text-xl shrink-0 shadow-sm">
                            P
                        </div>
                        <div class="sidebar-label flex flex-col leading-tight ml-0">
                            <span class="font-poppins font-extrabold text-lg tracking-tight text-[#273142] leading-tight">PONTUA.</span>
                            <span class="text-[10px] text-[#7a889b] font-medium leading-none">Solidariedade APAE</span>
                        </div>
                    </a>
                </div>

                <!-- Navigation Links -->
                <nav class="p-3 space-y-1 mt-1 overflow-y-auto flex-1">

                    <!-- Visão Geral -->
                    <a href="/dashboard"
                       class="sidebar-nav-link {{ request()->is('dashboard') || request()->is('/') ? 'bg-[#4bb9a6] text-white shadow-sm' : 'text-[#7a889b] hover:text-[#3b475c] hover:bg-slate-100/70' }}"
                       title="Visão Geral">
                        <span class="nav-icon">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="3" y="3" width="7" height="7" rx="1.5" stroke-width="2"/>
                                <rect x="14" y="3" width="7" height="7" rx="1.5" stroke-width="2"/>
                                <rect x="14" y="14" width="7" height="7" rx="1.5" stroke-width="2"/>
                                <rect x="3" y="14" width="7" height="7" rx="1.5" stroke-width="2"/>
                            </svg>
                        </span>
                        <span class="sidebar-label">Visão Geral</span>
                    </a>

                    <!-- Histórico -->
                    <a href="/historico"
                       class="sidebar-nav-link {{ request()->is('historico*') ? 'bg-[#4bb9a6] text-white shadow-sm' : 'text-[#7a889b] hover:text-[#3b475c] hover:bg-slate-100/70' }}"
                       title="Histórico de Doações">
                        <span class="nav-icon">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                        <span class="sidebar-label">Histórico</span>
                    </a>

                    <!-- Loja de Recompensas -->
                    <a href="/loja"
                       class="sidebar-nav-link {{ request()->is('loja*') ? 'bg-[#4bb9a6] text-white shadow-sm' : 'text-[#7a889b] hover:text-[#3b475c] hover:bg-slate-100/70' }}"
                       title="Loja de Recompensas">
                        <span class="nav-icon">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </span>
                        <span class="sidebar-label">Loja de Recompensas</span>
                    </a>

                    <!-- Transferir Pontos -->
                    <a href="/transferir"
                       class="sidebar-nav-link {{ request()->is('transferir*') ? 'bg-[#4bb9a6] text-white shadow-sm' : 'text-[#7a889b] hover:text-[#3b475c] hover:bg-slate-100/70' }}"
                       title="Transferir Pontos">
                        <span class="nav-icon">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </span>
                        <span class="sidebar-label">Transferir Pontos</span>
                    </a>

                    <!-- Ranking FATEC -->
                    <a href="/ranking"
                       class="sidebar-nav-link {{ request()->is('ranking*') ? 'bg-[#4bb9a6] text-white shadow-sm' : 'text-[#7a889b] hover:text-[#3b475c] hover:bg-slate-100/70' }}"
                       title="Ranking FATEC">
                        <span class="nav-icon">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </span>
                        <span class="sidebar-label">Ranking FATEC</span>
                    </a>

                    <!-- Meu Perfil -->
                    <a href="/perfil"
                       class="sidebar-nav-link {{ request()->is('perfil*') ? 'bg-[#4bb9a6] text-white shadow-sm' : 'text-[#7a889b] hover:text-[#3b475c] hover:bg-slate-100/70' }}"
                       title="Meu Perfil">
                        <span class="nav-icon">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </span>
                        <span class="sidebar-label">Meu Perfil</span>
                    </a>

                    <!-- Sobre a APAE -->
                    <a href="/sobre"
                       class="sidebar-nav-link {{ request()->is('sobre*') ? 'bg-[#4bb9a6] text-white shadow-sm' : 'text-[#7a889b] hover:text-[#3b475c] hover:bg-slate-100/70' }}"
                       title="Sobre a APAE">
                        <span class="nav-icon">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </span>
                        <span class="sidebar-label">Sobre a APAE</span>
                    </a>

                </nav>
            </div>

            <!-- BOTTOM: Theme Toggle + User Card + Logout -->
            <div class="p-3 border-t border-[#e2e8f0]/60 space-y-1 shrink-0">

                <!-- Theme Toggle Button -->
                <button type="button" 
                        id="theme-toggle-btn"
                        class="sidebar-theme-btn text-[#7a889b] hover:text-[#3b475c] hover:bg-slate-100/70"
                        title="Alternar Modo Escuro / Claro">
                    <span class="theme-icon">
                        <!-- Moon Icon (in light mode) -->
                        <svg id="theme-icon-moon" class="w-5 h-5 text-[#7a889b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        <!-- Sun Icon (in dark mode) -->
                        <svg id="theme-icon-sun" class="w-5 h-5 text-amber-400 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </span>
                    <span class="sidebar-label" id="theme-toggle-label">Modo Escuro</span>
                </button>

                <!-- User Card (Clickable link to profile) -->
                <a href="/perfil" class="sidebar-user-card bg-slate-50 hover:bg-slate-100/80 border border-slate-100/80 transition cursor-pointer" title="Ver Meu Perfil">
                    <div class="w-9 h-9 rounded-full bg-[#4bb9a6] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        AL
                    </div>
                    <div class="sidebar-label flex flex-col min-w-0">
                        <span class="font-semibold text-xs text-[#273142] truncate">Aluno FATEC</span>
                        <div class="flex items-center gap-1 text-[11px] text-[#4bb9a6] font-medium">
                            <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                            <span>1250 pts</span>
                        </div>
                    </div>
                </a>

                <!-- Logout -->
                <a href="/login"
                   class="sidebar-logout-link text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 text-xs font-semibold transition"
                   title="Sair">
                    <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span class="sidebar-label">Sair</span>
                </a>

            </div>
        </aside>

        <!-- ================================================
             MAIN CONTENT AREA
        ================================================ -->
        <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
            
            <!-- Topbar -->
            <header class="h-[72px] shrink-0 bg-white/70 backdrop-blur-md px-8 flex items-center justify-between border-b border-[#e2e8f0]/80 z-20">
                <h1 class="font-poppins font-bold text-xl text-[#273142]">@yield('page_title', 'Visão Geral')</h1>

                @if(request()->is('dashboard') || request()->is('/'))
                    <button type="button" data-action="open-scanner" class="btn-primary-teal text-sm py-2 px-4 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <span>Doar Cupom Fiscal</span>
                    </button>
                @else
                    <a href="/dashboard" class="btn-primary-teal text-sm py-2 px-4 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <span>Doar Cupom Fiscal</span>
                    </a>
                @endif
            </header>

            <!-- Page Content -->
            <main class="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
                @yield('content')
            </main>
        </div>

    </div>

    <!-- ================================================
         SIDEBAR COLLAPSE SCRIPT
    ================================================ -->
    <script>
        (function () {
            const sidebar   = document.getElementById('main-sidebar');
            const toggleBtn = document.getElementById('sidebar-toggle-btn');
            const icon      = document.getElementById('collapse-icon');

            if (!sidebar || !toggleBtn) return;

            // Restore saved preference
            let collapsed = localStorage.getItem('pontua_sidebar_collapsed') === 'true';
            applyState(collapsed, false); // no animation on initial paint

            toggleBtn.addEventListener('click', () => {
                collapsed = !collapsed;
                localStorage.setItem('pontua_sidebar_collapsed', collapsed);
                applyState(collapsed, true);
            });

            function applyState(isCollapsed, animate) {
                // Temporarily disable transition on initial load
                if (!animate) {
                    sidebar.style.transition = 'none';
                    requestAnimationFrame(() => { sidebar.style.transition = ''; });
                }

                sidebar.setAttribute('data-collapsed', isCollapsed ? 'true' : 'false');
                icon.style.transform = isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)';
                toggleBtn.title = isCollapsed ? 'Expandir menu' : 'Recolher menu';
            }
        })();
    </script>

    <!-- ================================================
         THEME TOGGLE SCRIPT (DARK / LIGHT MODE)
    ================================================ -->
    <script>
        (function () {
            const toggleBtn = document.getElementById('theme-toggle-btn');
            const sunIcon = document.getElementById('theme-icon-sun');
            const moonIcon = document.getElementById('theme-icon-moon');
            const label = document.getElementById('theme-toggle-label');

            function syncThemeUI(isDark) {
                if (isDark) {
                    sunIcon?.classList.remove('hidden');
                    moonIcon?.classList.add('hidden');
                    if (label) label.textContent = 'Modo Claro';
                    if (toggleBtn) toggleBtn.title = 'Alternar para Modo Claro';
                } else {
                    sunIcon?.classList.add('hidden');
                    moonIcon?.classList.remove('hidden');
                    if (label) label.textContent = 'Modo Escuro';
                    if (toggleBtn) toggleBtn.title = 'Alternar para Modo Escuro';
                }
            }

            // Sync with current HTML class on page load
            const isDarkInitial = document.documentElement.classList.contains('dark');
            syncThemeUI(isDarkInitial);

            toggleBtn?.addEventListener('click', () => {
                const isDark = document.documentElement.classList.toggle('dark');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
                localStorage.setItem('pontua_theme', isDark ? 'dark' : 'light');
                syncThemeUI(isDark);
            });
        })();
    </script>

    <!-- ================================================
         GLOBAL SCANNER MODAL
    ================================================ -->
    @include('components.scanner-modal')

</body>
</html>
