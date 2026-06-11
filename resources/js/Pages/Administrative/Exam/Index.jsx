import {
    FilePdfOutlined,
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
    Modal,
    Row,
    Select,
    Space,
    Table,
    Tag,
} from "antd";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import AppLayout from "../../../components/layouts/AppLayout";
import { useAdminT } from "../../../contexts/AdminI18nContext";
import { ADMIN_NAVY } from "../../../theme/adminColors";
import Create from "./Create";
import Edit from "./Edit";
import View from "./View";
import { RiAwardLine } from "react-icons/ri";

const STATUS_COLORS = {
    pending: "orange",
    completed: "blue",
    passed: "green",
};

function formatDate(dateString) {
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

function filterDateValue(record) {
    return record.exam_date || record.expected_exam_date || null;
}

function remainingDays(dateString) {
    if (!dateString) return null;
    const target = dayjs(dateString).startOf("day");
    if (!target.isValid()) return null;
    return target.diff(dayjs().startOf("day"), "day");
}

function formatRemainingDays(days, t) {
    if (days === null) return "—";
    if (days === 0) return t("exam.remainingDaysToday");
    if (days < 0) {
        return t("exam.remainingDaysOverdue", { n: Math.abs(days) });
    }
    return t("exam.remainingDays", { n: days });
}

function remainingDaysColor(days) {
    if (days === null) return undefined;
    if (days < 0) return "red";
    if (days === 0) return "orange";
    if (days <= 7) return "gold";
    return "green";
}

function buildExportQuery(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
            params.set(key, String(value));
        }
    });
    return params.toString();
}

export default function Index() {
    const { t } = useAdminT();
    const title = t("pages.examList");
    const { exams, jobTypes, auth } = usePage().props;
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
        job_type_id: null,
        exam_status: null,
    });
    const [form] = Form.useForm();

    const jobTypeOptions = useMemo(
        () =>
            (jobTypes || []).map((type) => ({
                value: type.id,
                label: type.name,
            })),
        [jobTypes],
    );

    const examStatusOptions = useMemo(
        () => [
            { value: "pending", label: t("exam.statusPending") },
            { value: "completed", label: t("exam.statusCompleted") },
            { value: "passed", label: t("exam.statusPassed") },
        ],
        [t],
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
            title: t("exam.deleteTitle"),
            icon: <ExclamationCircleFilled />,
            content: t("exam.deleteContent"),
            okText: t("common.yes"),
            okType: "danger",
            cancelText: t("common.no"),
            onOk() {
                destroy(route("administrative.exam.destroy", record.id));
            },
        });
    };

    const statusLabel = (status) => {
        if (status === "completed") return t("exam.statusCompleted");
        if (status === "passed") return t("exam.statusPassed");
        return t("exam.statusPending");
    };

    const openFilters = () => {
        form.setFieldsValue({
            date_from: filters.date_from ? dayjs(filters.date_from) : null,
            date_to: filters.date_to ? dayjs(filters.date_to) : null,
            job_type_id: filters.job_type_id ?? null,
            exam_status: filters.exam_status ?? null,
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
            job_type_id: values.job_type_id ?? null,
            exam_status: values.exam_status ?? null,
        });
        setState((prev) => ({ ...prev, currentPage: 1 }));
        setFilterOpen(false);
    }, [form]);

    const resetFilters = () => {
        form.resetFields();
        setFilters({
            date_from: null,
            date_to: null,
            job_type_id: null,
            exam_status: null,
        });
        setState((prev) => ({ ...prev, currentPage: 1 }));
        setFilterOpen(false);
    };

    const handleExportPdf = () => {
        const qs = buildExportQuery(filters);
        const url =
            route("administrative.exam.export-pdf") + (qs ? `?${qs}` : "");
        window.open(url, "_blank");
    };

    const matchesSearch = (item) => {
        if (!state.searchText) return true;
        const q = state.searchText;
        const name = (item.name || "").toLowerCase();
        const jobName = (item.job_type?.name || "").toLowerCase();
        const examStatus = statusLabel(item.exam_status).toLowerCase();
        return (
            name.includes(q) ||
            jobName.includes(q) ||
            examStatus.includes(q)
        );
    };

    const matchesFilters = (item) => {
        if (filters.job_type_id && Number(item.job_type_id) !== Number(filters.job_type_id)) {
            return false;
        }
        if (filters.exam_status && item.exam_status !== filters.exam_status) {
            return false;
        }

        const dateValue = filterDateValue(item);
        if (filters.date_from && dateValue) {
            if (dayjs(dateValue).isBefore(dayjs(filters.date_from), "day")) {
                return false;
            }
        }
        if (filters.date_to && dateValue) {
            if (dayjs(dateValue).isAfter(dayjs(filters.date_to), "day")) {
                return false;
            }
        }
        if ((filters.date_from || filters.date_to) && !dateValue) {
            return false;
        }

        return true;
    };

    const filtered = (exams || []).filter(
        (item) => matchesSearch(item) && matchesFilters(item),
    );
    const paginated = filtered.slice(
        (state.currentPage - 1) * state.pageSize,
        state.currentPage * state.pageSize,
    );

    const columns = [
        {
            title: t("exam.colName"),
            dataIndex: "name",
            key: "name",
            width: 180,
            ellipsis: true,
        },
        {
            title: t("exam.colJobType"),
            key: "job_type",
            width: 140,
            render: (_, record) => record.job_type?.name || "—",
        },
        {
            title: t("exam.colExamDate"),
            dataIndex: "exam_date",
            key: "exam_date",
            width: 140,
            render: (date) => formatDate(date),
        },
        {
            title: t("exam.colExpectedExamDate"),
            dataIndex: "expected_exam_date",
            key: "expected_exam_date",
            width: 160,
            render: (date) => formatDate(date),
        },
        {
            title: t("exam.colRemainingDays"),
            key: "remaining_days",
            width: 140,
            sorter: (a, b) =>
                (remainingDays(a.exam_date) ?? 9999) -
                (remainingDays(b.exam_date) ?? 9999),
            sortOrder:
                state.sortedInfo?.columnKey === "remaining_days"
                    ? state.sortedInfo.order
                    : null,
            render: (_, record) => {
                const days = remainingDays(record.exam_date);
                if (days === null) return "—";
                return (
                    <Tag color={remainingDaysColor(days)}>
                        {formatRemainingDays(days, t)}
                    </Tag>
                );
            },
        },
        {
            title: t("exam.colExpectedRemainingDays"),
            key: "expected_remaining_days",
            width: 180,
            sorter: (a, b) =>
                (remainingDays(a.expected_exam_date) ?? 9999) -
                (remainingDays(b.expected_exam_date) ?? 9999),
            sortOrder:
                state.sortedInfo?.columnKey === "expected_remaining_days"
                    ? state.sortedInfo.order
                    : null,
            render: (_, record) => {
                const days = remainingDays(record.expected_exam_date);
                if (days === null) return "—";
                return (
                    <Tag color={remainingDaysColor(days)}>
                        {formatRemainingDays(days, t)}
                    </Tag>
                );
            },
        },
        {
            title: t("exam.colExamStatus"),
            dataIndex: "exam_status",
            key: "exam_status",
            width: 120,
            render: (status) => (
                <Tag color={STATUS_COLORS[status] || "default"}>
                    {statusLabel(status)}
                </Tag>
            ),
        },
        {
            title: t("common.status"),
            dataIndex: "status",
            key: "status",
            width: 100,
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
                    {hasPermission("exam_list") && (
                        <View key={`view-${record.id}`} exam={record} />
                    )}
                    {hasPermission("exam_edit") && (
                        <Edit
                            key={record.id}
                            exam={record}
                            jobTypes={jobTypes}
                        />
                    )}
                    {hasPermission("exam_delete") && (
                        <Button
                            variant="outlined"
                            danger
                            onClick={() => showDeleteConfirm(record)}
                            icon={<DeleteOutlined />}
                            title={t("exam.deleteBtnTitle")}
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
            href: "/administrative/exam",
            title: (
                <>
                    <RiAwardLine /> {t("breadcrumb.examsList")}
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
                                placeholder={t("common.searchExam")}
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
                                    icon={<FilePdfOutlined />}
                                    onClick={handleExportPdf}
                                    title={t("report.exportPdf")}
                                    size="large"
                                />
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
                                {hasPermission("exam_create") && (
                                    <Create jobTypes={jobTypes} />
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
                                label={t("report.dateFrom")}
                                name="date_from"
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    format="YYYY-MM-DD"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={t("report.dateTo")} name="date_to">
                                <DatePicker
                                    style={{ width: "100%" }}
                                    format="YYYY-MM-DD"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={t("exam.colJobType")}
                                name="job_type_id"
                            >
                                <Select
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    options={jobTypeOptions}
                                    placeholder={t("exam.jobTypePlaceholder")}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={t("exam.colExamStatus")}
                                name="exam_status"
                            >
                                <Select
                                    allowClear
                                    options={examStatusOptions}
                                    placeholder={t("exam.examStatusPlaceholder")}
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
