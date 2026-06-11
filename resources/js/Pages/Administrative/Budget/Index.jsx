import {
    FilterOutlined,
    HomeOutlined,
    ReloadOutlined,
    SearchOutlined,
    DeleteOutlined,
    ExclamationCircleFilled,
} from "@ant-design/icons";
import { Head, usePage, useForm } from "@inertiajs/react";
import {
    Button,
    Col,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Table,
    Modal,
    Space,
    Tag,
    Typography,
} from "antd";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import AppLayout from "../../../components/layouts/AppLayout";
import { useAdminT } from "../../../contexts/AdminI18nContext";
import { formatAdminDecimal } from "../../../helpers/adminNumberFormat";
import { getAdminMonthOptions } from "../../../helpers/adminMonthFormat";
import { ADMIN_NAVY } from "../../../theme/adminColors";
import Create from "./Create";
import Edit from "./Edit";
import { RiWallet3Line } from "react-icons/ri";

const { Text } = Typography;

const MONTH_NAMES = [
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

function formatBudgetDate(dateString) {
    if (!dateString) return "—";
    try {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return "—";
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    } catch {
        return "—";
    }
}

function formatPrice(val) {
    const n = Number(val);
    if (Number.isNaN(n)) {
        return "—";
    }
    return n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function formatMonth(month) {
    const m = Number(month);
    if (!m || m < 1 || m > 12) return "—";
    return MONTH_NAMES[m - 1];
}

export default function Index() {
    const { t, locale } = useAdminT();
    const title = t("pages.budgetList");
    const { budgets, budgetTypes, members, auth } = usePage().props;
    const { confirm } = Modal;
    const { delete: destroy } = useForm();

    const permissionNames = auth?.permissions || [];
    const hasPermission = (permission) => permissionNames.includes(permission);

    const [state, setState] = useState({
        currentPage: 1,
        pageSize: 10,
        searchText: "",
        sortedInfo: {},
    });
    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        month: null,
        year: null,
        date_from: null,
        date_to: null,
    });
    const [form] = Form.useForm();

    const monthOptions = useMemo(
        () => getAdminMonthOptions(locale),
        [locale],
    );

    const handleSearch = (e) => {
        setState((prev) => ({
            ...prev,
            searchText: e.target.value.toLowerCase(),
            currentPage: 1,
        }));
    };

    const handleTableChange = (_, __, sorter) => {
        setState((prev) => ({ ...prev, sortedInfo: sorter }));
    };

    const showDeleteConfirm = (record) => {
        confirm({
            title: t("budget.deleteTitle"),
            icon: <ExclamationCircleFilled />,
            content: t("budget.deleteContent"),
            okText: t("common.yes"),
            okType: "danger",
            cancelText: t("common.no"),
            onOk() {
                destroy(route("administrative.budget.destroy", record.id));
            },
        });
    };

    const openFilters = () => {
        form.setFieldsValue({
            month: filters.month ?? null,
            year: filters.year ?? null,
            date_from: filters.date_from ? dayjs(filters.date_from) : null,
            date_to: filters.date_to ? dayjs(filters.date_to) : null,
        });
        setFilterOpen(true);
    };

    const applyFilters = useCallback(() => {
        const values = form.getFieldsValue();
        setFilters({
            month: values.month ?? null,
            year: values.year ?? null,
            date_from: values.date_from
                ? values.date_from.format("YYYY-MM-DD")
                : null,
            date_to: values.date_to
                ? values.date_to.format("YYYY-MM-DD")
                : null,
        });
        setState((prev) => ({ ...prev, currentPage: 1 }));
        setFilterOpen(false);
    }, [form]);

    const resetFilters = () => {
        form.resetFields();
        setFilters({
            month: null,
            year: null,
            date_from: null,
            date_to: null,
        });
        setState((prev) => ({ ...prev, currentPage: 1 }));
        setFilterOpen(false);
    };

    const matchesSearch = (item) => {
        if (!state.searchText) return true;
        const q = state.searchText;
        const memberName = (item.user?.name || "").toLowerCase();
        const typeName = (item.budget_type?.name || "").toLowerCase();
        const monthStr = formatMonth(item.month).toLowerCase();
        const yearStr = String(item.year || "");
        const dateStr = formatBudgetDate(item.date).toLowerCase();
        const amountStr = formatPrice(item.amount).toLowerCase();
        return (
            memberName.includes(q) ||
            typeName.includes(q) ||
            monthStr.includes(q) ||
            yearStr.includes(q) ||
            dateStr.includes(q) ||
            amountStr.includes(q)
        );
    };

    const matchesFilters = (item) => {
        if (filters.month && Number(item.month) !== Number(filters.month)) {
            return false;
        }
        if (filters.year && Number(item.year) !== Number(filters.year)) {
            return false;
        }
        if (filters.date_from) {
            const itemDate = dayjs(item.date);
            if (
                !itemDate.isValid() ||
                itemDate.isBefore(dayjs(filters.date_from), "day")
            ) {
                return false;
            }
        }
        if (filters.date_to) {
            const itemDate = dayjs(item.date);
            if (
                !itemDate.isValid() ||
                itemDate.isAfter(dayjs(filters.date_to), "day")
            ) {
                return false;
            }
        }
        return true;
    };

    const filtered = (budgets || []).filter(
        (item) => matchesSearch(item) && matchesFilters(item),
    );
    const totalAmount = useMemo(
        () =>
            filtered.reduce(
                (sum, item) => sum + (Number(item.amount) || 0),
                0,
            ),
        [filtered],
    );
    const paginated = filtered.slice(
        (state.currentPage - 1) * state.pageSize,
        state.currentPage * state.pageSize,
    );

    const columns = [
        {
            title: t("budget.colMember"),
            key: "user",
            width: 160,
            ellipsis: true,
            sorter: (a, b) =>
                (a.user?.name || "").localeCompare(b.user?.name || ""),
            sortOrder:
                state.sortedInfo?.columnKey === "user"
                    ? state.sortedInfo.order
                    : null,
            render: (_, record) => record.user?.name || "—",
        },
        {
            title: t("budget.colBudgetType"),
            key: "budget_type",
            width: 180,
            render: (_, record) => record.budget_type?.name || "—",
            sorter: (a, b) =>
                (a.budget_type?.name || "").localeCompare(
                    b.budget_type?.name || "",
                ),
            sortOrder:
                state.sortedInfo?.columnKey === "budget_type"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("budget.colMonth"),
            dataIndex: "month",
            key: "month",
            width: 120,
            render: (month) => formatMonth(month),
            sorter: (a, b) => Number(a.month) - Number(b.month),
            sortOrder:
                state.sortedInfo?.columnKey === "month"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("budget.colYear"),
            dataIndex: "year",
            key: "year",
            width: 100,
            sorter: (a, b) => Number(a.year) - Number(b.year),
            sortOrder:
                state.sortedInfo?.columnKey === "year"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("budget.colDate"),
            dataIndex: "date",
            key: "date",
            width: 160,
            render: (date) => formatBudgetDate(date),
            sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
            sortOrder:
                state.sortedInfo?.columnKey === "date"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("budget.colAmount"),
            dataIndex: "amount",
            key: "amount",
            width: 140,
            render: (amount) => formatPrice(amount),
            sorter: (a, b) => Number(a.amount) - Number(b.amount),
            sortOrder:
                state.sortedInfo?.columnKey === "amount"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("common.status"),
            dataIndex: "status",
            key: "status",
            width: 120,
            sorter: (a, b) => Number(a.status) - Number(b.status),
            sortOrder:
                state.sortedInfo?.columnKey === "status"
                    ? state.sortedInfo.order
                    : null,
            render: (status) =>
                status ? (
                    <Tag color="green">{t("common.active")}</Tag>
                ) : (
                    <Tag color="default">{t("common.inactive")}</Tag>
                ),
        },
        {
            title: t("common.actions"),
            key: "actions",
            width: 120,
            fixed: "right",
            render: (_, record) => (
                <Space>
                    {hasPermission("budget_edit") && (
                        <Edit
                            key={record.id}
                            budget={record}
                            budgetTypes={budgetTypes}
                            members={members}
                        />
                    )}
                    {hasPermission("budget_delete") && (
                        <Button
                            variant="outlined"
                            danger
                            onClick={() => showDeleteConfirm(record)}
                            icon={<DeleteOutlined />}
                            title={t("budget.deleteBtnTitle")}
                        />
                    )}
                </Space>
            ),
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
            href: "/administrative/budget",
            title: (
                <>
                    <RiWallet3Line /> {t("breadcrumb.budgetsList")}
                </>
            ),
        },
    ];

    return (
        <>
            <AppLayout title={title} breadcrumb={breadcrumbItems}>
                <Head title={title} />
                <div>
                    <Row
                        justify="space-between"
                        align="middle"
                        gutter={[16, 16]}
                        style={{ marginBottom: 24 }}
                    >
                        <Col xs={24} sm={12} md={8}>
                            <Input
                                placeholder={t("common.searchBudget")}
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
                            <Space wrap>
                                <Button
                                    type="primary"
                                    icon={<FilterOutlined />}
                                    onClick={openFilters}
                                    style={{
                                        backgroundColor: ADMIN_NAVY,
                                        borderColor: ADMIN_NAVY,
                                    }}
                                >
                                    {t("report.filters")}
                                </Button>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={resetFilters}
                                    title={t("common.reset")}
                                    style={{
                                        color: ADMIN_NAVY,
                                        borderColor: ADMIN_NAVY,
                                    }}
                                />
                                {hasPermission("budget_create") && (
                                    <Create
                                        budgetTypes={budgetTypes}
                                        members={members}
                                    />
                                )}
                            </Space>
                        </Col>
                    </Row>

                    <Table
                        dataSource={paginated}
                        columns={columns}
                        rowKey="id"
                        scroll={{ x: "max-content" }}
                        size="middle"
                        onChange={handleTableChange}
                        pagination={{
                            current: state.currentPage,
                            pageSize: state.pageSize,
                            total: filtered.length,
                            onChange: (page, pageSize) =>
                                setState((prev) => ({
                                    ...prev,
                                    currentPage: page,
                                    pageSize,
                                })),
                            showSizeChanger: true,
                            showTotal: (total, range) =>
                                t("table.showTotal", {
                                    start: range[0],
                                    end: range[1],
                                    total,
                                }),
                            pageSizeOptions: ["10", "20", "50", "100"],
                        }}
                        rowClassName={(_, index) =>
                            index % 2 === 0 ? "table-row-light" : "table-row-dark"
                        }
                        summary={() => (
                            <Table.Summary fixed>
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0} colSpan={5}>
                                        <Text strong>{t("report.total")}</Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={5} align="right">
                                        <Text strong>
                                            {formatAdminDecimal(
                                                totalAmount,
                                                locale,
                                                2,
                                            )}
                                        </Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={6} />
                                    <Table.Summary.Cell index={7} />
                                </Table.Summary.Row>
                            </Table.Summary>
                        )}
                    />
                </div>
            </AppLayout>

            <Modal
                title={t("report.filters")}
                open={filterOpen}
                onCancel={() => setFilterOpen(false)}
                width={640}
                footer={[
                    <Button
                        key="reset"
                        icon={<ReloadOutlined />}
                        onClick={resetFilters}
                        style={{
                            color: ADMIN_NAVY,
                            borderColor: ADMIN_NAVY,
                        }}
                    >
                        {t("common.reset")}
                    </Button>,
                    <Button key="cancel" onClick={() => setFilterOpen(false)}>
                        {t("common.cancel")}
                    </Button>,
                    <Button
                        key="apply"
                        type="primary"
                        onClick={applyFilters}
                        style={{
                            backgroundColor: ADMIN_NAVY,
                            borderColor: ADMIN_NAVY,
                        }}
                    >
                        {t("common.apply")}
                    </Button>,
                ]}
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label={t("report.colMonth")} name="month">
                                <Select
                                    allowClear
                                    options={monthOptions}
                                    placeholder={t(
                                        "report.filterMonthPlaceholder",
                                    )}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={t("report.colYear")} name="year">
                                <InputNumber
                                    style={{ width: "100%" }}
                                    min={1900}
                                    max={2100}
                                    placeholder={t(
                                        "report.filterYearPlaceholder",
                                    )}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={t("dashboard.dateFrom")}
                                name="date_from"
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    format="YYYY-MM-DD"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={t("dashboard.dateTo")}
                                name="date_to"
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    format="YYYY-MM-DD"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
            <style>{`
                .table-row-light { background-color: #fafafa; }
                .table-row-dark { background-color: #ffffff; }
                .table-row-light:hover,
                .table-row-dark:hover {
                    background-color: #e6f7ff !important;
                    transition: background-color 0.3s ease;
                }
                .ant-table-tbody > tr > td { padding: 16px !important; }
            `}</style>
        </>
    );
}
