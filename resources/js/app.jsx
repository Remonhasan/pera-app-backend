import "../css/app.css";
import "../css/notifications.css";
// import './bootstrap';

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { AdminI18nProvider } from "./contexts/AdminI18nContext";
import { ADMIN_NAVY } from "./theme/adminColors";

const appName = import.meta.env.VITE_APP_NAME || "Pera";

/** Mirrors Inertia's default layout resolution, then wraps the page tree in AdminI18nProvider so useAdminT works in page components (not only inside AppLayout). */
function wrapPageWithAdminI18n({ Component, props, key }) {
    const page = createElement(Component, { key, ...props });
    let tree;
    if (typeof Component.layout === "function") {
        tree = Component.layout(page);
    } else if (Array.isArray(Component.layout)) {
        tree = Component.layout
            .concat(page)
            .reverse()
            .reduce((children, Layout) =>
                createElement(Layout, { children, ...props }),
            );
    } else {
        tree = page;
    }
    return createElement(AdminI18nProvider, null, tree);
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx"),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props}>{wrapPageWithAdminI18n}</App>);
    },
    progress: {
        color: ADMIN_NAVY,
        delay: 250,
    },
});
