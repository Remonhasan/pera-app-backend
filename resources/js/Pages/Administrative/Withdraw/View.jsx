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

export default function View({ withdraw }) {
    const { t } = useAdminT();
    const [open, setOpen] = useState(false);

    const imageUrl = withdraw?.image
        ? route("administrative.withdraw.image", withdraw.id, true)
        : null;

    return (
        <div>
            <Button
                color="primary"
                variant="outlined"
                icon={<EyeOutlined />}
                onClick={() => setOpen(true)}
                title={t("withdraw.viewTitle")}
            />
            <Drawer
                closable
                destroyOnClose
                title={t("withdraw.viewTitle")}
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
                    <DetailItem label={t("withdraw.colMember")}>
                        {withdraw.user?.name || "—"}
                    </DetailItem>
                    <DetailItem label={t("withdraw.colBank")}>
                        {withdraw.bank?.name || "—"}
                    </DetailItem>
                    <DetailItem label={t("withdraw.colSavingType")}>
                        {withdraw.saving_type?.name || "—"}
                    </DetailItem>
                    <DetailItem label={t("withdraw.colMonth")}>
                        {formatMonth(withdraw.month)}
                    </DetailItem>
                    <DetailItem label={t("withdraw.colYear")}>
                        {withdraw.year ?? "—"}
                    </DetailItem>
                    <DetailItem label={t("withdraw.colDate")}>
                        {formatWithdrawDate(withdraw.date)}
                    </DetailItem>
                    <DetailItem label={t("withdraw.colAmount")}>
                        {formatPrice(withdraw.amount)}
                    </DetailItem>
                    <DetailItem label={t("withdraw.colDescription")}>
                        {withdraw.description?.trim()
                            ? withdraw.description
                            : "—"}
                    </DetailItem>
                    <DetailItem label={t("common.colDriveLink")}>
                        {withdraw.drive_link ? (
                            <a
                                href={withdraw.drive_link}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {withdraw.drive_link}
                            </a>
                        ) : (
                            "—"
                        )}
                    </DetailItem>
                    <DetailItem label={t("common.status")}>
                        {withdraw.status ? (
                            <Tag color="green">{t("common.active")}</Tag>
                        ) : (
                            <Tag color="default">{t("common.inactive")}</Tag>
                        )}
                    </DetailItem>
                    <DetailItem label={t("withdraw.colImage")}>
                        {imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={t("withdraw.colImage")}
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
