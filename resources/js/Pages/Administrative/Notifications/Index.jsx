import { Head } from "@inertiajs/react";
import { useState } from "react";
import { Button, Spin } from "antd";
import { CheckOutlined } from '@ant-design/icons';
import { GoBell } from "react-icons/go";
import { route } from "ziggy-js";
import AppLayout from "../../../components/layouts/AppLayout";
import { useAdminT } from "../../../contexts/AdminI18nContext";

export default function Index({ notifications: initialNotifications }) {
    const { t } = useAdminT();
    // Handle both Inertia props (paginator object) and JSON response (with data property)
    const getNotificationsData = (notifs) => {
        if (Array.isArray(notifs)) return notifs.filter(n => !n.is_read);
        if (notifs?.data) return notifs.data.filter(n => !n.is_read);
        return [];
    };

    const [notifications, setNotifications] = useState(getNotificationsData(initialNotifications));
    const [loading, setLoading] = useState(false);

    const handleMarkAsRead = async (notificationId) => {
        try {
            const response = await fetch(route('administrative.notifications.mark-as-read', notificationId), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (data.success) {
                // Remove the notification from the list when marked as read
                setNotifications(prev => 
                    prev.filter(n => n.id !== notificationId)
                );
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const response = await fetch(route('administrative.notifications.mark-all-as-read'), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (data.success) {
                // Remove all notifications from the list when all are marked as read
                setNotifications([]);
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return t("notificationDropdown.timeJustNow");
        if (diffInSeconds < 3600)
            return t("notificationDropdown.timeMinutesAgo", {
                n: Math.floor(diffInSeconds / 60),
            });
        if (diffInSeconds < 86400)
            return t("notificationDropdown.timeHoursAgo", {
                n: Math.floor(diffInSeconds / 3600),
            });
        if (diffInSeconds < 604800)
            return t("notificationDropdown.timeDaysAgo", {
                n: Math.floor(diffInSeconds / 86400),
            });
        return date.toLocaleDateString();
    };

    const pageTitle = t("pages.notifications");
    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <>
            <Head title={pageTitle} />
            <AppLayout title={pageTitle}>
                <div className="notification-page">
                    <div className="notification-page-header">
                        <div className="notification-page-title">{pageTitle}</div>
                        <div className="notification-page-subtitle">
                            {unreadCount > 0
                                ? t("notificationsPage.subtitleUnread", {
                                      count: unreadCount,
                                  })
                                : t("notificationsPage.subtitleAllRead")}
                        </div>
                        {unreadCount > 0 && (
                            <div style={{ marginTop: 16 }}>
                                <Button 
                                    type="primary" 
                                    onClick={handleMarkAllAsRead}
                                    style={{ borderRadius: 8 }}
                                >
                                    {t("notificationsPage.markAllRead")}
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="notification-list-container">
                        {loading ? (
                            <div className="notification-loading">
                                <Spin size="large" />
                            </div>
                        ) : notifications.filter(n => !n.is_read).length > 0 ? (
                            <>
                                <div className="notification-list">
                                    {notifications.filter(n => !n.is_read).map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`notification-card ${!notification.is_read ? 'unread' : 'read'}`}
                                        >
                                            <div className="notification-icon-column">
                                                <div className="notification-icon-wrapper">
                                                    <GoBell className="notification-icon" />
                                                </div>
                                                {!notification.is_read && (
                                                    <div 
                                                        className="notification-mark-read-icon"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleMarkAsRead(notification.id);
                                                        }}
                                                        title={t("notificationsPage.markAsReadTitle")}
                                                    >
                                                        <CheckOutlined />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="notification-content">
                                                <div className="notification-title">
                                                    {notification.title}
                                                </div>
                                                <div className="notification-message">
                                                    {notification.message}
                                                </div>
                                                <div className="notification-time">
                                                    {formatTimeAgo(notification.created_at)}
                                                </div>
                                            </div>
                                            {!notification.is_read && (
                                                <div className="notification-unread-indicator"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="notification-empty">
                                <div className="notification-empty-icon">
                                    <GoBell />
                                </div>
                                <div className="notification-empty-text">{t("notificationsPage.emptyList")}</div>
                            </div>
                        )}
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
