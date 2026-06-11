import { Layout, message } from "antd";
import { useEffect, useState } from "react";

import { usePage } from "@inertiajs/react";
import { useAdminT } from "../../contexts/AdminI18nContext";
import { motion } from "framer-motion";
import AdminShell from "./AdminShell";
import AppFooter from "./Footer";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import SidebarBrandLogo from "./SidebarBrandLogo";
import { ADMIN_NAVY, ADMIN_PAGE_BG } from "../../theme/adminColors";
const { Content } = Layout;
const { Sider } = Layout;

const AppLayout = ({ title, breadcrumb, children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { flash } = usePage().props;
    const { t } = useAdminT();

    /** Flash may be an admin i18n dot-path (e.g. organization.flashUpdated) or a legacy plain string. */
    const flashText = (value) => {
        if (value == null || typeof value !== "string") return value;
        return t(value);
    };

    useEffect(() => {
        if (flash?.success) {
            message.success(flashText(flash.success));
            flash.success = null;
        }
        if (flash?.error) {
            message.error(flashText(flash.error));
            flash.error = null;
        }
        if (flash?.info) {
            message.info(flashText(flash.info));
            flash.info = null;
        }
        if (flash?.warning) {
            message.warning(flashText(flash.warning));
            flash.warning = null;
        }
    }, [flash, t]);
    const toggleCollapse = () => {
        setCollapsed(!collapsed);
    };

    return (
        <AdminShell>
            <Layout
                style={{
                    height: "100vh",
                    maxHeight: "100vh",
                    overflow: "hidden",
                    backgroundColor: ADMIN_PAGE_BG,
                }}
                className="admin-shell"
            >
                {/* Sidebar */}
                <Sider
                    theme="dark"
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    className="sidebar sticky top-0 left-0 shadow-lg"
                    style={{
                        backgroundColor: ADMIN_NAVY,
                        height: "100vh",
                        maxHeight: "100vh",
                    }}
                    width={280}
                    onCollapse={(value) => setCollapsed(value)}
                    breakpoint="md"
                    collapsedWidth={60}
                    onBreakpoint={(broken) => {
                        setCollapsed(broken);
                    }}
                >
                    <div className="sidebar-inner flex h-full min-h-0 flex-col overflow-hidden">
                        <div className="logo shrink-0 border-b border-white/10">
                            <SidebarBrandLogo collapsed={collapsed} />
                        </div>
                        <Sidebar collapsed={collapsed} />
                    </div>
                </Sider>
                <Layout
                    style={{
                        flex: 1,
                        minWidth: 0,
                        minHeight: 0,
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                    }}
                >
                    {/* Navbar */}
                    <Navbar
                        title={title}
                        collapsed={collapsed}
                        onToggle={toggleCollapse}
                    />

                    {/* Main Content: fills all space down to the footer; scroll inside the white panel when content is taller than the viewport. */}
                    <motion.div
                        style={{
                            flex: 1,
                            minHeight: 0,
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                        }}
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Content
                            className="m-4 mt-2 mb-4 box-border w-full max-w-full min-h-0 flex-1 rounded-xl bg-white p-5 shadow-lg"
                            style={{
                                flex: 1,
                                minHeight: 0,
                                display: "flex",
                                flexDirection: "column",
                                overflowY: "auto",
                                overflowX: "auto",
                            }}
                        >
                            {children}
                        </Content>
                    </motion.div>
                    {/* Footer */}
                    <AppFooter />
                </Layout>
            </Layout>
        </AdminShell>
    );
};

export default AppLayout;
