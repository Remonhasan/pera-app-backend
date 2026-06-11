import { CloseOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Col, Drawer, Row, Tag } from "antd";
import { useState } from "react";
import { useAdminT } from "../../../contexts/AdminI18nContext";

const STATUS_COLORS = {
    pending: "orange",
    doing: "blue",
    completed: "green",
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

export default function View({ studyGoal }) {
    const { t } = useAdminT();
    const [open, setOpen] = useState(false);

    const statusLabel = (status) => {
        if (status === "doing") return t("studyGoal.statusDoing");
        if (status === "completed") return t("studyGoal.statusCompleted");
        return t("studyGoal.statusPending");
    };

    return (
        <div>
            <Button
                color="primary"
                variant="outlined"
                icon={<EyeOutlined />}
                onClick={() => setOpen(true)}
                title={t("studyGoal.viewTitle")}
            />
            <Drawer
                closable
                destroyOnClose
                title={t("studyGoal.viewTitle")}
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
                    <DetailItem label={t("studyGoal.colMember")}>
                        {studyGoal.user?.name || "—"}
                    </DetailItem>
                    <DetailItem label={t("studyGoal.colSubject")}>
                        {studyGoal.subject?.name || "—"}
                    </DetailItem>
                    <DetailItem label={t("studyGoal.colTopic")}>
                        {studyGoal.topic?.topic || "—"}
                    </DetailItem>
                    <DetailItem label={t("studyGoal.colJobType")}>
                        {studyGoal.job_type?.name || "—"}
                    </DetailItem>
                    <DetailItem label={t("studyGoal.colDateFrom")}>
                        {formatDate(studyGoal.date_from)}
                    </DetailItem>
                    <DetailItem label={t("studyGoal.colDateTo")}>
                        {formatDate(studyGoal.date_to)}
                    </DetailItem>
                    <DetailItem label={t("studyGoal.colExtendedDate")}>
                        {formatDate(studyGoal.extended_date)}
                    </DetailItem>
                    <DetailItem label={t("studyGoal.colStudyGoalStatus")}>
                        <Tag
                            color={
                                STATUS_COLORS[studyGoal.study_goal_status] ||
                                "default"
                            }
                        >
                            {statusLabel(studyGoal.study_goal_status)}
                        </Tag>
                    </DetailItem>
                    <DetailItem label={t("common.status")}>
                        {studyGoal.status ? (
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
