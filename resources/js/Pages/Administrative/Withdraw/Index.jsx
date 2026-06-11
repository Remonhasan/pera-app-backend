import {
    HomeOutlined,
    SearchOutlined,
    DeleteOutlined,
    ExclamationCircleFilled,
} from "@ant-design/icons";
import { Head, usePage, useForm } from "@inertiajs/react";
import { Button, Col, Image, Input, Row, Table, Modal, Space, Tag } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import AppLayout from "../../../components/layouts/AppLayout";
import { useAdminT } from "../../../contexts/AdminI18nContext";
import Create from "./Create";
import Edit from "./Edit";
import View from "./View";
import { RiExchangeDollarLine } from "react-icons/ri";

const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

function formatWithdrawDate(dateString) {
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
    if (Number.isNaN(n)) {
        return "—";
    }
    return n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function formatMonth(month) {
    const m = Number(month);
    if (!m || m < 1 || m > 12) return "—";
    return MONTH_NAMES[m - 1];
}

export default function Index() {
    const { t } = useAdminT();
    const title = t("pages.withdrawList");
    const { withdraws, members, banks, savingTypes, auth } = usePage().props;
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
            title: t("withdraw.deleteTitle"),
            icon: <ExclamationCircleFilled />,
            content: t("withdraw.deleteContent"),
            okText: t("common.yes"),
            okType: "danger",
            cancelText: t("common.no"),
            onOk() {
                destroy(route("administrative.withdraw.destroy", record.id));
            },
        });
    };

    const matchesSearch = (item) => {
        if (!state.searchText) return true;
        const q = state.searchText;
        const memberName = (item.user?.name || "").toLowerCase();
        const bankName = (item.bank?.name || "").toLowerCase();
        const typeName = (item.saving_type?.name || "").toLowerCase();
        const monthStr = formatMonth(item.month).toLowerCase();
        const yearStr = String(item.year || "");
        const dateStr = formatWithdrawDate(item.date).toLowerCase();
        const amountStr = formatPrice(item.amount).toLowerCase();
        const descStr = (item.description || "").toLowerCase();
        const driveStr = (item.drive_link || "").toLowerCase();
        return (
            memberName.includes(q) ||
            bankName.includes(q) ||
            typeName.includes(q) ||
            monthStr.includes(q) ||
            yearStr.includes(q) ||
            dateStr.includes(q) ||
            amountStr.includes(q) ||
            descStr.includes(q) ||
            driveStr.includes(q)
        );
    };

    const filtered = (withdraws || []).filter(matchesSearch);
    const paginated = filtered.slice(
        (state.currentPage - 1) * state.pageSize,
        state.currentPage * state.pageSize,
    );

    const columns = [
        {
            title: t("withdraw.colMember"),
            key: "user",
            width: 150,
            ellipsis: true,
            sorter: (a, b) =>
                (a.user?.name || "").localeCompare(b.user?.name || ""),
            sortOrder:
                state.sortedInfo?.columnKey === "user"
                    ? state.sortedInfo.order
                    : null,
            render: (_, record) => record.user?.name || "—",
        },
        {
            title: t("withdraw.colBank"),
            key: "bank",
            width: 130,
            render: (_, record) => record.bank?.name || "—",
            sorter: (a, b) =>
                (a.bank?.name || "").localeCompare(b.bank?.name || ""),
            sortOrder:
                state.sortedInfo?.columnKey === "bank"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("withdraw.colSavingType"),
            key: "saving_type",
            width: 130,
            render: (_, record) => record.saving_type?.name || "—",
            sorter: (a, b) =>
                (a.saving_type?.name || "").localeCompare(
                    b.saving_type?.name || "",
                ),
            sortOrder:
                state.sortedInfo?.columnKey === "saving_type"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("withdraw.colMonth"),
            dataIndex: "month",
            key: "month",
            width: 100,
            render: (month) => formatMonth(month),
            sorter: (a, b) => Number(a.month) - Number(b.month),
            sortOrder:
                state.sortedInfo?.columnKey === "month"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("withdraw.colYear"),
            dataIndex: "year",
            key: "year",
            width: 80,
            sorter: (a, b) => Number(a.year) - Number(b.year),
            sortOrder:
                state.sortedInfo?.columnKey === "year"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("withdraw.colDate"),
            dataIndex: "date",
            key: "date",
            width: 140,
            render: (date) => formatWithdrawDate(date),
            sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
            sortOrder:
                state.sortedInfo?.columnKey === "date"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("withdraw.colAmount"),
            dataIndex: "amount",
            key: "amount",
            width: 110,
            render: (amount) => formatPrice(amount),
            sorter: (a, b) => Number(a.amount) - Number(b.amount),
            sortOrder:
                state.sortedInfo?.columnKey === "amount"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("withdraw.colDescription"),
            dataIndex: "description",
            key: "description",
            width: 140,
            ellipsis: true,
            render: (text) => text || "—",
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
            title: t("withdraw.colImage"),
            key: "image",
            width: 70,
            render: (_, record) =>
                record.image ? (
                    <Image
                        src={route(
                            "administrative.withdraw.image",
                            record.id,
                            true,
                        )}
                        alt="withdraw"
                        width={48}
                        height={48}
                        style={{ objectFit: "cover", borderRadius: 6 }}
                    />
                ) : (
                    "—"
                ),
        },
        {
            title: t("common.status"),
            dataIndex: "status",
            key: "status",
            width: 90,
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
                    {hasPermission("withdraw_list") && (
                        <View key={`view-${record.id}`} withdraw={record} />
                    )}
                    {hasPermission("withdraw_edit") && (
                        <Edit
                            key={record.id}
                            withdraw={record}
                            members={members}
                            banks={banks}
                            savingTypes={savingTypes}
                        />
                    )}
                    {hasPermission("withdraw_delete") && (
                        <Button
                            variant="outlined"
                            danger
                            onClick={() => showDeleteConfirm(record)}
                            icon={<DeleteOutlined />}
                            title={t("withdraw.deleteBtnTitle")}
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
            href: "/administrative/withdraw",
            title: (
                <>
                    <RiExchangeDollarLine /> {t("breadcrumb.withdrawsList")}
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
                                placeholder={t("common.searchWithdraw")}
                                prefix={<SearchOutlined />}
                                onChange={handleSearch}
                                allowClear
                                className="search-input"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6} style={{ textAlign: "right" }}>
                            {hasPermission("withdraw_create") && (
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
