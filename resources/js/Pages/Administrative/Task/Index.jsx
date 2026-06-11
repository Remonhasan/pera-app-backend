import {
    HomeOutlined,
    SearchOutlined,
    DeleteOutlined,
    ExclamationCircleFilled,
} from "@ant-design/icons";
import { Head, usePage, useForm } from "@inertiajs/react";
import { Button, Col, Input, Row, Table, Modal, Space, Tag } from "antd";
import { useState } from "react";
import AppLayout from "../../../components/layouts/AppLayout";
import { useAdminT } from "../../../contexts/AdminI18nContext";
import Create from "./Create";
import Edit from "./Edit";
import View from "./View";
import { RiTaskLine } from "react-icons/ri";

const TASK_STATUS_COLORS = {
    pending: "orange",
    doing: "blue",
    completed: "green",
};

export default function Index() {
    const { t } = useAdminT();
    const title = t("pages.taskList");
    const { tasks, members, auth } = usePage().props;
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
            title: t("task.deleteTitle"),
            icon: <ExclamationCircleFilled />,
            content: t("task.deleteContent"),
            okText: t("common.yes"),
            okType: "danger",
            cancelText: t("common.no"),
            onOk() {
                destroy(route("administrative.task.destroy", record.id));
            },
        });
    };

    const taskStatusLabel = (status) => {
        if (status === "doing") return t("task.statusDoing");
        if (status === "completed") return t("task.statusCompleted");
        return t("task.statusPending");
    };

    const matchesSearch = (item) => {
        if (!state.searchText) return true;
        const q = state.searchText;
        const memberName = (item.user?.name || "").toLowerCase();
        const name = (item.name || "").toLowerCase();
        const description = (item.description || "").toLowerCase();
        const taskStatus = taskStatusLabel(item.task_status).toLowerCase();
        return (
            memberName.includes(q) ||
            name.includes(q) ||
            description.includes(q) ||
            taskStatus.includes(q)
        );
    };

    const filtered = (tasks || []).filter(matchesSearch);
    const paginated = filtered.slice(
        (state.currentPage - 1) * state.pageSize,
        state.currentPage * state.pageSize,
    );

    const columns = [
        {
            title: t("task.colMember"),
            key: "user",
            width: 150,
            ellipsis: true,
            render: (_, record) => record.user?.name || "—",
        },
        {
            title: t("task.colName"),
            dataIndex: "name",
            key: "name",
            width: 180,
            ellipsis: true,
            sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
            sortOrder:
                state.sortedInfo?.columnKey === "name"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("task.colDescription"),
            dataIndex: "description",
            key: "description",
            width: 220,
            ellipsis: true,
            render: (value) => value || "—",
        },
        {
            title: t("task.colTaskStatus"),
            dataIndex: "task_status",
            key: "task_status",
            width: 130,
            sorter: (a, b) =>
                (a.task_status || "").localeCompare(b.task_status || ""),
            sortOrder:
                state.sortedInfo?.columnKey === "task_status"
                    ? state.sortedInfo.order
                    : null,
            render: (status) => (
                <Tag color={TASK_STATUS_COLORS[status] || "default"}>
                    {taskStatusLabel(status)}
                </Tag>
            ),
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
            width: 150,
            fixed: "right",
            render: (_, record) => (
                <Space>
                    {hasPermission("task_list") && (
                        <View key={`view-${record.id}`} task={record} />
                    )}
                    {hasPermission("task_edit") && (
                        <Edit key={record.id} task={record} members={members} />
                    )}
                    {hasPermission("task_delete") && (
                        <Button
                            variant="outlined"
                            danger
                            onClick={() => showDeleteConfirm(record)}
                            icon={<DeleteOutlined />}
                            title={t("task.deleteBtnTitle")}
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
            href: "/administrative/task",
            title: (
                <>
                    <RiTaskLine /> {t("breadcrumb.tasksList")}
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
                                placeholder={t("common.searchTask")}
                                prefix={<SearchOutlined />}
                                onChange={handleSearch}
                                allowClear
                                className="search-input"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6} style={{ textAlign: "right" }}>
                            {hasPermission("task_create") && (
                                <Create members={members} />
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
                            index % 2 === 0 ? "table-row-light" : "table-row-dark"
                        }
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
