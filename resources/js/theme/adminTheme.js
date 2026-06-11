import { ADMIN_NAVY, ADMIN_PAGE_BG } from "./adminColors";

const FONT_STACK_LATIN =
    "Urbanist, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";

/** Hind Siliguri first for Bangla glyphs; Urbanist for Latin in mixed UI */
const FONT_STACK_BANGLA = `"Hind Siliguri", ${FONT_STACK_LATIN}`;

const adminThemeTokens = {
    colorPrimary: ADMIN_NAVY,
    colorInfo: ADMIN_NAVY,
    colorLink: ADMIN_NAVY,
    borderRadius: 8,
};

/**
 * Light admin workspace (white cards/tables) with navy primary actions.
 *
 * @param {"en" | "bn"} locale
 */
export function buildAdminTheme(locale) {
    return {
        token: {
            ...adminThemeTokens,
            fontFamily:
                locale === "bn" ? FONT_STACK_BANGLA : FONT_STACK_LATIN,
        },
        components: {
            Layout: {
                bodyBg: ADMIN_PAGE_BG,
            },
        },
    };
}

/** Default English typography (backward compatible import). */
export const adminTheme = buildAdminTheme("en");
