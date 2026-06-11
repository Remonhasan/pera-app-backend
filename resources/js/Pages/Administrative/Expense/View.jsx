import { CloseOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Col, Drawer, Image, Row, Tag } from "antd";
import { useState } from "react";
import { route } from "ziggy-js";
import { useAdminT } from "../../../contexts/AdminI18nContext";

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

function formatExpenseDate(dateString) {
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
    if (val === null || val === undefined || val === "") return "—";
    const n = Number(val);
    if (Number.isNaN(n)) return "—";
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

function DetailItem({ label, children }) {
    return (
        <Col span={24}>
            <div style={{ marginBottom: 16 }}>
                <div
                    style={{
                        fontSize: 13,
                        color: "#8c8c8c",
                        marginBottom: 4,
                    }}
                >
                    {label}
                </div>
                <div style={{ fontSize: 15, color: "#262626" }}>{children}</div>
            </div>
        </Col>
    );
}

export default function View({ expense }) {
    const { t } = useAdminT();
    const [open, setOpen] = useState(false);

    const imageUrl = expense?.image
        ? route("administrative.expense.image", expense.id, true)
        : null;

    return (
        <div>
            <Button
                color="primary"
                variant="outlined"
                icon={<EyeOutlined />}
                onClick={() => setOpen(true)}
                title={t("expense.viewTitle")}
            />
            <Drawer
                closable
                destroyOnClose
                title={t("expense.viewTitle")}
                placement="right"
                open={open}
                size="large"
                onClose={() => setOpen(false)}
                headerStyle={{
                    backgroundColor: "#1e3a5f",
                    color: "#ffffff",
                    borderBottom: "none",
                }}
                bodyStyle={{ padding: "24px" }}
                footer={
                    <div style={{ textAlign: "right" }}>
                        <Button
                            icon={<CloseOutlined />}
                            onClick={() => setOpen(false)}
                        >
                            {t("common.cancel")}
                        </Button>
                    </div>
                }
            >
                <Row gutter={[16, 0]}>
                    <DetailItem label={t("expense.colMember")}>
                        {expense.user?.name || "—"}
                    </DetailItem>
                    <DetailItem label={t("expense.colExpenseType")}>
                        {expense.expense_type?.name || "—"}
                    </DetailItem>
                    <DetailItem label={t("budget.budgetTypeLabel")}>
                        {expense.budget_type?.name || "—"}
                    </DetailItem>
                    <DetailItem label={t("expense.colName")}>
                        {expense.name?.trim() ? expense.name : "—"}
                    </DetailItem>
                    <DetailItem label={t("expense.colMonth")}>
                        {formatMonth(expense.month)}
                    </DetailItem>
                    <DetailItem label={t("expense.colYear")}>
                        {expense.year ?? "—"}
                    </DetailItem>
                    <DetailItem label={t("expense.colDate")}>
                        {formatExpenseDate(expense.date)}
                    </DetailItem>
                    <DetailItem label={t("expense.colAmount")}>
                        {formatPrice(expense.amount)}
                    </DetailItem>
                    <DetailItem label={t("expense.colDescription")}>
                        {expense.description?.trim() ? expense.description : "—"}
                    </DetailItem>
                    <DetailItem label={t("common.colDriveLink")}>
                        {expense.drive_link ? (
                            <a
                                href={expense.drive_link}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {expense.drive_link}
                            </a>
                        ) : (
                            "—"
                        )}
                    </DetailItem>
                    <DetailItem label={t("common.status")}>
                        {expense.status ? (
                            <Tag color="green">{t("common.active")}</Tag>
                        ) : (
                            <Tag color="default">{t("common.inactive")}</Tag>
                        )}
                    </DetailItem>
                    <DetailItem label={t("expense.colImage")}>
                        {imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={t("expense.colImage")}
                                style={{
                                    maxWidth: "100%",
                                    borderRadius: 8,
                                }}
                            />
                        ) : (
                            "—"
                        )}
                    </DetailItem>
                </Row>
            </Drawer>
        </div>
    );
}
