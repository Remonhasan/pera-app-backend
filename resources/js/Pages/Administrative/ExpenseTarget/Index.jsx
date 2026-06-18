import {
    HomeOutlined,
    SearchOutlined,
    DeleteOutlined,
    ExclamationCircleFilled,
} from "@ant-design/icons";
import { Head, usePage, useForm } from "@inertiajs/react";
import {
    Button,
    Col,
    Input,
    Row,
    Table,
    Modal,
    Space,
    Tag,
    Typography,
} from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import AppLayout from "../../../components/layouts/AppLayout";
import { useAdminT } from "../../../contexts/AdminI18nContext";
import { formatAdminDecimal } from "../../../helpers/adminNumberFormat";
import Create from "./Create";
import Edit from "./Edit";
import { RiFocus3Line } from "react-icons/ri";

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

function formatMonth(month) {
    const m = Number(month);
    if (!m || m < 1 || m > 12) return "—";
    return MONTH_NAMES[m - 1];
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

// function monthlyTarget(amount) {
//     return (Number(amount) || 0) * 30;
// }

function monthlyTarget(amount, month, year) {
    const days = daysInMonth(month, year);
    return (Number(amount) || 0) * days;
}

function daysInMonth(month, year) {
    const m = Number(month);
    const y = Number(year);
    if (!m || m < 1 || m > 12 || !y) {
        return 30;
    }
    return dayjs(`${y}-${String(m).padStart(2, "0")}-01`).daysInMonth();
}

function amountPerDay(amount, month, year) {
    const days = daysInMonth(month, year);
    return days > 0 ? monthlyTarget(amount, month, year) / days : 0;
}

export default function Index() {
    const { t, locale } = useAdminT();
    const title = t("pages.expenseTargetList");
    const { expenseTargets, budgetTypes, members, auth } = usePage().props;
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
            title: t("expenseTarget.deleteTitle"),
            icon: <ExclamationCircleFilled />,
            content: t("expenseTarget.deleteContent"),
            okText: t("common.yes"),
            okType: "danger",
            cancelText: t("common.no"),
            onOk() {
                destroy(
                    route("administrative.expense-target.destroy", record.id),
                );
            },
        });
    };

    const matchesSearch = (item) => {
        if (!state.searchText) return true;
        const q = state.searchText;
        const memberName = (item.user?.name || "").toLowerCase();
        const typeName = (item.budget_type?.name || "").toLowerCase();
        const monthStr = formatMonth(item.month).toLowerCase();
        const yearStr = String(item.year || "");
        const amountStr = formatPrice(item.amount).toLowerCase();
        return (
            memberName.includes(q) ||
            typeName.includes(q) ||
            monthStr.includes(q) ||
            yearStr.includes(q) ||
            amountStr.includes(q)
        );
    };

    const filtered = (expenseTargets || []).filter(matchesSearch);

    const totalAmount = useMemo(
        () =>
            filtered.reduce(
                (sum, item) =>
                    sum + amountPerDay(item.amount, item.month, item.year),
                0,
            ),
        [filtered],
    );

    const totalBudget = useMemo(
        () =>
            filtered.reduce(
                (sum, item) =>
                    sum + monthlyTarget(item.amount, item.month, item.year),
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
            title: t("expenseTarget.colMember"),
            key: "user",
            width: 160,
            ellipsis: true,
            render: (_, record) => record.user?.name || "—",
            sorter: (a, b) =>
                (a.user?.name || "").localeCompare(b.user?.name || ""),
            sortOrder:
                state.sortedInfo?.columnKey === "user"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("expenseTarget.colBudgetType"),
            key: "budget_type",
            width: 240,
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
            title: t("expenseTarget.colMonth"),
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
            title: t("expenseTarget.colYear"),
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
            title: t("expenseTarget.colAmountPerDay"),
            dataIndex: "amount",
            key: "amount",
            width: 140,
            render: (_, record) =>
                formatPrice(
                    amountPerDay(record.amount, record.month, record.year),
                ),
            sorter: (a, b) =>
                amountPerDay(a.amount, a.month, a.year) -
                amountPerDay(b.amount, b.month, b.year),
            sortOrder:
                state.sortedInfo?.columnKey === "amount"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("expenseTarget.colBudget30Days"),
            key: "budget_30_days",
            width: 160,
            render: (_, record) =>
                formatPrice(
                    monthlyTarget(record.amount, record.month, record.year),
                ),
            sorter: (a, b) =>
                monthlyTarget(a.amount, a.month, a.year) -
                monthlyTarget(b.amount, b.month, b.year),
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
                    {hasPermission("expense_target_edit") && (
                        <Edit
                            key={record.id}
                            expenseTarget={record}
                            budgetTypes={budgetTypes}
                            members={members}
                        />
                    )}
                    {hasPermission("expense_target_delete") && (
                        <Button
                            variant="outlined"
                            danger
                            onClick={() => showDeleteConfirm(record)}
                            icon={<DeleteOutlined />}
                            title={t("expenseTarget.deleteBtnTitle")}
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
            href: "/administrative/expense-target",
            title: (
                <>
                    <RiFocus3Line /> {t("breadcrumb.expenseTargetsList")}
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
                                placeholder={t("common.searchExpenseTarget")}
                                prefix={<SearchOutlined />}
                                onChange={handleSearch}
                                allowClear
                                className="search-input"
                            />
                        </Col>
                        <Col
                            xs={24}
                            sm={12}
                            md={6}
                            style={{ textAlign: "right" }}
                        >
                            {hasPermission("expense_target_create") && (
                                <Create
                                    budgetTypes={budgetTypes}
                                    members={members}
                                />
                            )}
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
                            index % 2 === 0
                                ? "table-row-light"
                                : "table-row-dark"
                        }
                        summary={() => (
                            <Table.Summary fixed>
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0} colSpan={4}>
                                        <Text strong>{t("report.total")}</Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={4} align="right">
                                        <Text strong>
                                            {formatAdminDecimal(
                                                totalAmount,
                                                locale,
                                                2,
                                            )}
                                        </Text>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: "#8c8c8c",
                                            }}
                                        >
                                            {t(
                                                "expenseTarget.summaryTotalAmount",
                                            )}
                                        </div>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={5} align="right">
                                        <Text strong>
                                            {formatAdminDecimal(
                                                totalBudget,
                                                locale,
                                                2,
                                            )}
                                        </Text>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: "#8c8c8c",
                                            }}
                                        >
                                            {t("expenseTarget.summaryBudget")}
                                        </div>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={6} />
                                    <Table.Summary.Cell index={7} />
                                </Table.Summary.Row>
                            </Table.Summary>
                        )}
                    />
                </div>
            </AppLayout>
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
