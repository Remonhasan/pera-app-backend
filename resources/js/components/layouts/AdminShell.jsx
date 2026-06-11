import { ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";
import { usePage } from "@inertiajs/react";
import { AdminI18nProvider } from "../../contexts/AdminI18nContext";
import { buildAdminTheme } from "../../theme/adminTheme";

export default function AdminShell({ children }) {
    const adminLocale = usePage().props.admin_locale;
    const locale = adminLocale === "bn" ? "bn" : "en";
    const theme = buildAdminTheme(locale);

    return (
        <ConfigProvider theme={theme} locale={enUS}>
            <AdminI18nProvider>{children}</AdminI18nProvider>
        </ConfigProvider>
    );
}
