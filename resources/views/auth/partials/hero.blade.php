<!-- LEFT SIDE: Colorful Hero Illustration (Blobs + 3D/Vector Character with Puzzle Heart) -->
<div class="lg:w-1/2 min-h-[400px] lg:min-h-screen relative overflow-hidden flex items-center justify-center p-8 bg-gradient-to-br from-teal-50/40 via-sky-50/30 to-amber-50/30 select-none">
    
    <!-- Vibrant Abstract Blobs -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <!-- Green/Teal Blob -->
        <div class="absolute top-[10%] -left-[10%] w-[480px] h-[480px] rounded-full bg-gradient-to-tr from-[#38b2ac] to-[#4bb9a6] mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-subtle"></div>
        <!-- Blue Blob -->
        <div class="absolute top-[25%] left-[5%] w-[420px] h-[420px] rounded-full bg-gradient-to-br from-[#3182ce] to-[#63b3ed] mix-blend-multiply filter blur-2xl opacity-60"></div>
        <!-- Orange/Coral Blob -->
        <div class="absolute bottom-[5%] left-[0%] w-[460px] h-[460px] rounded-full bg-gradient-to-t from-[#ea7349] to-[#f6ad55] mix-blend-multiply filter blur-3xl opacity-75"></div>
        <!-- Yellow/Gold Blob -->
        <div class="absolute top-[30%] left-[25%] w-[380px] h-[380px] rounded-full bg-gradient-to-br from-[#f2c84b] to-[#faf089] mix-blend-multiply filter blur-2xl opacity-70"></div>
        <!-- Violet accent Blob -->
        <div class="absolute top-[5%] left-[30%] w-[320px] h-[320px] rounded-full bg-gradient-to-br from-[#9f7aea] to-[#b794f4] mix-blend-multiply filter blur-2xl opacity-50"></div>
    </div>

    <!-- Floating Particles / Dots -->
    <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-20 left-1/3 w-3 h-3 rounded-full bg-[#4bb9a6]/80 animate-ping"></div>
        <div class="absolute top-48 left-2/3 w-4 h-4 rounded-full bg-[#ea7349]/70 animate-pulse"></div>
        <div class="absolute bottom-32 left-1/2 w-3 h-3 rounded-full bg-[#f2c84b]/80 animate-bounce"></div>
        <div class="absolute bottom-20 left-1/4 w-4 h-4 rounded-full bg-[#3182ce]/60"></div>
    </div>

    <!-- Center Character + Puzzle Heart SVG Composition -->
    <div class="relative z-10 flex flex-col items-center justify-center max-w-md w-full animate-float-heart">
        <svg viewBox="0 0 500 650" class="w-full max-w-[420px] h-auto drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <!-- Linear gradients for puzzle pieces -->
                <linearGradient id="puz-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#3182ce"/>
                    <stop offset="100%" stop-color="#2b6cb0"/>
                </linearGradient>
                <linearGradient id="puz-teal" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#4bb9a6"/>
                    <stop offset="100%" stop-color="#38b2ac"/>
                </linearGradient>
                <linearGradient id="puz-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#f6e05e"/>
                    <stop offset="100%" stop-color="#ecc94b"/>
                </linearGradient>
                <linearGradient id="puz-coral" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#fc8181"/>
                    <stop offset="100%" stop-color="#ea7349"/>
                </linearGradient>
                <linearGradient id="sweater-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#285e61"/>
                    <stop offset="100%" stop-color="#234e52"/>
                </linearGradient>
                <linearGradient id="skin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#8c5b3e"/>
                    <stop offset="100%" stop-color="#6f4229"/>
                </linearGradient>
                <linearGradient id="pants-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#dfd6c8"/>
                    <stop offset="100%" stop-color="#c9bca9"/>
                </linearGradient>
                <filter id="shadow3d" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="12" stdDeviation="10" flood-opacity="0.25"/>
                </filter>
            </defs>

            <!-- Soft Ground Shadow -->
            <ellipse cx="250" cy="620" rx="140" ry="18" fill="#1a202c" opacity="0.15" />

            <!-- Legs / Pants -->
            <g filter="url(#shadow3d)">
                <!-- Left leg -->
                <rect x="195" y="440" width="46" height="150" rx="12" fill="url(#pants-grad)" />
                <!-- Right leg -->
                <rect x="260" y="440" width="46" height="150" rx="12" fill="url(#pants-grad)" />
                <!-- Left shoe -->
                <ellipse cx="218" cy="595" rx="30" ry="14" fill="#744210" />
                <rect x="200" y="598" width="36" height="6" rx="3" fill="#ffffff" />
                <!-- Right shoe -->
                <ellipse cx="283" cy="595" rx="30" ry="14" fill="#744210" />
                <rect x="265" y="598" width="36" height="6" rx="3" fill="#ffffff" />
            </g>

            <!-- Torso / Sweater -->
            <path d="M 180 320 L 320 320 L 305 455 L 195 455 Z" fill="url(#sweater-grad)" />
            <!-- Sweater Ribbed Texture lines -->
            <line x1="200" y1="360" x2="300" y2="360" stroke="#319795" stroke-width="2" opacity="0.4" />
            <line x1="198" y1="390" x2="302" y2="390" stroke="#319795" stroke-width="2" opacity="0.4" />
            <line x1="196" y1="420" x2="304" y2="420" stroke="#319795" stroke-width="2" opacity="0.4" />

            <!-- Head, Hair and Face -->
            <g>
                <!-- Neck -->
                <rect x="232" y="240" width="36" height="35" rx="8" fill="url(#skin-grad)" />
                
                <!-- Head -->
                <ellipse cx="250" cy="205" rx="42" ry="48" fill="url(#skin-grad)" />

                <!-- Smiling Eyes and Eyebrows -->
                <path d="M 230 195 Q 238 188 245 195" fill="none" stroke="#2d1b11" stroke-width="3.5" stroke-linecap="round" />
                <path d="M 255 195 Q 262 188 270 195" fill="none" stroke="#2d1b11" stroke-width="3.5" stroke-linecap="round" />
                <path d="M 228 185 Q 238 180 245 186" fill="none" stroke="#1a110a" stroke-width="3" stroke-linecap="round" />
                <path d="M 255 186 Q 262 180 272 185" fill="none" stroke="#1a110a" stroke-width="3" stroke-linecap="round" />

                <!-- Warm Happy Smile -->
                <path d="M 238 218 Q 250 232 262 218" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" />
                <path d="M 238 218 Q 250 232 262 218" fill="none" stroke="#c53030" stroke-width="2" stroke-linecap="round" />

                <!-- Cheeks glow -->
                <ellipse cx="228" cy="214" rx="8" ry="4" fill="#fc8181" opacity="0.45" />
                <ellipse cx="272" cy="214" rx="8" ry="4" fill="#fc8181" opacity="0.45" />

                <!-- Curly Volume Hair -->
                <circle cx="218" cy="170" r="18" fill="#1c120c" />
                <circle cx="236" cy="155" r="20" fill="#2d1b11" />
                <circle cx="256" cy="152" r="21" fill="#1c120c" />
                <circle cx="276" cy="158" r="19" fill="#2d1b11" />
                <circle cx="290" cy="175" r="17" fill="#1c120c" />
                <circle cx="295" cy="195" r="14" fill="#2d1b11" />
                <circle cx="206" cy="190" r="14" fill="#2d1b11" />
            </g>

            <!-- GIANT JIGSAW PUZZLE HEART (Autism/APAE Solidarity symbol) -->
            <g filter="url(#shadow3d)">
                <!-- Piece Top Left - Cyan / Blue -->
                <path d="M 250 270 C 230 230 160 220 145 280 C 135 320 170 370 210 400 L 250 360 Z" fill="url(#puz-blue)" />
                <!-- Piece Top Right - Coral / Red -->
                <path d="M 250 270 C 270 230 340 220 355 280 C 365 320 330 370 290 400 L 250 360 Z" fill="url(#puz-coral)" />
                <!-- Piece Bottom Left - Yellow -->
                <path d="M 210 400 C 225 415 240 435 250 450 L 250 360 Z" fill="url(#puz-yellow)" />
                <!-- Piece Bottom Right - Teal -->
                <path d="M 290 400 C 275 415 260 435 250 450 L 250 360 Z" fill="url(#puz-teal)" />
                
                <!-- Decorative Puzzle Inner Connectors / Knobs -->
                <circle cx="205" cy="310" r="14" fill="url(#puz-yellow)" stroke="#ffffff" stroke-width="2.5" />
                <circle cx="295" cy="310" r="14" fill="url(#puz-teal)" stroke="#ffffff" stroke-width="2.5" />
                <circle cx="250" cy="330" r="13" fill="url(#puz-coral)" stroke="#ffffff" stroke-width="2.5" />
                <circle cx="250" cy="390" r="13" fill="url(#puz-blue)" stroke="#ffffff" stroke-width="2.5" />

                <!-- Puzzle seam lines -->
                <path d="M 250 268 L 250 448" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.9" />
                <path d="M 148 335 Q 250 360 352 335" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.9" />
            </g>

            <!-- Arms Hugging The Heart -->
            <g filter="url(#shadow3d)">
                <!-- Left Arm / Sleeve -->
                <path d="M 175 325 Q 140 370 190 400 Q 230 420 250 395" fill="none" stroke="url(#sweater-grad)" stroke-width="40" stroke-linecap="round" />
                <!-- Left Hand -->
                <circle cx="245" cy="390" r="16" fill="url(#skin-grad)" />

                <!-- Right Arm / Sleeve -->
                <path d="M 325 325 Q 360 370 310 400 Q 270 420 255 395" fill="none" stroke="url(#sweater-grad)" stroke-width="40" stroke-linecap="round" />
                <!-- Right Hand -->
                <circle cx="255" cy="390" r="16" fill="url(#skin-grad)" />
            </g>
        </svg>
    </div>

</div>
