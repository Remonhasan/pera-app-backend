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
import { RiBookReadLine } from "react-icons/ri";
import { route } from "ziggy-js";
import AppLayout from "../../../../components/layouts/AppLayout";
import { useAdminT } from "../../../../contexts/AdminI18nContext";
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
    total_records = 0,
    members = [],
    subjects = [],
    topics = [],
    jobTypes = [],
}) {
    const { t } = useAdminT();
    const title = t("pages.studyReport");
    const [filterOpen, setFilterOpen] = useState(false);
    const [form] = Form.useForm();
    const [selectedSubjectId, setSelectedSubjectId] = useState(filters?.subject_id ?? null);

    const memberOptions = useMemo(
        () =>
            (members || []).map((m) => ({
                value: m.id,
                label: m.phone ? `${m.name} (${m.phone})` : m.name,
            })),
        [members],
    );

    const subjectOptions = useMemo(
        () =>
            (subjects || []).map((subject) => ({
                value: subject.id,
                label: subject.name,
            })),
        [subjects],
    );

    const topicOptions = useMemo(() => {
        if (!selectedSubjectId) return [];
        return (topics || [])
            .filter((item) => item.subject_id === selectedSubjectId)
            .map((item) => ({
                value: item.id,
                label: item.topic,
            }));
    }, [topics, selectedSubjectId]);

    const jobTypeOptions = useMemo(
        () =>
            (jobTypes || []).map((type) => ({
                value: type.id,
                label: type.name,
            })),
        [jobTypes],
    );

    const openFilters = () => {
        const subjectId = filters?.subject_id ?? null;
        setSelectedSubjectId(subjectId);
        form.setFieldsValue({
            date_from: filters?.date_from ? dayjs(filters.date_from) : null,
            date_to: filters?.date_to ? dayjs(filters.date_to) : null,
            user_id: filters?.user_id ?? null,
            subject_id: subjectId,
            topic_id: filters?.topic_id ?? null,
            job_id: filters?.job_id ?? null,
        });
        setFilterOpen(true);
    };

    const applyFilters = useCallback(() => {
        const values = form.getFieldsValue();
        const q = {};
        if (values.date_from) q.date_from = values.date_from.format("YYYY-MM-DD");
        if (values.date_to) q.date_to = values.date_to.format("YYYY-MM-DD");
        if (values.user_id) q.user_id = values.user_id;
        if (values.subject_id) q.subject_id = values.subject_id;
        if (values.topic_id) q.topic_id = values.topic_id;
        if (values.job_id) q.job_id = values.job_id;

        router.get(route("administrative.report.study.index"), q, {
            preserveScroll: true,
            replace: true,
            onSuccess: () => setFilterOpen(false),
        });
    }, [form]);

    const resetFilters = () => {
        form.resetFields();
        setSelectedSubjectId(null);
        router.get(route("administrative.report.study.index"), {}, {
            preserveScroll: true,
            replace: true,
            onSuccess: () => setFilterOpen(false),
        });
    };

    const handleExportPdf = () => {
        const qs = buildExportQuery(filters);
        const url =
            route("administrative.report.study.export-pdf") + (qs ? `?${qs}` : "");
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
            title: t("report.colSubject"),
            dataIndex: "subject_name",
            key: "subject_name",
            width: 130,
        },
        {
            title: t("report.colTopic"),
            dataIndex: "topic_name",
            key: "topic_name",
            width: 130,
        },
        {
            title: t("report.colJobType"),
            dataIndex: "job_type_names",
            key: "job_type_names",
            width: 150,
        },
        {
            title: t("common.colDriveLink"),
            dataIndex: "drive_link",
            key: "drive_link",
            width: 90,
            render: (link) =>
                link ? (
                    <a href={link} target="_blank" rel="noopener noreferrer">
                        {t("common.colDriveLink")}
                    </a>
                ) : (
                    "—"
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
            title: (
                <>
                    <RiBookReadLine /> {title}
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
                                        <Text strong>{t("report.totalRecords")}</Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={5}>
                                        <Text strong>{total_records}</Text>
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
                            <Form.Item label={t("report.filterSubject")} name="subject_id">
                                <Select
                                    allowClear
                                    showSearch
                                    placeholder={t("report.filterSubjectPlaceholder")}
                                    options={subjectOptions}
                                    optionFilterProp="label"
                                    onChange={(v) => {
                                        setSelectedSubjectId(v ?? null);
                                        form.setFieldValue("topic_id", null);
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label={t("report.filterTopic")} name="topic_id">
                                <Select
                                    allowClear
                                    showSearch
                                    disabled={!selectedSubjectId}
                                    placeholder={t("report.filterTopicPlaceholder")}
                                    options={topicOptions}
                                    optionFilterProp="label"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label={t("report.filterJobType")} name="job_id">
                                <Select
                                    allowClear
                                    showSearch
                                    placeholder={t("report.filterJobTypePlaceholder")}
                                    options={jobTypeOptions}
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
