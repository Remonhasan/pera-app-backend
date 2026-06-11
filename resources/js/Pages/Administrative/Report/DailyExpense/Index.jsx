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
    expenseTypes = [],
}) {
    const { t, locale } = useAdminT();
    const title = t("pages.dailyExpenseReport");
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

    const expenseTypeOptions = useMemo(
        () =>
            (expenseTypes || []).map((type) => ({
                value: type.id,
                label: type.name,
            })),
        [expenseTypes],
    );

    const openFilters = () => {
        form.setFieldsValue({
            date_from: filters?.date_from ? dayjs(filters.date_from) : null,
            date_to: filters?.date_to ? dayjs(filters.date_to) : null,
            expense_type_id: filters?.expense_type_id ?? null,
            user_id: filters?.user_id ?? null,
        });
        setFilterOpen(true);
    };

    const applyFilters = useCallback(() => {
        const values = form.getFieldsValue();
        const q = {};
        if (values.date_from) q.date_from = values.date_from.format("YYYY-MM-DD");
        if (values.date_to) q.date_to = values.date_to.format("YYYY-MM-DD");
        if (values.expense_type_id) q.expense_type_id = values.expense_type_id;
        if (values.user_id) q.user_id = values.user_id;

        router.get(route("administrative.report.daily-expense.index"), q, {
            preserveScroll: true,
            replace: true,
            onSuccess: () => setFilterOpen(false),
        });
    }, [form]);

    const resetFilters = () => {
        form.resetFields();
        router.get(route("administrative.report.daily-expense.index"), {}, {
            preserveScroll: true,
            replace: true,
            onSuccess: () => setFilterOpen(false),
        });
    };

    const handleExportPdf = () => {
        const qs = buildExportQuery(filters);
        const url =
            route("administrative.report.daily-expense.export-pdf") +
            (qs ? `?${qs}` : "");
        window.open(url, "_blank");
    };

    const columns = [
        {
            title: t("report.colDate"),
            dataIndex: "date",
            key: "date",
            width: 120,
        },
        {
            title: t("report.colMember"),
            dataIndex: "member_name",
            key: "member_name",
            width: 140,
        },
        {
            title: t("report.colExpenseType"),
            dataIndex: "expense_type_name",
            key: "expense_type_name",
            width: 140,
        },
        {
            title: t("report.colName"),
            dataIndex: "name",
            key: "name",
            width: 160,
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
                                    <Table.Summary.Cell index={0} colSpan={4}>
                                        <Text strong>{t("report.total")}</Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={4} align="right">
                                        <Text strong>
                                            {formatAdminDecimal(total_amount, locale, 2)}
                                        </Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={5} />
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
                            <Form.Item label={t("report.filterExpenseType")} name="expense_type_id">
                                <Select
                                    allowClear
                                    showSearch
                                    placeholder={t("report.filterExpenseTypePlaceholder")}
                                    options={expenseTypeOptions}
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
