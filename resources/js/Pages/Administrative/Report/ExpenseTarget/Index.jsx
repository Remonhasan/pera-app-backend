import {
    FilePdfOutlined,
    FilterOutlined,
    HomeOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import { Head, router } from "@inertiajs/react";
import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    InputNumber,
    Modal,
    Row,
    Select,
    Space,
    Table,
    Tag,
    Typography,
} from "antd";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import { RiFocus3Line } from "react-icons/ri";
import { route } from "ziggy-js";
import AppLayout from "../../../../components/layouts/AppLayout";
import { useAdminT } from "../../../../contexts/AdminI18nContext";
import { formatAdminDecimal } from "../../../../helpers/adminNumberFormat";
import {
    formatAdminMonth,
    getAdminMonthOptions,
} from "../../../../helpers/adminMonthFormat";
import { ADMIN_NAVY } from "../../../../theme/adminColors";

const { Text, Title } = Typography;

function buildExportQuery(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
            params.set(key, String(value));
        }
    });
    return params.toString();
}

export default function Index({
    filters = {},
    summary = {},
    rows = [],
    members = [],
    expenseTargets = [],
    expenseTypes = [],
}) {
    const { t, locale } = useAdminT();
    const title = t("pages.expenseTargetReport");
    const [filterOpen, setFilterOpen] = useState(false);
    const [form] = Form.useForm();

    const memberOptions = useMemo(
        () =>
            (members || []).map((m) => ({
                value: m.id,
                label: m.phone ? `${m.name} (${m.phone})` : m.name,
            })),
        [members],
    );

    const expenseTargetOptions = useMemo(
        () =>
            (expenseTargets || []).map((target) => ({
                value: target.id,
                label: target.label,
            })),
        [expenseTargets],
    );

    const expenseTypeOptions = useMemo(
        () =>
            (expenseTypes || []).map((type) => ({
                value: type.id,
                label: type.name,
            })),
        [expenseTypes],
    );

    const monthOptions = useMemo(
        () => getAdminMonthOptions(locale),
        [locale],
    );

    const openFilters = () => {
        form.setFieldsValue({
            date_from: filters?.date_from ? dayjs(filters.date_from) : null,
            date_to: filters?.date_to ? dayjs(filters.date_to) : null,
            user_id: filters?.user_id ?? null,
            expense_target_id: filters?.expense_target_id ?? null,
            expense_id: filters?.expense_id ?? null,
            month: filters?.month ?? null,
            year: filters?.year ?? null,
            month_from: filters?.month_from ?? null,
            month_to: filters?.month_to ?? null,
            year_from: filters?.year_from ?? null,
            year_to: filters?.year_to ?? null,
        });
        setFilterOpen(true);
    };

    const applyFilters = useCallback(() => {
        const values = form.getFieldsValue();
        const q = {};
        if (values.date_from) q.date_from = values.date_from.format("YYYY-MM-DD");
        if (values.date_to) q.date_to = values.date_to.format("YYYY-MM-DD");
        if (values.user_id) q.user_id = values.user_id;
        if (values.expense_target_id) q.expense_target_id = values.expense_target_id;
        if (values.expense_id) q.expense_id = values.expense_id;
        if (values.month) q.month = values.month;
        if (values.year) q.year = values.year;
        if (values.month_from) q.month_from = values.month_from;
        if (values.month_to) q.month_to = values.month_to;
        if (values.year_from) q.year_from = values.year_from;
        if (values.year_to) q.year_to = values.year_to;

        router.get(route("administrative.report.expense-target.index"), q, {
            preserveScroll: true,
            replace: true,
            onSuccess: () => setFilterOpen(false),
        });
    }, [form]);

    const resetFilters = () => {
        form.resetFields();
        router.get(route("administrative.report.expense-target.index"), {}, {
            preserveScroll: true,
            replace: true,
            onSuccess: () => setFilterOpen(false),
        });
    };

    const handleExportPdf = () => {
        const qs = buildExportQuery(filters);
        const url =
            route("administrative.report.expense-target.export-pdf") +
            (qs ? `?${qs}` : "");
        window.open(url, "_blank");
    };

    const columns = [
        {
            title: t("report.colMember"),
            dataIndex: "member_name",
            key: "member_name",
            width: 130,
        },
        {
            title: t("expenseTargetReport.colBudgetType"),
            dataIndex: "budget_type_name",
            key: "budget_type_name",
            width: 130,
        },
        {
            title: t("report.colMonth"),
            dataIndex: "month",
            key: "month",
            width: 110,
            render: (month) => formatAdminMonth(month, locale),
        },
        {
            title: t("report.colYear"),
            dataIndex: "year",
            key: "year",
            width: 70,
        },
        {
            title: t("expenseTargetReport.colAmountPerDay"),
            dataIndex: "amount_per_day",
            key: "amount_per_day",
            width: 120,
            align: "right",
            render: (val) => formatAdminDecimal(val, locale, 2),
        },
        {
            title: t("expenseTargetReport.colTargetBudget"),
            dataIndex: "budget_amount",
            key: "budget_amount",
            width: 150,
            align: "right",
            render: (val) => formatAdminDecimal(val, locale, 2),
        },
        {
            title: t("expenseTargetReport.colTotalExpense"),
            dataIndex: "total_expense",
            key: "total_expense",
            width: 120,
            align: "right",
            render: (val) => formatAdminDecimal(val, locale, 2),
        },
        {
            title: t("expenseTargetReport.colMissionStatus"),
            dataIndex: "mission_completed",
            key: "mission_completed",
            width: 130,
            render: (completed) =>
                completed ? (
                    <Tag color="green">{t("expenseTargetReport.missionCompleted")}</Tag>
                ) : (
                    <Tag color="orange">{t("expenseTargetReport.missionInProgress")}</Tag>
                ),
        },
        {
            title: t("expenseTargetReport.colExtraCost"),
            dataIndex: "extra_cost",
            key: "extra_cost",
            width: 110,
            align: "right",
            render: (val, record) =>
                record.extra_cost > 0
                    ? formatAdminDecimal(val, locale, 2)
                    : "—",
        },
        {
            title: t("expenseTargetReport.colRemainingPerMonth"),
            dataIndex: "remaining_to_spend",
            key: "remaining_to_spend",
            width: 130,
            align: "right",
            render: (val, record) =>
                record.remaining_to_spend > 0
                    ? formatAdminDecimal(val, locale, 2)
                    : "—",
        },
        {
            title: t("expenseTargetReport.colRemainingPerDay"),
            dataIndex: "remaining_per_day",
            key: "remaining_per_day",
            width: 130,
            align: "right",
            render: (val, record) =>
                (record.extra_cost ?? 0) > 0
                    ? "—"
                    : formatAdminDecimal(val ?? 0, locale, 2),
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
            title: (
                <>
                    <RiFocus3Line /> {title}
                </>
            ),
        },
    ];

    return (
        <>
            <AppLayout title={title} breadcrumb={breadcrumbItems}>
                <Head title={title} />
                <Card>
                    <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                        <Col>
                            <Title level={4} style={{ margin: 0 }}>
                                {title}
                            </Title>
                        </Col>
                        <Col>
                            <Space>
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
                            </Space>
                        </Col>
                    </Row>

                    <Table
                        dataSource={rows}
                        columns={columns}
                        rowKey="id"
                        scroll={{ x: "max-content" }}
                        pagination={{ pageSize: 20, showSizeChanger: true }}
                        summary={() => (
                            <Table.Summary fixed>
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0} colSpan={5}>
                                        <Text strong>{t("report.total")}</Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={5} align="right">
                                        <Text strong>
                                            {formatAdminDecimal(
                                                summary?.total_budget ?? 0,
                                                locale,
                                                2,
                                            )}
                                        </Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={6} align="right">
                                        <Text strong>
                                            {formatAdminDecimal(
                                                summary?.total_expense ?? 0,
                                                locale,
                                                2,
                                            )}
                                        </Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={7} />
                                    <Table.Summary.Cell index={8} align="right">
                                        <Text strong>
                                            {formatAdminDecimal(
                                                summary?.total_extra_cost ?? 0,
                                                locale,
                                                2,
                                            )}
                                        </Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={9} align="right">
                                        <Text strong>
                                            {formatAdminDecimal(
                                                summary?.total_remaining_to_spend ?? 0,
                                                locale,
                                                2,
                                            )}
                                        </Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={10} align="right">
                                        <Text strong>
                                            {formatAdminDecimal(
                                                summary?.total_remaining_per_day ?? 0,
                                                locale,
                                                2,
                                            )}
                                        </Text>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            </Table.Summary>
                        )}
                    />
                </Card>
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
                        style={{ backgroundColor: ADMIN_NAVY, borderColor: ADMIN_NAVY }}
                    >
                        {t("common.apply")}
                    </Button>,
                ]}
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label={t("dashboard.dateFrom")} name="date_from">
                                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={t("dashboard.dateTo")} name="date_to">
                                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label={t("report.filterMember")} name="user_id">
                                <Select
                                    allowClear
                                    showSearch
                                    placeholder={t("report.filterMemberPlaceholder")}
                                    options={memberOptions}
                                    optionFilterProp="label"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("expenseTargetReport.filterExpenseTarget")}
                                name="expense_target_id"
                            >
                                <Select
                                    allowClear
                                    showSearch
                                    placeholder={t(
                                        "expenseTargetReport.filterExpenseTargetPlaceholder",
                                    )}
                                    options={expenseTargetOptions}
                                    optionFilterProp="label"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("expenseTargetReport.filterExpense")}
                                name="expense_id"
                            >
                                <Select
                                    allowClear
                                    showSearch
                                    placeholder={t(
                                        "expenseTargetReport.filterExpensePlaceholder",
                                    )}
                                    options={expenseTypeOptions}
                                    optionFilterProp="label"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={t("report.colMonth")} name="month">
                                <Select
                                    allowClear
                                    options={monthOptions}
                                    placeholder={t("report.filterMonthPlaceholder")}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={t("report.colYear")} name="year">
                                <InputNumber
                                    style={{ width: "100%" }}
                                    min={1900}
                                    max={2100}
                                    placeholder={t("report.filterYearPlaceholder")}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={t("report.filterMonthFrom")} name="month_from">
                                <Select
                                    allowClear
                                    options={monthOptions}
                                    placeholder={t("report.filterMonthPlaceholder")}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={t("report.filterMonthTo")} name="month_to">
                                <Select
                                    allowClear
                                    options={monthOptions}
                                    placeholder={t("report.filterMonthPlaceholder")}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={t("report.filterYearFrom")} name="year_from">
                                <InputNumber
                                    style={{ width: "100%" }}
                                    min={1900}
                                    max={2100}
                                    placeholder={t("report.filterYearPlaceholder")}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={t("report.filterYearTo")} name="year_to">
                                <InputNumber
                                    style={{ width: "100%" }}
                                    min={1900}
                                    max={2100}
                                    placeholder={t("report.filterYearPlaceholder")}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
}
