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
    Input,
    Modal,
    Row,
    Select,
    Space,
    Table,
    Tag,
} from "antd";
import { useCallback, useMemo, useState } from "react";
import AppLayout from "../../../components/layouts/AppLayout";
import { useAdminT } from "../../../contexts/AdminI18nContext";
import { ADMIN_NAVY } from "../../../theme/adminColors";
import Create from "./Create";
import Edit from "./Edit";
import View from "./View";
import { RiStickyNoteLine } from "react-icons/ri";

export default function Index() {
    const { t } = useAdminT();
    const title = t("pages.noteList");
    const { notes, members, subjects, topics, jobTypes, auth } = usePage().props;
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
        subject_id: null,
        topic_id: null,
        job_type_id: null,
    });
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);
    const [form] = Form.useForm();

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
            title: t("note.deleteTitle"),
            icon: <ExclamationCircleFilled />,
            content: t("note.deleteContent"),
            okText: t("common.yes"),
            okType: "danger",
            cancelText: t("common.no"),
            onOk() {
                destroy(route("administrative.note.destroy", record.id));
            },
        });
    };

    const openFilters = () => {
        const subjectId = filters.subject_id ?? null;
        setSelectedSubjectId(subjectId);
        form.setFieldsValue({
            subject_id: subjectId,
            topic_id: filters.topic_id ?? null,
            job_type_id: filters.job_type_id ?? null,
        });
        setFilterOpen(true);
    };

    const applyFilters = useCallback(() => {
        const values = form.getFieldsValue();
        setFilters({
            subject_id: values.subject_id ?? null,
            topic_id: values.topic_id ?? null,
            job_type_id: values.job_type_id ?? null,
        });
        setState((prev) => ({ ...prev, currentPage: 1 }));
        setFilterOpen(false);
    }, [form]);

    const resetFilters = () => {
        form.resetFields();
        setSelectedSubjectId(null);
        setFilters({
            subject_id: null,
            topic_id: null,
            job_type_id: null,
        });
        setState((prev) => ({ ...prev, currentPage: 1 }));
        setFilterOpen(false);
    };

    const matchesSearch = (item) => {
        if (!state.searchText) return true;
        const q = state.searchText;
        const memberName = (item.user?.name || "").toLowerCase();
        const subjectName = (item.subject?.name || "").toLowerCase();
        const topicName = (item.topic?.topic || "").toLowerCase();
        const jobNames = (item.job_type_names || []).join(" ").toLowerCase();
        const driveStr = (item.drive_link || "").toLowerCase();
        return (
            memberName.includes(q) ||
            subjectName.includes(q) ||
            topicName.includes(q) ||
            jobNames.includes(q) ||
            driveStr.includes(q)
        );
    };

    const matchesFilters = (item) => {
        if (
            filters.subject_id &&
            Number(item.subject_id ?? item.subject?.id) !==
                Number(filters.subject_id)
        ) {
            return false;
        }
        if (
            filters.topic_id &&
            Number(item.topic_id ?? item.topic?.id) !== Number(filters.topic_id)
        ) {
            return false;
        }
        if (filters.job_type_id) {
            const jobIds = (item.job_ids || []).map(Number);
            if (!jobIds.includes(Number(filters.job_type_id))) {
                return false;
            }
        }
        return true;
    };

    const filtered = (notes || []).filter(
        (item) => matchesSearch(item) && matchesFilters(item),
    );
    const paginated = filtered.slice(
        (state.currentPage - 1) * state.pageSize,
        state.currentPage * state.pageSize,
    );

    const columns = [
        {
            title: t("note.colSubject"),
            key: "subject",
            width: 130,
            render: (_, record) => record.subject?.name || "—",
        },
        {
            title: t("note.colTopic"),
            key: "topic",
            width: 150,
            ellipsis: true,
            render: (_, record) => record.topic?.topic || "—",
        },
        {
            title: t("note.colJobTypes"),
            key: "job_types",
            width: 160,
            ellipsis: true,
            render: (_, record) =>
                (record.job_type_names || []).join(", ") || "—",
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
            title: t("common.status"),
            dataIndex: "status",
            key: "status",
            width: 90,
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
                    {hasPermission("note_list") && (
                        <View key={`view-${record.id}`} note={record} />
                    )}
                    {hasPermission("note_edit") && (
                        <Edit
                            key={record.id}
                            note={record}
                            members={members}
                            subjects={subjects}
                            topics={topics}
                            jobTypes={jobTypes}
                        />
                    )}
                    {hasPermission("note_delete") && (
                        <Button
                            variant="outlined"
                            danger
                            onClick={() => showDeleteConfirm(record)}
                            icon={<DeleteOutlined />}
                            title={t("note.deleteBtnTitle")}
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
            href: "/administrative/note",
            title: (
                <>
                    <RiStickyNoteLine /> {t("breadcrumb.notesList")}
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
                                placeholder={t("common.searchNote")}
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
                                {hasPermission("note_create") && (
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
                                name="job_type_id"
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
