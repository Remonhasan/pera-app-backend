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
import { RiFocus3Line } from "react-icons/ri";

const STATUS_COLORS = {
    pending: "orange",
    doing: "blue",
    completed: "green",
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

function buildExportQuery(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
            params.set(key, String(value));
        }
    });
    return params.toString();
}

function matchesDateFilter(item, dateFrom, dateTo) {
    if (!dateFrom && !dateTo) return true;

    const dates = [item.date_from, item.date_to, item.extended_date].filter(
        Boolean,
    );
    if (!dates.length) return false;

    return dates.some((date) => {
        if (dateFrom && dayjs(date).isBefore(dayjs(dateFrom), "day")) {
            return false;
        }
        if (dateTo && dayjs(date).isAfter(dayjs(dateTo), "day")) {
            return false;
        }
        return true;
    });
}

export default function Index() {
    const { t } = useAdminT();
    const title = t("pages.studyGoalList");
    const { studyGoals, members, subjects, topics, jobTypes, auth } =
        usePage().props;
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
        user_id: null,
        subject_id: null,
        topic_id: null,
        job_id: null,
        study_goal_status: null,
    });
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);
    const [form] = Form.useForm();

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

    const goalStatusOptions = useMemo(
        () => [
            { value: "pending", label: t("studyGoal.statusPending") },
            { value: "doing", label: t("studyGoal.statusDoing") },
            { value: "completed", label: t("studyGoal.statusCompleted") },
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
            title: t("studyGoal.deleteTitle"),
            icon: <ExclamationCircleFilled />,
            content: t("studyGoal.deleteContent"),
            okText: t("common.yes"),
            okType: "danger",
            cancelText: t("common.no"),
            onOk() {
                destroy(route("administrative.study-goal.destroy", record.id));
            },
        });
    };

    const statusLabel = (status) => {
        if (status === "doing") return t("studyGoal.statusDoing");
        if (status === "completed") return t("studyGoal.statusCompleted");
        return t("studyGoal.statusPending");
    };

    const openFilters = () => {
        const subjectId = filters.subject_id ?? null;
        setSelectedSubjectId(subjectId);
        form.setFieldsValue({
            date_from: filters.date_from ? dayjs(filters.date_from) : null,
            date_to: filters.date_to ? dayjs(filters.date_to) : null,
            user_id: filters.user_id ?? null,
            subject_id: subjectId,
            topic_id: filters.topic_id ?? null,
            job_id: filters.job_id ?? null,
            study_goal_status: filters.study_goal_status ?? null,
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
            user_id: values.user_id ?? null,
            subject_id: values.subject_id ?? null,
            topic_id: values.topic_id ?? null,
            job_id: values.job_id ?? null,
            study_goal_status: values.study_goal_status ?? null,
        });
        setState((prev) => ({ ...prev, currentPage: 1 }));
        setFilterOpen(false);
    }, [form]);

    const resetFilters = () => {
        form.resetFields();
        setSelectedSubjectId(null);
        setFilters({
            date_from: null,
            date_to: null,
            user_id: null,
            subject_id: null,
            topic_id: null,
            job_id: null,
            study_goal_status: null,
        });
        setState((prev) => ({ ...prev, currentPage: 1 }));
        setFilterOpen(false);
    };

    const handleExportPdf = () => {
        const qs = buildExportQuery(filters);
        const url =
            route("administrative.study-goal.export-pdf") +
            (qs ? `?${qs}` : "");
        window.open(url, "_blank");
    };

    const matchesSearch = (item) => {
        if (!state.searchText) return true;
        const q = state.searchText;
        const memberName = (item.user?.name || "").toLowerCase();
        const subjectName = (item.subject?.name || "").toLowerCase();
        const topicName = (item.topic?.topic || "").toLowerCase();
        const jobName = (item.job_type?.name || "").toLowerCase();
        const goalStatus = statusLabel(item.study_goal_status).toLowerCase();
        return (
            memberName.includes(q) ||
            subjectName.includes(q) ||
            topicName.includes(q) ||
            jobName.includes(q) ||
            goalStatus.includes(q)
        );
    };

    const matchesFilters = (item) => {
        if (filters.user_id && Number(item.user_id) !== Number(filters.user_id)) {
            return false;
        }
        if (
            filters.subject_id &&
            Number(item.subject_id) !== Number(filters.subject_id)
        ) {
            return false;
        }
        if (filters.topic_id && Number(item.topic_id) !== Number(filters.topic_id)) {
            return false;
        }
        if (filters.job_id && Number(item.job_id) !== Number(filters.job_id)) {
            return false;
        }
        if (
            filters.study_goal_status &&
            item.study_goal_status !== filters.study_goal_status
        ) {
            return false;
        }
        if (!matchesDateFilter(item, filters.date_from, filters.date_to)) {
            return false;
        }
        return true;
    };

    const filtered = (studyGoals || []).filter(
        (item) => matchesSearch(item) && matchesFilters(item),
    );
    const paginated = filtered.slice(
        (state.currentPage - 1) * state.pageSize,
        state.currentPage * state.pageSize,
    );

    const columns = [
        {
            title: t("studyGoal.colMember"),
            key: "user",
            width: 130,
            ellipsis: true,
            render: (_, record) => record.user?.name || "—",
        },
        {
            title: t("studyGoal.colSubject"),
            key: "subject",
            width: 130,
            render: (_, record) => record.subject?.name || "—",
        },
        {
            title: t("studyGoal.colTopic"),
            key: "topic",
            width: 130,
            render: (_, record) => record.topic?.topic || "—",
        },
        {
            title: t("studyGoal.colJobType"),
            key: "job_type",
            width: 120,
            render: (_, record) => record.job_type?.name || "—",
        },
        {
            title: t("studyGoal.colDateFrom"),
            key: "date_from",
            width: 130,
            render: (_, record) => formatDate(record.date_from),
        },
        {
            title: t("studyGoal.colDateTo"),
            key: "date_to",
            width: 130,
            render: (_, record) => formatDate(record.date_to),
        },
        {
            title: t("studyGoal.colExtendedDate"),
            key: "extended_date",
            width: 130,
            render: (_, record) => formatDate(record.extended_date),
        },
        {
            title: t("studyGoal.colStudyGoalStatus"),
            dataIndex: "study_goal_status",
            key: "study_goal_status",
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
                    {hasPermission("study_goal_list") && (
                        <View key={`view-${record.id}`} studyGoal={record} />
                    )}
                    {hasPermission("study_goal_edit") && (
                        <Edit
                            key={record.id}
                            studyGoal={record}
                            members={members}
                            subjects={subjects}
                            topics={topics}
                            jobTypes={jobTypes}
                        />
                    )}
                    {hasPermission("study_goal_delete") && (
                        <Button
                            variant="outlined"
                            danger
                            onClick={() => showDeleteConfirm(record)}
                            icon={<DeleteOutlined />}
                            title={t("studyGoal.deleteBtnTitle")}
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
            href: "/administrative/study-goal",
            title: (
                <>
                    <RiFocus3Line /> {t("breadcrumb.studyGoalsList")}
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
                                placeholder={t("common.searchStudyGoal")}
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
                                {hasPermission("study_goal_create") && (
                                    <Create
                                        members={members}
                                        subjects={subjects}
                                        topics={topics}
                                        jobTypes={jobTypes}
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
                        <Col span={24}>
                            <Form.Item
                                label={t("report.filterMember")}
                                name="user_id"
                            >
                                <Select
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder={t(
                                        "report.filterMemberPlaceholder",
                                    )}
                                    options={memberOptions}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("report.filterSubject")}
                                name="subject_id"
                            >
                                <Select
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder={t(
                                        "report.filterSubjectPlaceholder",
                                    )}
                                    options={subjectOptions}
                                    onChange={(v) => {
                                        setSelectedSubjectId(v ?? null);
                                        form.setFieldValue("topic_id", null);
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("report.filterTopic")}
                                name="topic_id"
                            >
                                <Select
                                    allowClear
                                    showSearch
                                    disabled={!selectedSubjectId}
                                    optionFilterProp="label"
                                    placeholder={t(
                                        "report.filterTopicPlaceholder",
                                    )}
                                    options={topicOptions}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("report.filterJobType")}
                                name="job_id"
                            >
                                <Select
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder={t(
                                        "report.filterJobTypePlaceholder",
                                    )}
                                    options={jobTypeOptions}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("report.filterGoalStatus")}
                                name="study_goal_status"
                            >
                                <Select
                                    allowClear
                                    placeholder={t(
                                        "report.filterGoalStatusPlaceholder",
                                    )}
                                    options={goalStatusOptions}
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
