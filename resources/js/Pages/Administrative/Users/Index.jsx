import {
    DeleteOutlined,
    ExclamationCircleFilled,
    HomeOutlined,
    SearchOutlined,
    LockOutlined,
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    ClockCircleOutlined,
    DownloadOutlined,
    CrownOutlined,
    BankOutlined,
    TeamOutlined,
    FilterOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import {
    Button,
    Col,
    Input,
    Modal,
    Row,
    Table,
    Space,
    Tag,
    Typography,
    Badge,
    Form,
    Select,
    DatePicker,
    Switch,
} from "antd";
import dayjs from "dayjs";
import { useState, useEffect, useMemo } from "react";
import AppLayout from "../../../components/layouts/AppLayout";
import Create from "./Create";
import Edit from "./Edit";
import formatRoleLabel from "@/helpers/formatRoleLabel";
import { formatDateTime } from "@/helpers/utils";
import { ADMIN_NAVY } from "@/theme/adminColors";
import { useAdminT } from "@/contexts/AdminI18nContext";

const { Text } = Typography;

// Filter Modal Component
const FilterModal = ({
    visible,
    onClose,
    onApply,
    onReset,
    roles = [],
    schools = [],
    initialFilters = {},
}) => {
    const { t } = useAdminT();
    const [filterForm] = Form.useForm();

    const handleApply = () => {
        const formValues = filterForm.getFieldsValue();
        const appliedFilters = {
            role_id: formValues.role_id || null,
            status: formValues.status !== undefined ? formValues.status : null,
            registration_date_from: formValues.registration_date_from
                ? dayjs(formValues.registration_date_from)
                      .startOf("day")
                      .format("YYYY-MM-DD")
                : null,
            registration_date_to: formValues.registration_date_to
                ? dayjs(formValues.registration_date_to)
                      .endOf("day")
                      .format("YYYY-MM-DD")
                : null,
            last_login_from: formValues.last_login_from
                ? dayjs(formValues.last_login_from)
                      .startOf("day")
                      .format("YYYY-MM-DD")
                : null,
            last_login_to: formValues.last_login_to
                ? dayjs(formValues.last_login_to)
                      .endOf("day")
                      .format("YYYY-MM-DD")
                : null,
            school_id: formValues.school_id || null,
        };
        onApply(appliedFilters);
    };

    const handleReset = () => {
        filterForm.resetFields();
        onReset();
    };

    useEffect(() => {
        if (visible) {
            filterForm.setFieldsValue({
                role_id: initialFilters.role_id || null,
                status:
                    initialFilters.status !== undefined
                        ? initialFilters.status
                        : null,
                registration_date_from: initialFilters.registration_date_from
                    ? dayjs(initialFilters.registration_date_from)
                    : null,
                registration_date_to: initialFilters.registration_date_to
                    ? dayjs(initialFilters.registration_date_to)
                    : null,
                last_login_from: initialFilters.last_login_from
                    ? dayjs(initialFilters.last_login_from)
                    : null,
                last_login_to: initialFilters.last_login_to
                    ? dayjs(initialFilters.last_login_to)
                    : null,
                school_id: initialFilters.school_id || null,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    return (
        <Modal
            title={t("user.filterTitle")}
            open={visible}
            onCancel={onClose}
            footer={[
                <Button
                    key="reset"
                    icon={<ReloadOutlined />}
                    onClick={handleReset}
                    style={{
                        color: ADMIN_NAVY,
                        borderColor: ADMIN_NAVY,
                    }}
                >
                    {t("common.reset")}
                </Button>,
                <Button
                    key="apply"
                    type="primary"
                    onClick={handleApply}
                    style={{
                        backgroundColor: ADMIN_NAVY,
                        borderColor: ADMIN_NAVY,
                        color: "#ffffff",
                    }}
                >
                    {t("user.filterApply")}
                </Button>,
            ]}
            width={800}
        >
            <Form form={filterForm} layout="vertical">
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <Form.Item name="role_id" label={t("user.filterRole")}>
                            <Select
                                placeholder={t("user.filterRolePh")}
                                size="large"
                                showSearch
                                allowClear
                                filterOption={(input, option) =>
                                    (option?.label ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                options={roles}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name="status" label={t("user.filterStatus")}>
                            <Select
                                placeholder={t("user.filterStatusPh")}
                                size="large"
                                allowClear
                                options={[
                                    { value: 1, label: t("common.active") },
                                    { value: 0, label: t("common.inactive") },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    {/* <Col xs={24} md={12}>
                        <Form.Item name="school_id" label="Associated School">
                            <Select
                                placeholder="Select School"
                                size="large"
                                showSearch
                                allowClear
                                filterOption={(input, option) =>
                                    (option?.label ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                options={schools}
                            />
                        </Form.Item>
                    </Col> */}
                    <Col xs={24}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>
                            {t("user.registrationDateSection")}
                        </div>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="registration_date_from"
                            label={t("user.filterFrom")}
                        >
                            <DatePicker
                                style={{ width: "100%" }}
                                size="large"
                                placeholder={t("user.selectStartDate")}
                                format="YYYY-MM-DD"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="registration_date_to"
                            label={t("user.filterTo")}
                        >
                            <DatePicker
                                style={{ width: "100%" }}
                                size="large"
                                placeholder={t("user.selectEndDate")}
                                format="YYYY-MM-DD"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>
                            {t("user.lastLoginSection")}
                        </div>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="last_login_from"
                            label={t("user.filterFrom")}
                        >
                            <DatePicker
                                style={{ width: "100%" }}
                                size="large"
                                placeholder={t("user.selectStartDate")}
                                format="YYYY-MM-DD"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="last_login_to"
                            label={t("user.filterTo")}
                        >
                            <DatePicker
                                style={{ width: "100%" }}
                                size="large"
                                placeholder={t("user.selectEndDate")}
                                format="YYYY-MM-DD"
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

// Helper function to get role styling (color and icon) based on role name
const getRoleStyle = (roleName) => {
    if (!roleName) return { color: "default", icon: <UserOutlined /> };

    const normalizedRole = roleName.toLowerCase().trim();

    // Administrator roles - Red with Crown
    if (
        normalizedRole.includes("administrator") ||
        normalizedRole.includes("admin")
    ) {
        if (normalizedRole.includes("platform")) {
            return {
                color: "red",
                icon: <CrownOutlined />,
                label: "Platform Administrator",
            };
        }
        if (normalizedRole.includes("supervisor")) {
            return {
                color: "red",
                icon: <CrownOutlined />,
                label: "Supervisor Administrator",
            };
        }
        return {
            color: "red",
            icon: <CrownOutlined />,
            label: "Administrator",
        };
    }

    // School Admin - Blue with Bank icon
    if (normalizedRole === "school" || normalizedRole.includes("school")) {
        return {
            color: "blue",
            icon: <BankOutlined />,
            label: "School Administrator",
        };
    }

    // Teacher - Green with Team icon
    if (normalizedRole === "teacher" || normalizedRole.includes("teacher")) {
        return { color: "green", icon: <TeamOutlined />, label: "Teacher" };
    }

    // Student/User - Gray with User icon
    if (
        normalizedRole === "user" ||
        normalizedRole === "student" ||
        normalizedRole.includes("student")
    ) {
        return { color: "default", icon: <UserOutlined />, label: "User" };
    }

    // Default - Gray with User icon
    return {
        color: "default",
        icon: <UserOutlined />,
        label: formatRoleLabel(roleName),
    };
};

export default function Index() {
    const { t } = useAdminT();
    const title = t("pages.userList");
    const { users, auth, schools } = usePage().props;
    const { confirm } = Modal;
    const { delete: destroy } = useForm();

    const permissions = auth?.permissions || [];
    const hasPermission = (permission) => permissions.includes(permission);

    const [state, setState] = useState({
        currentPage: 1,
        pageSize: 10,
        searchText: "",
        sortedInfo: {},
        isDrawerVisible: false,
        drawerType: "",
        editingUser: null,
    });

    // Filter states
    const [statusUpdating, setStatusUpdating] = useState({});
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filters, setFilters] = useState({
        role_id: null,
        status: null,
        registration_date_from: null,
        registration_date_to: null,
        last_login_from: null,
        last_login_to: null,
        school_id: null,
    });

    const canViewApplicantUsers =
        hasPermission("applicant_user_list") || hasPermission("user_list");
    const canViewAdministrativeUsers =
        hasPermission("administrative_user_list") || hasPermission("user_list");

    const handleSearch = (e) => {
        setState((prevState) => ({
            ...prevState,
            searchText: e.target.value.toLowerCase(),
            currentPage: 1,
        }));
    };

    const handleTableChange = (_, __, sorter) => {
        setState((prevState) => ({
            ...prevState,
            sortedInfo: sorter,
        }));
    };
    const showDeleteConfirm = (record) => {
        confirm({
            title: t("user.deleteTitle"),
            icon: <ExclamationCircleFilled />,
            content: t("user.deleteContent"),
            okText: t("common.yes"),
            okType: "danger",
            cancelText: t("common.no"),
            onOk() {
                destroy(route("administrative.user.destroy", record.id));
            },
            onCancel() {
                // console.log('Cancel');
            },
        });
    };

    const handleExport = () => {
        const queryParams = new URLSearchParams();

        // Add search if exists
        if (state.searchText) {
            queryParams.append("search", state.searchText);
        }

        const url =
            route("administrative.user.export") + "?" + queryParams.toString();
        window.open(url, "_blank");
    };

    // Filter handlers
    const handleApplyFilters = (appliedFilters) => {
        setFilters(appliedFilters);
        setFilterModalVisible(false);
        setState((prevState) => ({
            ...prevState,
            currentPage: 1, // Reset to first page when filters change
        }));
    };

    const handleStatusChange = (record, checked) => {
        if (!record?.id || !hasPermission("user_edit")) {
            return;
        }

        const nextStatus = checked ? 1 : 0;

        setStatusUpdating((prev) => ({
            ...prev,
            [record.id]: true,
        }));

        router.post(
            route("administrative.user.status", record.id),
            {
                status: nextStatus,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setStatusUpdating((prev) => {
                        const next = { ...prev };
                        delete next[record.id];
                        return next;
                    });
                },
            },
        );
    };

    const handleResetFilters = () => {
        const resetFilters = {
            role_id: null,
            status: null,
            registration_date_from: null,
            registration_date_to: null,
            last_login_from: null,
            last_login_to: null,
            school_id: null,
        };
        setFilters(resetFilters);
        setState((prevState) => ({
            ...prevState,
            currentPage: 1,
        }));
    };

    // Count active filters
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.role_id) count++;
        if (filters.status !== null && filters.status !== undefined) count++;
        if (filters.registration_date_from || filters.registration_date_to)
            count++;
        if (filters.last_login_from || filters.last_login_to) count++;
        if (filters.school_id) count++;
        return count;
    }, [filters]);

    const uniqueRoles = useMemo(() => {
        if (!users || !Array.isArray(users)) return [];
        const roleMap = new Map();
        users.forEach((user) => {
            if (user?.roles && user.roles.length > 0) {
                const role = user.roles[0];
                if (role && role.id) {
                    roleMap.set(role.id, {
                        value: role.id,
                        label: formatRoleLabel(role.name),
                    });
                }
            }
        });
        return Array.from(roleMap.values());
    }, [users]);

    // Filter users based on search text and filters
    const filteredUsers = useMemo(() => {
        if (!users || !Array.isArray(users)) return [];

        return users.filter((user) => {
            // Filter out invalid users (null, undefined, or missing id)
            if (!user || !user.id) return false;

            // Search filter
            const search = state.searchText;
            if (search) {
                const userName = (user.name || "").toLowerCase();
                const userPhone = (user.phone || "").toLowerCase();
                const userEmail = (user.email || "").toLowerCase();
                const matchesSearch =
                    userName.includes(search) ||
                    userPhone.includes(search) ||
                    userEmail.includes(search);
                if (!matchesSearch) return false;
            }

            // Role filter
            if (filters.role_id) {
                const userRoleId = user?.roles?.[0]?.id;
                if (userRoleId !== filters.role_id) return false;
            }

            // Status filter
            if (filters.status !== null && filters.status !== undefined) {
                const userStatus = Number(user.status);
                if (userStatus !== filters.status) return false;
            }

            // Registration date filter
            if (
                filters.registration_date_from ||
                filters.registration_date_to
            ) {
                if (!user.created_at) return false;
                const regDate = dayjs(user.created_at);
                if (
                    filters.registration_date_from &&
                    regDate.isBefore(
                        dayjs(filters.registration_date_from),
                        "day",
                    )
                )
                    return false;
                if (
                    filters.registration_date_to &&
                    regDate.isAfter(dayjs(filters.registration_date_to), "day")
                )
                    return false;
            }

            // Last login date filter
            if (filters.last_login_from || filters.last_login_to) {
                if (!user.last_login_at) {
                    // If filtering for last login but user never logged in, exclude
                    if (filters.last_login_from || filters.last_login_to)
                        return false;
                } else {
                    const loginDate = dayjs(user.last_login_at);
                    if (
                        filters.last_login_from &&
                        loginDate.isBefore(
                            dayjs(filters.last_login_from),
                            "day",
                        )
                    )
                        return false;
                    if (
                        filters.last_login_to &&
                        loginDate.isAfter(dayjs(filters.last_login_to), "day")
                    )
                        return false;
                }
            }

            // School filter
            if (filters.school_id) {
                const userSchool = user?.school || user?.schools?.[0];
                const userSchoolId = userSchool?.id || user?.school_id;
                if (userSchoolId !== filters.school_id) return false;
            }

            return true;
        });
    }, [users, state.searchText, filters]);

    // Calculate total for pagination
    const totalFiltered = filteredUsers.length;

    // Calculate max page to prevent going beyond available data
    const maxPage = Math.max(1, Math.ceil(totalFiltered / state.pageSize));

    // Reset to page 1 if current page exceeds available pages
    useEffect(() => {
        if (state.currentPage > maxPage && maxPage > 0) {
            setState((prevState) => ({
                ...prevState,
                currentPage: 1,
            }));
        }
    }, [maxPage, state.currentPage]);

    // Slice data for current page
    const filteredData = useMemo(() => {
        if (!filteredUsers || filteredUsers.length === 0) return [];

        const startIndex = (state.currentPage - 1) * state.pageSize;
        const endIndex = state.currentPage * state.pageSize;
        const sliced = filteredUsers.slice(startIndex, endIndex);

        // Ensure all records have valid id
        return sliced.filter((record) => record && record.id);
    }, [filteredUsers, state.currentPage, state.pageSize]);

    const columns = [
        {
            title: t("user.colUser"),
            key: "user_info",
            width: 280,
            align: "left",
            render: (_, record) => {
                if (!record || !record.id) return null;
                return (
                    <Space direction="vertical" size={4}>
                        <div
                            style={{
                                fontWeight: 600,
                                fontSize: "15px",
                                color: "#262626",
                            }}
                        >
                            {record.name || "--"}
                        </div>
                        <div
                            style={{
                                fontSize: "12px",
                                color: "#8c8c8c",
                            }}
                        >
                            <MailOutlined style={{ marginRight: "4px" }} />
                            {record.email ? (
                                <a href={`mailto:${record.email}`}>
                                    {record.email}
                                </a>
                            ) : (
                                "--"
                            )}
                        </div>
                    </Space>
                );
            },
        },
        {
            title: t("user.colRole"),
            dataIndex: "roles",
            key: "roles",
            width: 150,
            align: "left",
            sorter: (a, b) => {
                if (!a || !b) return 0;
                return (a.roles?.[0]?.name || "").localeCompare(
                    b.roles?.[0]?.name || "",
                );
            },
            sortOrder:
                state.sortedInfo?.columnKey === "roles"
                    ? state.sortedInfo.order
                    : null,
            render: (roles, record) => {
                if (!record || !record.id) return null;
                if (!roles || !roles.length || !roles[0]?.name) {
                    return (
                        <Text type="secondary" italic>
                            --
                        </Text>
                    );
                }

                const roleName = roles[0].name;
                const roleStyle = getRoleStyle(roleName);

                return (
                    <Tag
                        color={roleStyle.color}
                        style={{
                            fontSize: "12px",
                            padding: "4px 12px",
                            display: "inline-flex",
                            alignItems: "center",
                        }}
                    >
                        <Space size={4}>
                            <span style={{ fontSize: "12px" }}>
                                {roleStyle.icon}
                            </span>
                            <span>
                                {roleStyle.label || formatRoleLabel(roleName)}
                            </span>
                        </Space>
                    </Tag>
                );
            },
        },
        {
            title: t("user.colContact"),
            key: "contact",
            width: 200,
            align: "center",
            render: (_, record) => {
                if (!record || !record.id) return null;
                return (
                    <div>
                        {record.phone && (
                            <div style={{ marginBottom: "4px" }}>
                                <PhoneOutlined
                                    style={{
                                        marginRight: "6px",
                                        color: "#1890ff",
                                    }}
                                />
                                <a href={`tel:${record.phone}`}>
                                    <Text style={{ cursor: "pointer" }}>
                                        {record.phone}
                                    </Text>
                                </a>
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: t("user.colLastLogin"),
            key: "last_login",
            width: 180,
            align: "center",
            sorter: (a, b) => {
                if (!a || !b) return 0;
                const aDate = a.last_login_at
                    ? new Date(a.last_login_at).getTime()
                    : 0;
                const bDate = b.last_login_at
                    ? new Date(b.last_login_at).getTime()
                    : 0;
                return aDate - bDate;
            },
            sortOrder:
                state.sortedInfo?.columnKey === "last_login"
                    ? state.sortedInfo.order
                    : null,
            render: (_, record) => {
                if (!record || !record.id) return null;
                const lastLogin = record.last_login_at;
                return (
                    <Space>
                        <ClockCircleOutlined style={{ color: "#8c8c8c" }} />
                        <Text style={{ fontSize: "12px", color: "#8c8c8c" }}>
                            {lastLogin
                                ? formatDateTime(lastLogin)
                                : t("user.never")}
                        </Text>
                    </Space>
                );
            },
        },
        {
            title: t("user.colStatus"),
            dataIndex: "status",
            key: "status",
            width: 120,
            align: "center",
            sorter: (a, b) => {
                if (!a || !b) return 0;
                return (a.status || 0) - (b.status || 0);
            },
            sortOrder:
                state.sortedInfo?.columnKey === "status"
                    ? state.sortedInfo.order
                    : null,
            render: (status, record) => {
                if (!record || !record.id) return null;
                const statusValue = Number(status) === 1;

                if (!hasPermission("user_edit")) {
                    return (
                        <Tag
                            color={statusValue ? "success" : "error"}
                            style={{ fontSize: "12px", padding: "4px 12px" }}
                        >
                            {statusValue
                                ? t("common.active")
                                : t("common.inactive")}
                        </Tag>
                    );
                }

                return (
                    <Switch
                        checked={statusValue}
                        checkedChildren={t("common.active")}
                        unCheckedChildren={t("common.inactive")}
                        loading={Boolean(statusUpdating[record.id])}
                        onChange={(checked) =>
                            handleStatusChange(record, checked)
                        }
                    />
                );
            },
        },
        {
            title: t("common.actions"),
            key: "actions",
            width: 120,
            fixed: "right",
            align: "center",
            render: (_, record) => {
                // Safety check: ensure record is valid
                if (!record || !record.id) return null;

                return (
                    <Space>
                        {hasPermission("user_edit") && <Edit user={record} />}
                        {hasPermission("user_delete") && (
                            <Button
                                variant="outlined"
                                danger
                                onClick={() => showDeleteConfirm(record)}
                                icon={<DeleteOutlined />}
                                title={t("user.deleteBtnTitle")}
                            />
                        )}
                    </Space>
                );
            },
        },
    ];

    const breadcrumbItems = [
        {
            href: "/",
            title: (
                <>
                    <HomeOutlined /> {t("breadcrumb.home")}
                </>
            ),
        },
        {
            href: "/administrative/user",
            title: (
                <>
                    <LockOutlined /> {t("breadcrumb.usersList")}
                </>
            ),
        },
    ];

    return (
        <>
            <AppLayout title={title} breadcrumb={breadcrumbItems}>
                <Head title={title} />
                <div>
                    {/* Search and Create Section */}
                    <Row
                        justify="space-between"
                        align="middle"
                        gutter={[16, 16]}
                        style={{ marginBottom: 24 }}
                    >
                        <Col xs={24} sm={12} md={8}>
                            <Input
                                placeholder={t("common.searchUser")}
                                prefix={<SearchOutlined />}
                                onChange={handleSearch}
                                allowClear
                                className="search-input"
                            />
                        </Col>
                        <Col
                            xs={24}
                            sm={12}
                            md={16}
                            style={{ textAlign: "right" }}
                        >
                            <Space>
                                <Button
                                    icon={<FilterOutlined />}
                                    type="primary"
                                    onClick={() => setFilterModalVisible(true)}
                                    style={{
                                        backgroundColor: ADMIN_NAVY,
                                        borderColor: ADMIN_NAVY,
                                        color: "#ffffff",
                                        ...(activeFilterCount > 0
                                            ? {
                                                  boxShadow:
                                                      "0 0 0 2px rgba(255,255,255,0.35)",
                                              }
                                            : {}),
                                    }}
                                >
                                    {t("common.filter")}
                                    {activeFilterCount > 0 && (
                                        <Badge
                                            count={activeFilterCount}
                                            style={{
                                                marginLeft: 8,
                                                backgroundColor: "#ffffff",
                                                color: ADMIN_NAVY,
                                            }}
                                        />
                                    )}
                                </Button>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={handleResetFilters}
                                    title={t("common.reset")}
                                    style={{
                                        color: ADMIN_NAVY,
                                        borderColor: ADMIN_NAVY,
                                    }}
                                />
                                <Button
                                    icon={<DownloadOutlined />}
                                    type="primary"
                                    onClick={handleExport}
                                    style={{
                                        backgroundColor: ADMIN_NAVY,
                                        borderColor: ADMIN_NAVY,
                                        color: "#ffffff",
                                    }}
                                >
                                    {t("common.export")}
                                </Button>
                                {hasPermission("user_create") && <Create />}
                            </Space>
                        </Col>
                    </Row>

                    {/* Users Table */}
                    {canViewApplicantUsers || canViewAdministrativeUsers ? (
                        <Table
                            dataSource={filteredData}
                            columns={columns}
                            rowKey={(record) =>
                                record?.id || `user-${Math.random()}`
                            }
                            scroll={{
                                x: "max-content",
                            }}
                            size="middle"
                            onChange={handleTableChange}
                            pagination={{
                                current: state.currentPage,
                                pageSize: state.pageSize,
                                total: totalFiltered,
                                onChange: (page, pageSize) => {
                                    setState((prevState) => ({
                                        ...prevState,
                                        currentPage: page,
                                        pageSize,
                                    }));
                                },
                                showSizeChanger: true,
                                showTotal: (total, range) =>
                                    t("table.showTotal", {
                                        start: range[0],
                                        end: range[1],
                                        total,
                                    }),
                                pageSizeOptions: ["10", "20", "50", "100"],
                            }}
                            rowClassName={(record, index) =>
                                index % 2 === 0
                                    ? "table-row-light"
                                    : "table-row-dark"
                            }
                        />
                    ) : null}
                </div>
            </AppLayout>

            {/* Filter Modal */}
            <FilterModal
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
                roles={uniqueRoles}
                schools={schools}
                initialFilters={filters}
            />

            <style>{`
                .table-row-light {
                    background-color: #fafafa;
                }
                .table-row-dark {
                    background-color: #ffffff;
                }
                .table-row-light:hover,
                .table-row-dark:hover {
                    background-color: #e6f7ff !important;
                    transition: background-color 0.3s ease;
                }
                .ant-table-tbody > tr > td {
                    padding: 16px !important;
                }
            `}</style>
        </>
    );
}
