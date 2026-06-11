import { Layout } from "antd";
import { useAdminT } from "../../contexts/AdminI18nContext";

const { Footer } = Layout;

const AppFooter = () => {
    const { t } = useAdminT();
    return (
        <Footer
            style={{
                textAlign: "center",
                padding: "12px 24px",
                background: "#f9fafb",
                borderTop: "1px solid #e5e7eb",
                fontSize: "12px",
                color: "#6b7280",
                bottom: 0,
            }}
        >
            <span>
                {t("footer.copyright", {
                    year: new Date().getFullYear(),
                })}
            </span>
        </Footer>
    );
};

export default AppFooter;
