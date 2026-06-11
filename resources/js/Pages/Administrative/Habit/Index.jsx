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
import { RiHeartPulseLine } from "react-icons/ri";

const HABIT_STATUS_COLORS = {
    pending: "orange",
    adapted: "blue",
    improved: "green",
};

export default function Index() {
    const { t } = useAdminT();
    const title = t("pages.habitList");
    const { habits, members, auth } = usePage().props;
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
            title: t("habit.deleteTitle"),
            icon: <ExclamationCircleFilled />,
            content: t("habit.deleteContent"),
            okText: t("common.yes"),
            okType: "danger",
            cancelText: t("common.no"),
            onOk() {
                destroy(route("administrative.habit.destroy", record.id));
            },
        });
    };

    const habitStatusLabel = (status) => {
        if (status === "adapted") return t("habit.statusAdapted");
        if (status === "improved") return t("habit.statusImproved");
        return t("habit.statusPending");
    };

    const matchesSearch = (item) => {
        if (!state.searchText) return true;
        const q = state.searchText;
        const memberNames = (item.member_names || []).join(" ").toLowerCase();
        const name = (item.name || "").toLowerCase();
        const description = (item.description || "").toLowerCase();
        const habitStatus = habitStatusLabel(item.habit_status).toLowerCase();
        return (
            memberNames.includes(q) ||
            name.includes(q) ||
            description.includes(q) ||
            habitStatus.includes(q)
        );
    };

    const filtered = (habits || []).filter(matchesSearch);
    const paginated = filtered.slice(
        (state.currentPage - 1) * state.pageSize,
        state.currentPage * state.pageSize,
    );

    const columns = [
        {
            title: t("habit.colMembers"),
            key: "members",
            width: 180,
            ellipsis: true,
            render: (_, record) =>
                (record.member_names || []).join(", ") || "—",
        },
        {
            title: t("habit.colName"),
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
            title: t("habit.colDescription"),
            dataIndex: "description",
            key: "description",
            width: 220,
            ellipsis: true,
            render: (value) => value || "—",
        },
        {
            title: t("habit.colHabitStatus"),
            dataIndex: "habit_status",
            key: "habit_status",
            width: 130,
            sorter: (a, b) =>
                (a.habit_status || "").localeCompare(b.habit_status || ""),
            sortOrder:
                state.sortedInfo?.columnKey === "habit_status"
                    ? state.sortedInfo.order
                    : null,
            render: (status) => (
                <Tag color={HABIT_STATUS_COLORS[status] || "default"}>
                    {habitStatusLabel(status)}
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
            width: 120,
            fixed: "right",
            render: (_, record) => (
                <Space>
                    {hasPermission("habit_edit") && (
                        <Edit key={record.id} habit={record} members={members} />
                    )}
                    {hasPermission("habit_delete") && (
                        <Button
                            variant="outlined"
                            danger
                            onClick={() => showDeleteConfirm(record)}
                            icon={<DeleteOutlined />}
                            title={t("habit.deleteBtnTitle")}
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
            href: "/administrative/habit",
            title: (
                <>
                    <RiHeartPulseLine /> {t("breadcrumb.habitsList")}
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
                                placeholder={t("common.searchHabit")}
                                prefix={<SearchOutlined />}
                                onChange={handleSearch}
                                allowClear
                                className="search-input"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6} style={{ textAlign: "right" }}>
                            {hasPermission("habit_create") && (
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
