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
    Form,
    Image,
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
import View from "./View";
import { RiMoneyDollarCircleLine } from "react-icons/ri";

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

function formatExpenseDate(dateString) {
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
    const title = t("pages.expenseList");
    const { expenses, members, expenseTypes, budgetTypes, auth } = usePage().props;
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
            title: t("expense.deleteTitle"),
            icon: <ExclamationCircleFilled />,
            content: t("expense.deleteContent"),
            okText: t("common.yes"),
            okType: "danger",
            cancelText: t("common.no"),
            onOk() {
                destroy(route("administrative.expense.destroy", record.id));
            },
        });
    };

    const openFilters = () => {
        form.setFieldsValue({
            month: filters.month ?? null,
            year: filters.year ?? null,
        });
        setFilterOpen(true);
    };

    const applyFilters = useCallback(() => {
        const values = form.getFieldsValue();
        setFilters({
            month: values.month ?? null,
            year: values.year ?? null,
        });
        setState((prev) => ({ ...prev, currentPage: 1 }));
        setFilterOpen(false);
    }, [form]);

    const resetFilters = () => {
        form.resetFields();
        setFilters({
            month: null,
            year: null,
        });
        setState((prev) => ({ ...prev, currentPage: 1 }));
        setFilterOpen(false);
    };

    const matchesSearch = (item) => {
        if (!state.searchText) return true;
        const q = state.searchText;
        const memberName = (item.user?.name || "").toLowerCase();
        const typeName = (item.expense_type?.name || "").toLowerCase();
        const name = (item.name || "").toLowerCase();
        const monthStr = formatMonth(item.month).toLowerCase();
        const yearStr = String(item.year || "");
        const dateStr = formatExpenseDate(item.date).toLowerCase();
        const amountStr = formatPrice(item.amount).toLowerCase();
        const descStr = (item.description || "").toLowerCase();
        const driveStr = (item.drive_link || "").toLowerCase();
        return (
            memberName.includes(q) ||
            typeName.includes(q) ||
            name.includes(q) ||
            monthStr.includes(q) ||
            yearStr.includes(q) ||
            dateStr.includes(q) ||
            amountStr.includes(q) ||
            descStr.includes(q) ||
            driveStr.includes(q)
        );
    };

    const matchesFilters = (item) => {
        if (filters.month && Number(item.month) !== Number(filters.month)) {
            return false;
        }
        if (filters.year && Number(item.year) !== Number(filters.year)) {
            return false;
        }
        return true;
    };

    const filtered = (expenses || []).filter(
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
            title: t("expense.colMember"),
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
            title: t("expense.colExpenseType"),
            key: "expense_type",
            width: 140,
            render: (_, record) => record.expense_type?.name || "—",
            sorter: (a, b) =>
                (a.expense_type?.name || "").localeCompare(
                    b.expense_type?.name || "",
                ),
            sortOrder:
                state.sortedInfo?.columnKey === "expense_type"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("expense.colName"),
            dataIndex: "name",
            key: "name",
            width: 160,
            ellipsis: true,
            sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
            sortOrder:
                state.sortedInfo?.columnKey === "name"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("expense.colMonth"),
            dataIndex: "month",
            key: "month",
            width: 110,
            render: (month) => formatMonth(month),
            sorter: (a, b) => Number(a.month) - Number(b.month),
            sortOrder:
                state.sortedInfo?.columnKey === "month"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("expense.colYear"),
            dataIndex: "year",
            key: "year",
            width: 90,
            sorter: (a, b) => Number(a.year) - Number(b.year),
            sortOrder:
                state.sortedInfo?.columnKey === "year"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("expense.colDate"),
            dataIndex: "date",
            key: "date",
            width: 150,
            render: (date) => formatExpenseDate(date),
            sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
            sortOrder:
                state.sortedInfo?.columnKey === "date"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("expense.colAmount"),
            dataIndex: "amount",
            key: "amount",
            width: 120,
            render: (amount) => formatPrice(amount),
            sorter: (a, b) => Number(a.amount) - Number(b.amount),
            sortOrder:
                state.sortedInfo?.columnKey === "amount"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("expense.colDescription"),
            dataIndex: "description",
            key: "description",
            width: 160,
            ellipsis: true,
            render: (text) => text || "—",
        },
        {
            title: t("common.colDriveLink"),
            dataIndex: "drive_link",
            key: "drive_link",
            width: 90,
            render: (link) =>
                link ? (
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t("common.colDriveLink")}
                    </a>
                ) : (
                    "—"
                ),
        },
        {
            title: t("expense.colImage"),
            key: "image",
            width: 80,
            render: (_, record) =>
                record.image ? (
                    <Image
                        src={route(
                            "administrative.expense.image",
                            record.id,
                            true,
                        )}
                        alt={record.name}
                        width={48}
                        height={48}
                        style={{ objectFit: "cover", borderRadius: 6 }}
                    />
                ) : (
                    "—"
                ),
        },
        {
            title: t("common.status"),
            dataIndex: "status",
            key: "status",
            width: 100,
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
            width: 150,
            fixed: "right",
            render: (_, record) => (
                <Space>
                    {hasPermission("expense_list") && (
                        <View key={`view-${record.id}`} expense={record} />
                    )}
                    {hasPermission("expense_edit") && (
                        <Edit
                            key={record.id}
                            expense={record}
                            members={members}
                            expenseTypes={expenseTypes}
                            budgetTypes={budgetTypes}
                        />
                    )}
                    {hasPermission("expense_delete") && (
                        <Button
                            variant="outlined"
                            danger
                            onClick={() => showDeleteConfirm(record)}
                            icon={<DeleteOutlined />}
                            title={t("expense.deleteBtnTitle")}
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
            href: "/administrative/expense",
            title: (
                <>
                    <RiMoneyDollarCircleLine /> {t("breadcrumb.expensesList")}
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
                                placeholder={t("common.searchExpense")}
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
                                {hasPermission("expense_create") && (
                                    <Create
                                        members={members}
                                        expenseTypes={expenseTypes}
                                        budgetTypes={budgetTypes}
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
                                    <Table.Summary.Cell index={0} colSpan={6}>
                                        <Text strong>{t("report.total")}</Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={6} align="right">
                                        <Text strong>
                                            {formatAdminDecimal(
                                                totalAmount,
                                                locale,
                                                2,
                                            )}
                                        </Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={7} />
                                    <Table.Summary.Cell index={8} />
                                    <Table.Summary.Cell index={9} />
                                    <Table.Summary.Cell index={10} />
                                    <Table.Summary.Cell index={11} />
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
