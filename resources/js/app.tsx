import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { StrictMode, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import LandingPage from './pages/LandingPage';

const appName = import.meta.env.VITE_APP_NAME || 'Pontua';
const pages = import.meta.glob<{ default: ComponentType }>([
    './pages/**/*.tsx',
    '!./pages/LandingPage.tsx',
]);

createInertiaApp({
    title: (title) => {
        const hasTitle = Boolean(title);
        const pageTitle = hasTitle ? `${title} - ${appName}` : appName;

        return pageTitle;
    },
    resolve: async (name) => {
        if (name === 'LandingPage') {
            return LandingPage;
        }

        const loader = pages[`./pages/${name}.tsx`];
        if (!loader) {
            throw new Error(`Página Inertia não encontrada: ${name}`);
        }

        const mod = await loader();
        return mod.default;
    },
    setup({ el, App, props }) {
        if (el) {
            createRoot(el).render(
                <StrictMode>
                    <App {...props} />
                </StrictMode>
            );
        }
    },
});
