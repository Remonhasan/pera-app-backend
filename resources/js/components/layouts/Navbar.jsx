import {
    LogoutOutlined,
    UserOutlined,
    ExclamationCircleFilled,
} from "@ant-design/icons";
import { usePage, router } from "@inertiajs/react";
import { Layout, Space, Modal } from "antd";
import React from "react";
import { GoBell } from "react-icons/go";
import { RiMessageLine } from "react-icons/ri";
import LanguageSwitcher from "../reusable/LanguageSwitcher";
import NotificationDropdown from "../reusable/NotificationDropdown";
import UserAvatar from "../reusable/UserAvatar";
import { useAdminT } from "../../contexts/AdminI18nContext";
import { ADMIN_NAVY } from "../../theme/adminColors";

// Custom Collapsible Menu Icon Component
const CollapsibleMenuIcon = ({ collapsed, onClick }) => {
    return (
        <div
            className="navbar-toggle cursor-pointer md:block hidden transition-all duration-300"
            onClick={onClick}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "48px",
                height: "48px",
                padding: "8px",
                borderRadius: "10px",
            }}
        >
            <svg
                width="36"
                height="36"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ transition: "all 0.3s ease" }}
            >
                {collapsed ? (
                    // Unfold/Expand icon (three horizontal lines - hamburger menu)
                    <>
                        <rect
                            x="4"
                            y="8"
                            width="24"
                            height="3"
                            rx="1.5"
                            fill="currentColor"
                        />
                        <rect
                            x="4"
                            y="14.5"
                            width="24"
                            height="3"
                            rx="1.5"
                            fill="currentColor"
                        />
                        <rect
                            x="4"
                            y="21"
                            width="24"
                            height="3"
                            rx="1.5"
                            fill="currentColor"
                        />
                    </>
                ) : (
                    // Fold/Collapse icon (hamburger menu with right-pointing arrow)
                    <>
                        {/* Top line - shorter */}
                        <rect
                            x="4"
                            y="8"
                            width="16"
                            height="3"
                            rx="1.5"
                            fill="currentColor"
                        />
                        {/* Middle line - longer with arrow */}
                        <rect
                            x="4"
                            y="14.5"
                            width="20"
                            height="3"
                            rx="1.5"
                            fill="currentColor"
                        />
                        {/* Right-pointing triangle arrow */}
                        <path
                            d="M24 14.5 L24 17.5 L28 16 Z"
                            fill="currentColor"
                        />
                        {/* Bottom line - shorter */}
                        <rect
                            x="4"
                            y="21"
                            width="16"
                            height="3"
                            rx="1.5"
                            fill="currentColor"
                        />
                    </>
                )}
            </svg>
        </div>
    );
};

const { Header } = Layout;

const Navbar = ({ title, collapsed, onToggle }) => {
    const { t } = useAdminT();
    const { auth } = usePage().props;
    const { confirm } = Modal;

    const handleLogout = () => {
        confirm({
            title: t("navbar.logoutConfirmTitle"),
            icon: <ExclamationCircleFilled />,
            content: t("navbar.logoutConfirmContent"),
            okText: t("navbar.yesLogout"),
            okType: "danger",
            cancelText: t("navbar.cancel"),
            onOk() {
                router.visit(route("administrative.logout"));
            },
        });
    };

    const itemsList = [
        {
            key: "1",
            label: (
                <div>
                    <UserOutlined />{" "}
                    <span style={{ fontWeight: "500" }}>
                        {auth.user ? auth.user.name : ""}
                    </span>
                </div>
            ),
        },
        {
            type: "divider",
        },
        {
            key: "3",
            label: (
                <div
                    onClick={handleLogout}
                    style={{
                        color: "red",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <LogoutOutlined /> {t("navbar.logout")}
                </div>
            ),
        },
    ];

    const notifications = [
        {
            key: "1",
            label: (
                <a href="/notifications/1">
                    <div
                        className="flex items-start p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-all duration-200"
                        style={{ gap: "10px" }}
                    >
                        {/* <div className="flex-shrink-0"> */}
                        <GoBell
                            style={{ fontSize: "25px", color: "#1890ff" }}
                        />
                        {/* </div> */}
                        <div className="">
                            <div style={{ fontWeight: "600" }}>
                                New comment on your post
                            </div>
                            <small className="text-gray-600">
                                Definition of permission noun in Oxford Advanced
                                Learner's Dictionary.
                            </small>
                            <div className="text-gray-400 text-xs mt-1">
                                2 hours ago
                            </div>
                        </div>
                    </div>
                </a>
            ),
        },
        {
            type: "divider",
        },
        {
            key: "2",
            label: (
                <a href="/notifications/2">
                    <div
                        className="flex items-start p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-all duration-200"
                        style={{ gap: "10px" }}
                    >
                        {/* <div className="flex-shrink-0"> */}
                        <GoBell
                            style={{ fontSize: "25px", color: "#1890ff" }}
                            className="flex-shrink-0"
                        />
                        {/* </div> */}
                        <div className="flex flex-col">
                            <div style={{ fontWeight: "600" }}>
                                New comment on your post
                            </div>
                            <small className="text-gray-600">
                                Definition of permission noun in Oxford Advanced
                                Learner's Dictionary.
                            </small>
                            <div className="text-gray-400 text-xs mt-1">
                                2 hours ago
                            </div>
                        </div>
                    </div>
                </a>
            ),
        },
    ];

    return (
        <>
            <Header
                className="navbar-navbar shadow-lg m-4 px-6 rounded-[12px] sticky top-4 left-0 z-50"
                style={{ backgroundColor: ADMIN_NAVY }}
            >
                <div className="flex md:justify-between justify-end items-center h-full">
                    {/* Toggle Sidebar */}
                    <div className="flex gap-4 items-center">
                        <CollapsibleMenuIcon
                            collapsed={collapsed}
                            onClick={onToggle}
                        />
                        <div className="lg:block hidden">
                            <p className="text-white/70 text-sm font-medium mb-0.5">
                                {t("navbar.sectionDashboard")}
                            </p>
                            {title ? (
                                <p className="text-white text-lg font-semibold flex items-center gap-2">
                                    {title}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    {/* User Profile Dropdown */}
                    <div>
                        <Space
                            size="middle"
                            className="flex gap-6 items-center"
                        >
                            <div className="hidden sm:block">
                                <LanguageSwitcher variant="dark" />
                            </div>
                            <NotificationDropdown />
                            {/* <div className="navbar-icon-wrapper">
                                <RiMessageLine className="navbar-icon" />
                            </div> */}
                            <UserAvatar items={itemsList} auth={auth} />
                        </Space>
                    </div>
                </div>
            </Header>
            <div className="lg:hidden flex flex-wrap items-center justify-between gap-3 mx-4 my-2">
                <div>
                    <p
                        className="text-sm font-medium mb-0.5"
                        style={{ color: ADMIN_NAVY }}
                    >
                        {t("navbar.sectionDashboard")}
                    </p>
                    {title ? (
                        <p
                            className="text-base font-semibold flex items-center gap-2"
                            style={{ color: ADMIN_NAVY }}
                        >
                            <span className="text-slate-400">/</span> {title}
                        </p>
                    ) : null}
                </div>
                <LanguageSwitcher variant="light" className="shrink-0" />
            </div>
            <style>{`
                .navbar-navbar {
                    backdrop-filter: blur(10px);
                    transition: all 0.3s ease;
                }
                
                .navbar-toggle {
                    color: white;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                }
                
                .navbar-toggle:hover {
                    background-color: rgba(255, 255, 255, 0.12);
                    color: #ffffff;
                    transform: scale(1.05);
                }
                
                .navbar-toggle svg {
                    width: 32px;
                    height: 32px;
                    transition: all 0.3s ease;
                }
                
                .navbar-toggle:hover svg {
                    transform: scale(1.1);
                }
                
                .navbar-icon-wrapper {
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: rgba(255, 255, 255, 0.1);
                    transition: all 0.3s ease;
                    border: 1px solid transparent;
                }
                
                .navbar-icon-wrapper:hover {
                    background: rgba(255, 255, 255, 0.12);
                    border-color: rgba(255, 255, 255, 0.25);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                
                .navbar-icon {
                    font-size: 20px;
                    color: white;
                    transition: all 0.3s ease;
                }
                
                .navbar-icon-wrapper:hover .navbar-icon {
                    color: #ffffff;
                    transform: scale(1.1);
                }
                
                .navbar-navbar .ant-avatar {
                    border: 2px solid rgba(255, 255, 255, 0.35);
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                
                .navbar-navbar .ant-avatar:hover {
                    border-color: #ffffff;
                    transform: scale(1.05);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }
                
                .ant-dropdown-menu {
                    border-radius: 12px !important;
                    box-shadow: 0 8px 24px rgba(30, 58, 95, 0.12) !important;
                    border: 1px solid rgba(30, 58, 95, 0.12) !important;
                    padding: 8px !important;
                }
                
                .ant-dropdown-menu-item {
                    border-radius: 8px !important;
                    margin: 4px 0 !important;
                    padding: 10px 16px !important;
                    transition: all 0.3s ease !important;
                }
                
                .ant-dropdown-menu-item:hover {
                    background-color: rgba(30, 58, 95, 0.08) !important;
                    color: ${ADMIN_NAVY} !important;
                }
                
                .ant-dropdown-menu-item:first-child {
                    color: ${ADMIN_NAVY} !important;
                    font-weight: 500 !important;
                }
                
                .ant-dropdown-menu-item:last-child:hover {
                    background-color: rgba(239, 68, 68, 0.1) !important;
                    color: #dc2626 !important;
                }
            `}</style>
        </>
    );
};

export default Navbar;
