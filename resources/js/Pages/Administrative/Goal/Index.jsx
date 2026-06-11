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
import { RiFlagLine } from "react-icons/ri";

const GOAL_STATUS_COLORS = {
    pending: "orange",
    doing: "blue",
    achieved: "green",
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

function formatPrice(val) {
    const n = Number(val);
    if (Number.isNaN(n)) return "—";
    return n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export default function Index() {
    const { t } = useAdminT();
    const title = t("pages.goalList");
    const { goals, members, banks, savingTypes, auth } = usePage().props;
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
            title: t("goal.deleteTitle"),
            icon: <ExclamationCircleFilled />,
            content: t("goal.deleteContent"),
            okText: t("common.yes"),
            okType: "danger",
            cancelText: t("common.no"),
            onOk() {
                destroy(route("administrative.goal.destroy", record.id));
            },
        });
    };

    const goalStatusLabel = (status) => {
        if (status === "doing") return t("goal.statusDoing");
        if (status === "achieved") return t("goal.statusAchieved");
        return t("goal.statusPending");
    };

    const matchesSearch = (item) => {
        if (!state.searchText) return true;
        const q = state.searchText;
        const memberName = (item.user?.name || "").toLowerCase();
        const bankName = (item.bank?.name || "").toLowerCase();
        const savingTypeName = (item.saving_type?.name || "").toLowerCase();
        const startDate = formatDate(item.start_date).toLowerCase();
        const endDate = formatDate(item.end_date).toLowerCase();
        const amount = formatPrice(item.amount).toLowerCase();
        const description = (item.description || "").toLowerCase();
        const driveStr = (item.drive_link || "").toLowerCase();
        const goalStatus = goalStatusLabel(item.goal_status).toLowerCase();
        return (
            memberName.includes(q) ||
            bankName.includes(q) ||
            savingTypeName.includes(q) ||
            startDate.includes(q) ||
            endDate.includes(q) ||
            amount.includes(q) ||
            description.includes(q) ||
            driveStr.includes(q) ||
            goalStatus.includes(q)
        );
    };

    const filtered = (goals || []).filter(matchesSearch);
    const paginated = filtered.slice(
        (state.currentPage - 1) * state.pageSize,
        state.currentPage * state.pageSize,
    );

    const columns = [
        {
            title: t("goal.colMember"),
            key: "user",
            width: 130,
            ellipsis: true,
            render: (_, record) => record.user?.name || "—",
        },
        {
            title: t("goal.colBank"),
            key: "bank",
            width: 120,
            render: (_, record) => record.bank?.name || "—",
        },
        {
            title: t("goal.colSavingType"),
            key: "saving_type",
            width: 130,
            render: (_, record) => record.saving_type?.name || "—",
        },
        {
            title: t("goal.colStartDate"),
            key: "start_date",
            width: 130,
            render: (_, record) => formatDate(record.start_date),
        },
        {
            title: t("goal.colEndDate"),
            key: "end_date",
            width: 130,
            render: (_, record) => formatDate(record.end_date),
        },
        {
            title: t("goal.colAmount"),
            key: "amount",
            width: 120,
            render: (_, record) => formatPrice(record.amount),
        },
        {
            title: t("goal.colDescription"),
            dataIndex: "description",
            key: "description",
            width: 180,
            ellipsis: true,
            render: (value) => value || "—",
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
            title: t("goal.colGoalStatus"),
            dataIndex: "goal_status",
            key: "goal_status",
            width: 120,
            render: (status) => (
                <Tag color={GOAL_STATUS_COLORS[status] || "default"}>
                    {goalStatusLabel(status)}
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
            width: 120,
            fixed: "right",
            render: (_, record) => (
                <Space>
                    {hasPermission("goal_edit") && (
                        <Edit
                            key={record.id}
                            goal={record}
                            members={members}
                            banks={banks}
                            savingTypes={savingTypes}
                        />
                    )}
                    {hasPermission("goal_delete") && (
                        <Button
                            variant="outlined"
                            danger
                            onClick={() => showDeleteConfirm(record)}
                            icon={<DeleteOutlined />}
                            title={t("goal.deleteBtnTitle")}
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
            href: "/administrative/goal",
            title: (
                <>
                    <RiFlagLine /> {t("breadcrumb.goalsList")}
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
                                placeholder={t("common.searchGoal")}
                                prefix={<SearchOutlined />}
                                onChange={handleSearch}
                                allowClear
                                className="search-input"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6} style={{ textAlign: "right" }}>
                            {hasPermission("goal_create") && (
                                <Create
                                    members={members}
                                    banks={banks}
                                    savingTypes={savingTypes}
                                />
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
