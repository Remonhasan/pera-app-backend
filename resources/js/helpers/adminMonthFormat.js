/**
 * Month name for admin UI (1–12). Uses Bengali month names when locale is `bn`.
 */
export function formatAdminMonth(month, locale = "en") {
    const m = Number(month);
    if (!m || m < 1 || m > 12) {
        return "—";
    }

    const intlLocale = locale === "bn" ? "bn-BD" : "en-GB";

    try {
        return new Intl.DateTimeFormat(intlLocale, { month: "long" }).format(
            new Date(2000, m - 1, 1),
        );
    } catch {
        const fallback = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        return fallback[m - 1];
    }
}

/** @returns {{ value: number, label: string }[]} */
export function getAdminMonthOptions(locale = "en") {
    return Array.from({ length: 12 }, (_, index) => {
        const value = index + 1;
        return {
            value,
            label: formatAdminMonth(value, locale),
        };
    });
}

/**
 * Builds "(Month from - Month to) - (Year from - Year to)" when any month/year
 * range filter is set; otherwise returns null.
 *
 * @param {{ month_from?: number|null, month_to?: number|null, year_from?: number|null, year_to?: number|null }} filters
 */
export function formatAdminMonthYearPeriod(filters = {}, locale = "en") {
    const hasMonthYear =
        filters?.month_from != null ||
        filters?.month_to != null ||
        filters?.year_from != null ||
        filters?.year_to != null;

    if (!hasMonthYear) {
        return null;
    }

    const monthFrom =
        filters.month_from != null
            ? formatAdminMonth(filters.month_from, locale)
            : "…";
    const monthTo =
        filters.month_to != null
            ? formatAdminMonth(filters.month_to, locale)
            : "…";
    const yearFrom =
        filters.year_from != null ? String(filters.year_from) : "…";
    const yearTo = filters.year_to != null ? String(filters.year_to) : "…";

    return `(${monthFrom} - ${monthTo}) - (${yearFrom} - ${yearTo})`;
}
