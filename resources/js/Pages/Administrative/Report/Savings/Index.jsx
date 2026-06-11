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
    Typography,
} from "antd";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import { RiFileChartLine } from "react-icons/ri";
import { route } from "ziggy-js";
import AppLayout from "../../../../components/layouts/AppLayout";
import { useAdminT } from "../../../../contexts/AdminI18nContext";
import { formatAdminDecimal } from "../../../../helpers/adminNumberFormat";
import {
    formatAdminMonth,
    formatAdminMonthYearPeriod,
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
    rows = [],
    total_amount = 0,
    members = [],
    banks = [],
    savingTypes = [],
}) {
    const { t, locale } = useAdminT();
    const title = t("pages.savingsReport");
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

    const monthOptions = useMemo(
        () => getAdminMonthOptions(locale),
        [locale],
    );

    const monthYearPeriodLabel = useMemo(
        () => formatAdminMonthYearPeriod(filters, locale),
        [filters, locale],
    );

    const openFilters = () => {
        form.setFieldsValue({
            date_from: filters?.date_from ? dayjs(filters.date_from) : null,
            date_to: filters?.date_to ? dayjs(filters.date_to) : null,
            month_from: filters?.month_from ?? null,
            month_to: filters?.month_to ?? null,
            year_from: filters?.year_from ?? null,
            year_to: filters?.year_to ?? null,
            saving_type_id: filters?.saving_type_id ?? null,
            bank_id: filters?.bank_id ?? null,
            user_id: filters?.user_id ?? null,
        });
        setFilterOpen(true);
    };

    const applyFilters = useCallback(() => {
        const values = form.getFieldsValue();
        const q = {};
        if (values.date_from) q.date_from = values.date_from.format("YYYY-MM-DD");
        if (values.date_to) q.date_to = values.date_to.format("YYYY-MM-DD");
        if (values.month_from) q.month_from = values.month_from;
        if (values.month_to) q.month_to = values.month_to;
        if (values.year_from) q.year_from = values.year_from;
        if (values.year_to) q.year_to = values.year_to;
        if (values.saving_type_id) q.saving_type_id = values.saving_type_id;
        if (values.bank_id) q.bank_id = values.bank_id;
        if (values.user_id) q.user_id = values.user_id;

        router.get(route("administrative.report.savings.index"), q, {
            preserveScroll: true,
            replace: true,
            onSuccess: () => setFilterOpen(false),
        });
    }, [form]);

    const resetFilters = () => {
        form.resetFields();
        router.get(route("administrative.report.savings.index"), {}, {
            preserveScroll: true,
            replace: true,
            onSuccess: () => setFilterOpen(false),
        });
    };

    const handleExportPdf = () => {
        const qs = buildExportQuery(filters);
        const url =
            route("administrative.report.savings.export-pdf") + (qs ? `?${qs}` : "");
        window.open(url, "_blank");
    };

    const columns = [
        {
            title: t("report.colDate"),
            dataIndex: "date",
            key: "date",
            width: 110,
        },
        {
            title: t("report.colMember"),
            dataIndex: "member_name",
            key: "member_name",
            width: 130,
        },
        {
            title: t("report.colBank"),
            dataIndex: "bank_name",
            key: "bank_name",
            width: 120,
        },
        {
            title: t("report.colSavingType"),
            dataIndex: "saving_type_name",
            key: "saving_type_name",
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
            width: 80,
        },
        {
            title: t("report.colAmount"),
            dataIndex: "amount",
            key: "amount",
            width: 120,
            align: "right",
            render: (val) => formatAdminDecimal(val, locale, 2),
        },
        {
            title: t("report.colDescription"),
            dataIndex: "description",
            key: "description",
            ellipsis: true,
            render: (val) => val || "—",
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
                    <RiFileChartLine /> {title}
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
                            {monthYearPeriodLabel && (
                                <Text
                                    type="secondary"
                                    style={{ display: "block", marginTop: 4 }}
                                >
                                    {t("report.period")}: {monthYearPeriodLabel}
                                </Text>
                            )}
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
                                    <Table.Summary.Cell index={0} colSpan={6}>
                                        <Text strong>{t("report.total")}</Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={6} align="right">
                                        <Text strong>
                                            {formatAdminDecimal(total_amount, locale, 2)}
                                        </Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={7} />
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
                        <Col span={24}>
                            <Form.Item label={t("report.filterSavingType")} name="saving_type_id">
                                <Select
                                    allowClear
                                    showSearch
                                    placeholder={t("report.filterSavingTypePlaceholder")}
                                    options={savingTypeOptions}
                                    optionFilterProp="label"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label={t("report.filterBank")} name="bank_id">
                                <Select
                                    allowClear
                                    showSearch
                                    placeholder={t("report.filterBankPlaceholder")}
                                    options={bankOptions}
                                    optionFilterProp="label"
                                />
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
                    </Row>
                </Form>
            </Modal>
        </>
    );
}
