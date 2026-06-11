import { CloseOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Col, Drawer, Row, Tag } from "antd";
import { useState } from "react";
import { useAdminT } from "../../../contexts/AdminI18nContext";

const TASK_STATUS_COLORS = {
    pending: "orange",
    doing: "blue",
    completed: "green",
};

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

export default function View({ task }) {
    const { t } = useAdminT();
    const [open, setOpen] = useState(false);

    const taskStatusLabel = (status) => {
        if (status === "doing") return t("task.statusDoing");
        if (status === "completed") return t("task.statusCompleted");
        return t("task.statusPending");
    };

    return (
        <div>
            <Button
                color="primary"
                variant="outlined"
                icon={<EyeOutlined />}
                onClick={() => setOpen(true)}
                title={t("task.viewTitle")}
            />
            <Drawer
                closable
                destroyOnClose
                title={t("task.viewTitle")}
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
                    <DetailItem label={t("task.colMember")}>
                        {task.user?.name || "—"}
                    </DetailItem>
                    <DetailItem label={t("task.colName")}>
                        {task.name?.trim() ? task.name : "—"}
                    </DetailItem>
                    <DetailItem label={t("task.colDescription")}>
                        {task.description?.trim() ? task.description : "—"}
                    </DetailItem>
                    <DetailItem label={t("task.colTaskStatus")}>
                        <Tag
                            color={
                                TASK_STATUS_COLORS[task.task_status] || "default"
                            }
                        >
                            {taskStatusLabel(task.task_status)}
                        </Tag>
                    </DetailItem>
                    <DetailItem label={t("common.status")}>
                        {task.status ? (
                            <Tag color="green">{t("common.active")}</Tag>
                        ) : (
                            <Tag color="default">{t("common.inactive")}</Tag>
                        )}
                    </DetailItem>
                </Row>
            </Drawer>
        </div>
    );
}
