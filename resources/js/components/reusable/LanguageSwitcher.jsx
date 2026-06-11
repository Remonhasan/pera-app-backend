import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { useAdminT } from "../../contexts/AdminI18nContext";
import { ADMIN_NAVY } from "../../theme/adminColors";

const LANGS = [
    { value: "en", label: "EN" },
    { value: "bn", label: "বাং" },
];

/**
 * Compact 40px-tall control to align with navbar bell / avatar row.
 *
 * @param {object} props
 * @param {string} [props.className]
 * @param {"dark" | "light"} [props.variant]
 */
export default function LanguageSwitcher({ className = "", variant = "dark" }) {
    const { locale } = useAdminT();
    const isDark = variant === "dark";

    return (
        <div
            className={[
                "lang-switch inline-flex h-10 shrink-0 items-center gap-0.5 self-center rounded-[10px] border px-1",
                isDark
                    ? "border-white/15 bg-white/[0.07]"
                    : "border-slate-200/90 bg-slate-100/90",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
            role="group"
            aria-label="Language"
        >
            {LANGS.map(({ value, label }) => {
                const active = locale === value;
                return (
                    <button
                        key={value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                            if (value === locale) return;
                            router.post(
                                route("locale.update"),
                                { locale: value },
                                { preserveScroll: true },
                            );
                        }}
                        className={[
                            "box-border flex h-8 min-h-8 max-h-8 min-w-[2.35rem] items-center justify-center rounded-lg border-0 px-2.5 text-center text-[11px] font-semibold leading-none tracking-wide transition-[color,background-color,box-shadow] duration-200",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
                            isDark
                                ? active
                                    ? "bg-white/[0.92] shadow-[0_1px_2px_rgba(0,0,0,0.12)] focus-visible:ring-white/60 focus-visible:ring-offset-[#1e3a5f]"
                                    : "bg-transparent text-white/55 hover:bg-white/[0.06] hover:text-white/90 focus-visible:ring-white/40 focus-visible:ring-offset-[#1e3a5f]"
                                : active
                                  ? "bg-white shadow-sm ring-1 ring-slate-200/60 focus-visible:ring-[#1e3a5f]/30 focus-visible:ring-offset-white"
                                  : "bg-transparent text-slate-500 hover:bg-white/60 hover:text-slate-800 focus-visible:ring-slate-400/35 focus-visible:ring-offset-slate-100",
                        ].join(" ")}
                        style={active ? { color: ADMIN_NAVY } : undefined}
                    >
                        <span
                            className={[
                                "block leading-none",
                                value === "en" ? "uppercase" : "",
                            ].join(" ")}
                        >
                            {label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
