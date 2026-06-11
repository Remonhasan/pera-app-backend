import { usePage } from "@inertiajs/react";
import { createContext, useContext, useEffect, useMemo } from "react";
import { adminMessages } from "../i18n/adminMessages";

const AdminI18nContext = createContext(null);

function resolvePath(obj, path) {
    const keys = path.split(".");
    let v = obj;
    for (const k of keys) {
        if (v == null || typeof v !== "object") return undefined;
        v = v[k];
    }
    return v;
}

function interpolate(template, params) {
    if (!params) return template;
    return Object.entries(params).reduce(
        (s, [k, val]) => s.replaceAll(`{${k}}`, String(val)),
        template,
    );
}

export function AdminI18nProvider({ children }) {
    const { admin_locale: adminLocale } = usePage().props;
    const locale = adminLocale === "bn" ? "bn" : "en";

    const value = useMemo(() => {
        const dict = adminMessages[locale] || adminMessages.en;
        const t = (key, params) => {
            const raw = resolvePath(dict, key);
            if (typeof raw !== "string") return key;
            return interpolate(raw, params);
        };
        return { t, locale };
    }, [locale]);

    useEffect(() => {
        document.documentElement.classList.toggle(
            "admin-locale-bn",
            locale === "bn",
        );
    }, [locale]);

    return (
        <AdminI18nContext.Provider value={value}>
            {children}
        </AdminI18nContext.Provider>
    );
}

export function useAdminT() {
    const ctx = useContext(AdminI18nContext);
    if (!ctx) {
        throw new Error("useAdminT must be used within AdminI18nProvider");
    }
    return ctx;
}
