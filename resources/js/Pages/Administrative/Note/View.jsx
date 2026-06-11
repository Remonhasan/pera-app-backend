import { CloseOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Col, Drawer, Image, Row, Space, Tag } from "antd";
import { useState } from "react";
import { route } from "ziggy-js";
import { useAdminT } from "../../../contexts/AdminI18nContext";

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

function fileUrl(note, path) {
    return route(
        "administrative.note.file",
        { note: note.id, path },
        true,
    );
}

function fileName(path) {
    return String(path).split("/").pop() || "file";
}

export default function View({ note }) {
    const { t } = useAdminT();
    const [open, setOpen] = useState(false);

    const images = note?.images || [];
    const files = note?.files || [];

    return (
        <div>
            <Button
                color="primary"
                variant="outlined"
                icon={<EyeOutlined />}
                onClick={() => setOpen(true)}
                title={t("note.viewTitle")}
            />
            <Drawer
                closable
                destroyOnClose
                title={t("note.viewTitle")}
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
                    <DetailItem label={t("note.colMember")}>
                        {note.user?.name || "—"}
                    </DetailItem>
                    <DetailItem label={t("note.colSubject")}>
                        {note.subject?.name || "—"}
                    </DetailItem>
                    <DetailItem label={t("note.colTopic")}>
                        {note.topic?.topic || "—"}
                    </DetailItem>
                    <DetailItem label={t("note.colJobTypes")}>
                        {(note.job_type_names || []).join(", ") || "—"}
                    </DetailItem>
                    <DetailItem label={t("common.colDriveLink")}>
                        {note.drive_link ? (
                            <a
                                href={note.drive_link}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {note.drive_link}
                            </a>
                        ) : (
                            "—"
                        )}
                    </DetailItem>
                    <DetailItem label={t("common.status")}>
                        {note.status ? (
                            <Tag color="green">{t("common.active")}</Tag>
                        ) : (
                            <Tag color="default">{t("common.inactive")}</Tag>
                        )}
                    </DetailItem>
                    <DetailItem label={t("note.colImages")}>
                        {images.length ? (
                            <Image.PreviewGroup>
                                <Space wrap>
                                    {images.map((path) => (
                                        <Image
                                            key={path}
                                            src={fileUrl(note, path)}
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
                    <DetailItem label={t("note.colFiles")}>
                        {files.length ? (
                            <Space direction="vertical">
                                {files.map((path) => (
                                    <a
                                        key={path}
                                        href={fileUrl(note, path)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {fileName(path)}
                                    </a>
                                ))}
                            </Space>
                        ) : (
                            "—"
                        )}
                    </DetailItem>
                </Row>
            </Drawer>
        </div>
    );
}
