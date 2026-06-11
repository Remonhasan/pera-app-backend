const BN = "০১২৩৪৫৬৭৮৯";

function digitsToBengali(s) {
    return s.replace(/\d/g, (d) => BN[Number(d)]);
}

/**
 * Formats a number for the admin UI. Uses Bengali digits (০–৯) when locale is `bn`.
 */
export function formatAdminInteger(value, locale) {
    const n = Number(value);
    if (!Number.isFinite(n)) {
        return String(value ?? "");
    }
    const intlLocale = locale === "bn" ? "bn-BD" : "en-GB";
    try {
        return new Intl.NumberFormat(intlLocale, {
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
            numberingSystem: locale === "bn" ? "beng" : "latn",
        }).format(Math.trunc(n));
    } catch {
        if (locale === "bn") {
            return digitsToBengali(String(Math.trunc(n)));
        }
        return String(Math.trunc(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

/**
 * Formats a monetary total for the admin UI (rounded to whole units). Bengali digits when locale is `bn`.
 */
export function formatAdminMoney(value, locale) {
    const n = Number(value);
    if (!Number.isFinite(n)) {
        return String(value ?? "");
    }
    return formatAdminInteger(Math.round(n), locale);
}

/**
 * Formats a decimal number for the admin UI (e.g. meal rate, amounts with cents).
 */
export function formatAdminDecimal(value, locale, fractionDigits = 2) {
    const n = Number(value);
    if (!Number.isFinite(n)) {
        return String(value ?? "");
    }
    const intlLocale = locale === "bn" ? "bn-BD" : "en-GB";
    try {
        return new Intl.NumberFormat(intlLocale, {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
            numberingSystem: locale === "bn" ? "beng" : "latn",
        }).format(n);
    } catch {
        const fixed = n.toFixed(fractionDigits);
        return locale === "bn" ? digitsToBengali(fixed) : fixed;
    }
}
