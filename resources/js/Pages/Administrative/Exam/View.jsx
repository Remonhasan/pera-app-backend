import { CloseOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Col, Drawer, Image, Row, Space, Tag } from "antd";
import { useState } from "react";
import { route } from "ziggy-js";
import { useAdminT } from "../../../contexts/AdminI18nContext";

const STATUS_COLORS = {
    pending: "orange",
    completed: "blue",
    passed: "green",
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

function fileUrl(exam, path) {
    return route("administrative.exam.file", { exam: exam.id, path }, true);
}

function fileName(path) {
    return String(path).split("/").pop() || "file";
}

export default function View({ exam }) {
    const { t } = useAdminT();
    const [open, setOpen] = useState(false);

    const statusLabel = (status) => {
        if (status === "completed") return t("exam.statusCompleted");
        if (status === "passed") return t("exam.statusPassed");
        return t("exam.statusPending");
    };

    const images = exam?.images || [];

    return (
        <div>
            <Button
                color="primary"
                variant="outlined"
                icon={<EyeOutlined />}
                onClick={() => setOpen(true)}
                title={t("exam.viewTitle")}
            />
            <Drawer
                closable
                destroyOnClose
                title={t("exam.viewTitle")}
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
                    <DetailItem label={t("exam.colName")}>
                        {exam.name || "—"}
                    </DetailItem>
                    <DetailItem label={t("exam.colJobType")}>
                        {exam.job_type?.name || "—"}
                    </DetailItem>
                    <DetailItem label={t("exam.colExamDate")}>
                        {formatDate(exam.exam_date)}
                    </DetailItem>
                    <DetailItem label={t("exam.colExpectedExamDate")}>
                        {formatDate(exam.expected_exam_date)}
                    </DetailItem>
                    <DetailItem label={t("exam.colExamStatus")}>
                        <Tag
                            color={
                                STATUS_COLORS[exam.exam_status] || "default"
                            }
                        >
                            {statusLabel(exam.exam_status)}
                        </Tag>
                    </DetailItem>
                    <DetailItem label={t("common.status")}>
                        {exam.status ? (
                            <Tag color="green">{t("common.active")}</Tag>
                        ) : (
                            <Tag color="default">{t("common.inactive")}</Tag>
                        )}
                    </DetailItem>
                    <DetailItem label={t("exam.applicationFileLabel")}>
                        {exam.application_file ? (
                            <a
                                href={fileUrl(exam, exam.application_file)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {fileName(exam.application_file)}
                            </a>
                        ) : (
                            "—"
                        )}
                    </DetailItem>
                    <DetailItem label={t("exam.admitCardFileLabel")}>
                        {exam.admit_card_file ? (
                            <a
                                href={fileUrl(exam, exam.admit_card_file)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {fileName(exam.admit_card_file)}
                            </a>
                        ) : (
                            "—"
                        )}
                    </DetailItem>
                    <DetailItem label={t("exam.imagesLabel")}>
                        {images.length ? (
                            <Image.PreviewGroup>
                                <Space wrap>
                                    {images.map((path) => (
                                        <Image
                                            key={path}
                                            src={fileUrl(exam, path)}
                                            alt={fileName(path)}
                                            width={80}
                                            height={80}
                                            style={{
                                                objectFit: "cover",
                                                borderRadius: 8,
                                            }}
                                        />
                                    ))}
                                </Space>
                            </Image.PreviewGroup>
                        ) : (
                            "—"
                        )}
                    </DetailItem>
                </Row>
            </Drawer>
        </div>
    );
}
