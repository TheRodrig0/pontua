import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { StrictMode, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Pontua';

createInertiaApp({
    title: (title) => {
        const hasTitle = Boolean(title);
        const pageTitle = hasTitle ? `${title} - ${appName}` : appName;

        return pageTitle;
    },
    resolve: (name) => {
        const pages = import.meta.glob<{ default: ComponentType }>('./pages/**/*.tsx', { eager: true });
        const page = pages[`./pages/${name}.tsx`];

        return page;
    },
    setup({ el, App, props }) {
        const hasElement = Boolean(el);

        if (hasElement) {
            createRoot(el!).render(
                <StrictMode>
                    <App {...props} />
                </StrictMode>
            );
        }
    }
});
