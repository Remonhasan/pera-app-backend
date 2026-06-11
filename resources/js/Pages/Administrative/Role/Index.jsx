import {
    HomeOutlined,
    SearchOutlined,
    LockOutlined,
    DeleteOutlined,
    ExclamationCircleFilled,
} from "@ant-design/icons";
import { Head, usePage, useForm } from "@inertiajs/react";
import { Button, Col, Input, Row, Table, Modal, Space } from "antd";
import { useState } from "react";
import AppLayout from "../../../components/layouts/AppLayout";
import { useAdminT } from "../../../contexts/AdminI18nContext";
import Create from "./Create";
import Edit from "./Edit";

export default function Index() {
    const { t } = useAdminT();
    const title = t("pages.roleList");
    const { roles, auth } = usePage().props;

    const { confirm } = Modal;
    const { delete: destroy } = useForm();

    const permissions = auth?.permissions || [];
    const hasPermission = (permission) => permissions.includes(permission);

    const [state, setState] = useState({
        currentPage: 1,
        pageSize: 10,
        searchText: "",
        sortedInfo: {},
        isDrawerVisible: false,
        drawerType: "",
        editingUser: null,
    });
    const handleSearch = (e) => {
        setState((prevState) => ({
            ...prevState,
            searchText: e.target.value.toLowerCase(),
            currentPage: 1,
        }));
    };

    const handleTableChange = (_, __, sorter) => {
        setState((prevState) => ({
            ...prevState,
            sortedInfo: sorter,
        }));
    };
    const showDeleteConfirm = (record) => {
        confirm({
            title: t("role.deleteTitle"),
            icon: <ExclamationCircleFilled />,
            content: t("role.deleteContent"),
            okText: t("common.yes"),
            okType: "danger",
            cancelText: t("common.no"),
            onOk() {
                destroy(route("administrative.role.destroy", record.id));
            },
            onCancel() {},
        });
    };

    const roleMatchesSearch = (role) => {
        const name = role.name ? role.name.toLowerCase() : "";
        const label = role.label ? String(role.label).toLowerCase() : "";
        return (
            name.includes(state.searchText) || label.includes(state.searchText)
        );
    };

    const filteredData = roles
        .filter(roleMatchesSearch)
        .slice(
            (state.currentPage - 1) * state.pageSize,
            state.currentPage * state.pageSize,
        );

    const columns = [
        {
            title: t("common.id"),
            key: "serial",
            width: 80,
            render: (_, __, index) => {
                const serialNumber =
                    (state.currentPage - 1) * state.pageSize + index + 1;
                return serialNumber;
            },
        },
        {
            title: t("common.labelName"),
            dataIndex: "label",
            key: "label",
            width: 300,
            sorter: (a, b) => (a.label || "").localeCompare(b.label || ""),
            sortOrder:
                state.sortedInfo?.columnKey === "label"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("common.name"),
            dataIndex: "name",
            key: "name",
            width: 300,
            sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
            sortOrder:
                state.sortedInfo?.columnKey === "name"
                    ? state.sortedInfo.order
                    : null,
        },
        {
            title: t("common.actions"),
            key: "actions",
            width: 120,
            fixed: "right",
            render: (_, record) => (
                <Space>
                    {hasPermission("role_edit") && <Edit role={record} />}
                    {hasPermission("role_delete") && (
                        <Button
                            variant="outlined"
                            danger
                            onClick={() => showDeleteConfirm(record)}
                            icon={<DeleteOutlined />}
                            title={t("role.deleteBtnTitle")}
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
            href: "/administrative/role",
            title: (
                <>
                    <LockOutlined /> {t("breadcrumb.rolesList")}
                </>
            ),
        },
    ];

    return (
        <>
            <AppLayout title={title} breadcrumb={breadcrumbItems}>
                <Head title={title} />
                <div>
                    {/* Search and Create Section */}
                    <Row
                        justify="space-between"
                        align="middle"
                        gutter={[16, 16]}
                        style={{ marginBottom: 24 }}
                    >
                        <Col xs={24} sm={12} md={8}>
                            <Input
                                placeholder={t("common.searchRole")}
                                prefix={<SearchOutlined />}
                                onChange={handleSearch}
                                allowClear
                                className="search-input"
                            />
                        </Col>
                        <Col
                            xs={24}
                            sm={12}
                            md={6}
                            style={{ textAlign: "right" }}
                        >
                            {hasPermission("role_create") && <Create />}
                        </Col>
                    </Row>

                    {/* Roles Table */}
                    <Table
                        dataSource={filteredData}
                        columns={columns}
                        rowKey="id"
                        scroll={{
                            x: "max-content",
                        }}
                        size="middle"
                        onChange={handleTableChange}
                        pagination={{
                            current: state.currentPage,
                            pageSize: state.pageSize,
                            total: roles.filter(roleMatchesSearch).length,
                            onChange: (page, pageSize) =>
                                setState((prevState) => ({
                                    ...prevState,
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
                        rowClassName={(record, index) =>
                            index % 2 === 0
                                ? "table-row-light"
                                : "table-row-dark"
                        }
                    />
                </div>
            </AppLayout>
            <style>{`
                .table-row-light {
                    background-color: #fafafa;
                }
                .table-row-dark {
                    background-color: #ffffff;
                }
                .table-row-light:hover,
                .table-row-dark:hover {
                    background-color: #e6f7ff !important;
                    transition: background-color 0.3s ease;
                }
                .ant-table-tbody > tr > td {
                    padding: 16px !important;
                }
            `}</style>
        </>
    );
}
