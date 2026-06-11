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
import { RiSafe2Line } from "react-icons/ri";

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

function formatSavingDate(dateString) {
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
    const title = t("pages.savingList");
    const { savings, members, banks, savingTypes, auth } = usePage().props;
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
        date_from: null,
        date_to: null,
        month_from: null,
        month_to: null,
        year_from: null,
        year_to: null,
        bank_id: null,
        saving_type_id: null,
        user_id: null,
    });
    const [form] = Form.useForm();

    const monthOptions = useMemo(
        () => getAdminMonthOptions(locale),
        [locale],
    );

    const memberOptions = useMemo(
        () =>
            (members || []).map((m) => ({
                value: m.id,
                label: m.phone ? `${m.name} (${m.phone})` : m.name,
            })),
        [members],
    );

    const bankOptions = useMemo(
        () =>
            (banks || []).map((bank) => ({
                value: bank.id,
                label: bank.name,
            })),
        [banks],
    );

    const savingTypeOptions = useMemo(
        () =>
            (savingTypes || []).map((type) => ({
                value: type.id,
                label: type.name,
            })),
        [savingTypes],
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
            title: t("saving.deleteTitle"),
            icon: <ExclamationCircleFilled />,
            content: t("saving.deleteContent"),
            okText: t("common.yes"),
            okType: "danger",
            cancelText: t("common.no"),
            onOk() {
                destroy(route("administrative.saving.destroy", record.id));
            },
        });
    };

    const openFilters = () => {
        form.setFieldsValue({
            date_from: filters.date_from ? dayjs(filters.date_from) : null,
            date_to: filters.date_to ? dayjs(filters.date_to) : null,
            month_from: filters.month_from ?? null,
            month_to: filters.month_to ?? null,
            year_from: filters.year_from ?? null,
            year_to: filters.year_to ?? null,
            bank_id: filters.bank_id ?? null,
            saving_type_id: filters.saving_type_id ?? null,
            user_id: filters.user_id ?? null,
        });
        setFilterOpen(true);
    };

    const applyFilters = useCallback(() => {
        const values = form.getFieldsValue();
        setFilters({
            date_from: values.date_from
                ? values.date_from.format("YYYY-MM-DD")
                : null,
            date_to: values.date_to
                ? values.date_to.format("YYYY-MM-DD")
                : null,
            month_from: values.month_from ?? null,
            month_to: values.month_to ?? null,
            year_from: values.year_from ?? null,
            year_to: values.year_to ?? null,
            bank_id: values.bank_id ?? null,
            saving_type_id: values.saving_type_id ?? null,
            user_id: values.user_id ?? null,
        });
        setState((prev) => ({ ...prev, currentPage: 1 }));
        setFilterOpen(false);
    }, [form]);

    const resetFilters = () => {
        form.resetFields();
        setFilters({
            date_from: null,
            date_to: null,
            month_from: null,
            month_to: null,
            year_from: null,
            year_to: null,
            bank_id: null,
            saving_type_id: null,
            user_id: null,
        });
        setState((prev) => ({ ...prev, currentPage: 1 }));
        setFilterOpen(false);
    };

    const matchesSearch = (item) => {
        if (!state.searchText) return true;
        const q = state.searchText;
        const memberName = (item.user?.name || "").toLowerCase();
        const bankName = (item.bank?.name || "").toLowerCase();
        const typeName = (item.saving_type?.name || "").toLowerCase();
        const monthStr = formatMonth(item.month).toLowerCase();
        const yearStr = String(item.year || "");
        const dateStr = formatSavingDate(item.date).toLowerCase();
        const amountStr = formatPrice(item.amount).toLowerCase();
        const descStr = (item.description || "").toLowerCase();
        const driveStr = (item.drive_link || "").toLowerCase();
        return (
            memberName.includes(q) ||
            bankName.includes(q) ||
            typeName.includes(q) ||
            monthStr.includes(q) ||
            yearStr.includes(q) ||
            dateStr.includes(q) ||
            amountStr.includes(q) ||
            descStr.includes(q) ||
            driveStr.includes(q)
        );
    };

    const matchesFilters = (item) => {
        if (filters.date_from || filters.date_to) {
            const itemDate = dayjs(item.date);
            if (!itemDate.isValid()) {
                return false;
            }
            if (
                filters.date_from &&
                itemDate.isBefore(dayjs(filters.date_from), "day")
            ) {
                return false;
            }
            if (
                filters.date_to &&
                itemDate.isAfter(dayjs(filters.date_to), "day")
            ) {
                return false;
            }
        }
        if (
            filters.month_from &&
            Number(item.month) < Number(filters.month_from)
        ) {
            return false;
        }
        if (filters.month_to && Number(item.month) > Number(filters.month_to)) {
            return false;
        }
        if (filters.year_from && Number(item.year) < Number(filters.year_from)) {
            return false;
        }
        if (filters.year_to && Number(item.year) > Number(filters.year_to)) {
            return false;
        }
        if (
            filters.bank_id &&
            Number(item.bank_id) !== Number(filters.bank_id)
        ) {
            return false;
        }
        if (
            filters.saving_type_id &&
            Number(item.saving_type_id) !== Number(filters.saving_type_id)
        ) {
            return false;
        }
        if (filters.user_id && Number(item.user_id) !== Number(filters.user_id)) {
            return false;
        }
        return true;
    };

    const filtered = (savings || []).filter(
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
            title: t("saving.colMember"),
            key: "user",
            width: 150,
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
            title: t("saving.colBank"),
            key: "bank",
            width: 130,
            render: (_, record) => record.bank?.name || "—",
            sorter: (a, b) =>
                (a.bank?.name || "").localeCompare(b.bank?.name || ""),
            sortOrder:
                state.sortedInfo?.columnKey === "bank"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("saving.colSavingType"),
            key: "saving_type",
            width: 130,
            render: (_, record) => record.saving_type?.name || "—",
            sorter: (a, b) =>
                (a.saving_type?.name || "").localeCompare(
                    b.saving_type?.name || "",
                ),
            sortOrder:
                state.sortedInfo?.columnKey === "saving_type"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("saving.colMonth"),
            dataIndex: "month",
            key: "month",
            width: 100,
            render: (month) => formatMonth(month),
            sorter: (a, b) => Number(a.month) - Number(b.month),
            sortOrder:
                state.sortedInfo?.columnKey === "month"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("saving.colYear"),
            dataIndex: "year",
            key: "year",
            width: 80,
            sorter: (a, b) => Number(a.year) - Number(b.year),
            sortOrder:
                state.sortedInfo?.columnKey === "year"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("saving.colDate"),
            dataIndex: "date",
            key: "date",
            width: 140,
            render: (date) => formatSavingDate(date),
            sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
            sortOrder:
                state.sortedInfo?.columnKey === "date"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("saving.colAmount"),
            dataIndex: "amount",
            key: "amount",
            width: 110,
            render: (amount) => formatPrice(amount),
            sorter: (a, b) => Number(a.amount) - Number(b.amount),
            sortOrder:
                state.sortedInfo?.columnKey === "amount"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("saving.colDescription"),
            dataIndex: "description",
            key: "description",
            width: 140,
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
            title: t("saving.colImage"),
            key: "image",
            width: 70,
            render: (_, record) =>
                record.image ? (
                    <Image
                        src={route(
                            "administrative.saving.image",
                            record.id,
                            true,
                        )}
                        alt="saving"
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
            width: 90,
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
                    {hasPermission("saving_list") && (
                        <View key={`view-${record.id}`} saving={record} />
                    )}
                    {hasPermission("saving_edit") && (
                        <Edit
                            key={record.id}
                            saving={record}
                            members={members}
                            banks={banks}
                            savingTypes={savingTypes}
                        />
                    )}
                    {hasPermission("saving_delete") && (
                        <Button
                            variant="outlined"
                            danger
                            onClick={() => showDeleteConfirm(record)}
                            icon={<DeleteOutlined />}
                            title={t("saving.deleteBtnTitle")}
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
            href: "/administrative/saving",
            title: (
                <>
                    <RiSafe2Line /> {t("breadcrumb.savingsList")}
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
                                placeholder={t("common.searchSaving")}
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
                                {hasPermission("saving_create") && (
                                    <Create
                                        members={members}
                                        banks={banks}
                                        savingTypes={savingTypes}
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
                        <Col span={12}>
                            <Form.Item
                                label={t("report.filterMonthFrom")}
                                name="month_from"
                            >
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
                            <Form.Item
                                label={t("report.filterMonthTo")}
                                name="month_to"
                            >
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
                            <Form.Item
                                label={t("report.filterYearFrom")}
                                name="year_from"
                            >
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
                                label={t("report.filterYearTo")}
                                name="year_to"
                            >
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
                        <Col span={24}>
                            <Form.Item
                                label={t("report.filterBank")}
                                name="bank_id"
                            >
                                <Select
                                    allowClear
                                    showSearch
                                    placeholder={t(
                                        "report.filterBankPlaceholder",
                                    )}
                                    options={bankOptions}
                                    optionFilterProp="label"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("report.filterSavingType")}
                                name="saving_type_id"
                            >
                                <Select
                                    allowClear
                                    showSearch
                                    placeholder={t(
                                        "report.filterSavingTypePlaceholder",
                                    )}
                                    options={savingTypeOptions}
                                    optionFilterProp="label"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("report.filterMember")}
                                name="user_id"
                            >
                                <Select
                                    allowClear
                                    showSearch
                                    placeholder={t(
                                        "report.filterMemberPlaceholder",
                                    )}
                                    options={memberOptions}
                                    optionFilterProp="label"
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
