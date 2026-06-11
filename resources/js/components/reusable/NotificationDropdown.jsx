import { Badge, Dropdown, Empty, Button, Pagination } from 'antd';
import { CheckOutlined, CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { GoBell } from 'react-icons/go';
import { useState, useEffect } from 'react';
import { route } from 'ziggy-js';
import { usePage } from '@inertiajs/react';
import { useAdminT } from '../../contexts/AdminI18nContext';

const NotificationDropdown = () => {
    const { t } = useAdminT();
    const { auth } = usePage().props;
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(usePage().props.unread_notifications_count || 0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalNotifications, setTotalNotifications] = useState(0);
    const [open, setOpen] = useState(false);

    const fetchNotifications = async (page = 1, limit = 10) => {
        setLoading(true);
        try {
            const response = await fetch(route('administrative.notifications.index', { limit, page }), {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const data = await response.json();
            if (data.success) {
                // Keep all notifications and control read/unread via is_read
                const allNotifications = data.notifications || [];
                setNotifications(allNotifications);
                setUnreadCount(data.unread_count);
                setTotalNotifications(data.total || allNotifications.length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (auth?.user) {
            fetchNotifications();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [auth?.user]);

    const handleMarkAsRead = async (notificationId, e) => {
        e.preventDefault();
        e.stopPropagation();
        
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
                setUnreadCount(data.unread_count);
                // Mark this notification as read but keep it visible
                setNotifications(prev =>
                    prev.map(n =>
                        n.id === notificationId ? { ...n, is_read: true } : n
                    )
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
                setUnreadCount(0);
                // Mark all notifications in the list as read (keep them visible)
                setNotifications(prev =>
                    prev.map(n => ({
                        ...n,
                        is_read: true,
                    }))
                );
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return t('notificationDropdown.timeJustNow');
        if (diffInSeconds < 3600)
            return t('notificationDropdown.timeMinutesAgo', {
                n: Math.floor(diffInSeconds / 60),
            });
        if (diffInSeconds < 86400)
            return t('notificationDropdown.timeHoursAgo', {
                n: Math.floor(diffInSeconds / 3600),
            });
        if (diffInSeconds < 604800)
            return t('notificationDropdown.timeDaysAgo', {
                n: Math.floor(diffInSeconds / 86400),
            });
        return date.toLocaleDateString();
    };

    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
        fetchNotifications(page, size);
    };

    const totalPages = totalNotifications > 0 ? Math.ceil(totalNotifications / pageSize) : 1;

    const dropdownContent = (
        <div className="notification-dropdown-wrapper">
            {/* Header */}
            <div className="notification-dropdown-header">
                <div className="notification-header-left">
                    <div className="notification-header-icon">
                        <GoBell style={{ fontSize: '20px', color: '#8b5cf6' }} />
                    </div>
                    <div className="notification-header-text">
                        <div className="notification-header-title">{t('notificationDropdown.headerTitle')}</div>
                        <div className="notification-header-subtitle">{t('notificationDropdown.unread', { count: unreadCount })}</div>
                    </div>
                </div>
                <Button
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={() => setOpen(false)}
                    className="notification-close-button"
                />
            </div>

            {/* Notification List */}
            <div className="notification-dropdown-body">
                {loading ? (
                    <div className="notification-loading">
                        <div className="notification-loading-spinner"></div>
                    </div>
                ) : notifications.length > 0 ? (
                    notifications.map((notification) => (
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
                                            handleMarkAsRead(notification.id, e);
                                        }}
                                        title={t('notificationDropdown.markAsReadTitle')}
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
                    ))
                ) : (
                    <div className="notification-empty">
                        <div className="notification-empty-icon">
                            <GoBell />
                        </div>
                        <div className="notification-empty-text">{t('notificationDropdown.empty')}</div>
                    </div>
                )}
            </div>

            {/* Footer with Pagination and Read All Button */}
            <div className="notification-dropdown-footer">
                <div className="notification-pagination-controls">
                    <Button
                        type="text"
                        icon={<LeftOutlined />}
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1, pageSize)}
                        className="notification-pagination-button"
                    />
                    <span className="notification-pagination-text">
                        {currentPage}/{totalPages || 1}
                    </span>
                    <Button
                        type="text"
                        icon={<RightOutlined />}
                        disabled={currentPage >= totalPages}
                        onClick={() => handlePageChange(currentPage + 1, pageSize)}
                        className="notification-pagination-button"
                    />
                </div>
                <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                    className="notification-read-all-button"
                >
                    {t('notificationDropdown.readAll')}
                </Button>
            </div>
        </div>
    );

    return (
        <Dropdown 
            dropdownRender={() => dropdownContent}
            placement="bottomRight" 
            trigger={['click']}
            open={open}
            onOpenChange={(isOpen) => {
                setOpen(isOpen);
                if (isOpen) {
                    fetchNotifications(currentPage, pageSize);
                }
            }}
            overlayClassName="notification-dropdown-overlay"
        >
            <div className="navbar-icon-wrapper" style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                <Badge count={unreadCount} size="small" offset={[-5, 5]}>
                    <GoBell style={{ fontSize: '20px', color: 'white' }} />
                </Badge>
            </div>
        </Dropdown>
    );
};

export default NotificationDropdown;
