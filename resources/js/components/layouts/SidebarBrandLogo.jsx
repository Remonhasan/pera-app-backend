import { ADMIN_NAVY } from "../../theme/adminColors";

const BoltIcon = ({ size = 22 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
    >
        <path d="M13 2L4 14.5h5.5L8.5 22 20 9.5H14L13 2z" fill={ADMIN_NAVY} />
    </svg>
);

/**
 * Pera wordmark for the admin sidebar: squircle + bolt using theme primary on white,
 * with typography tuned for the dark navy sider (ADMIN_NAVY background).
 */
const SidebarBrandLogo = ({ collapsed }) => {
    const iconWrap = {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.12)",
    };

    if (collapsed) {
        return (
            <div className="flex justify-center pt-4 pb-2">
                <div style={iconWrap}>
                    <BoltIcon size={24} />
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex items-center justify-center gap-3 px-4 py-4"
            style={{ textAlign: "left" }}
        >
            <div style={iconWrap}>
                <BoltIcon />
            </div>
            <div className="min-w-0 text-left">
                <div
                    className="font-bold text-lg leading-tight tracking-tight text-white"
                    style={{ fontFamily: "inherit" }}
                >
                    Pera
                </div>
            </div>
        </div>
    );
};

export default SidebarBrandLogo;
