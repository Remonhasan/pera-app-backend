import { CloseOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { useForm } from "@inertiajs/react";
import {
    Alert,
    Button,
    Col,
    Drawer,
    Form,
    Input,
    Row,
    Select,
    Switch,
} from "antd";
import { useMemo, useState } from "react";
import { useAdminT } from "../../../contexts/AdminI18nContext";

function buildFromTopic(topic) {
    return {
        subject_id: topic.subject_id ?? topic.subject?.id ?? null,
        topic: topic.topic ?? "",
        status: Boolean(topic.status),
    };
}

export default function Edit({ topic, subjects }) {
    const { t } = useAdminT();

    const subjectOptions = useMemo(
        () =>
            (subjects || []).map((subject) => ({
                value: subject.id,
                label: subject.name,
            })),
        [subjects],
    );

    const initial = useMemo(() => buildFromTopic(topic), [topic]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();
    const { data, setData, put, processing, errors } = useForm(initial);

    const showLoading = () => {
        const next = buildFromTopic(topic);
        setData(() => next);
        setOpen(true);
        setLoading(true);
        setTimeout(() => {
            form.setFieldsValue({
                subject_id: next.subject_id,
                topic: next.topic,
                status: next.status,
            });
            setLoading(false);
        }, 0);
    };

    const handleSubmit = async () => {
        try {
            await form.validateFields();
            put(route("administrative.topic.update", topic.id), {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
            });
        } catch {
            // validation
        }
    };

    const hasTopErrors = Object.keys(errors || {}).length > 0;

    return (
        <div>
            <Button
                type="default"
                icon={<EditOutlined />}
                onClick={showLoading}
                title={t("topic.editTitle")}
            />

            <Drawer
                closable
                destroyOnClose
                title={<p>{t("topic.editTitle")}</p>}
                placement="right"
                open={open}
                loading={loading}
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
                            type="default"
                            icon={<CloseOutlined />}
                            onClick={() => setOpen(false)}
                            style={{ marginRight: 8 }}
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={processing}
                            onClick={handleSubmit}
                            style={{
                                backgroundColor: "#1e3a5f",
                                borderColor: "#1e3a5f",
                            }}
                        >
                            Save
                        </Button>
                    </div>
                }
            >
                {hasTopErrors && (
                    <Alert
                        type="error"
                        showIcon
                        message="Please fix the errors below."
                        style={{ marginBottom: 16 }}
                    />
                )}

                <Form form={form} layout="vertical">
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Form.Item
                                label={t("topic.subjectLabel")}
                                name="subject_id"
                                rules={[
                                    {
                                        required: true,
                                        message: t("topic.subjectRequired"),
                                    },
                                ]}
                                validateStatus={errors?.subject_id ? "error" : ""}
                                help={errors?.subject_id}
                            >
                                <Select
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder={t("topic.subjectPlaceholder")}
                                    options={subjectOptions}
                                    value={data.subject_id}
                                    onChange={(v) => {
                                        setData("subject_id", v);
                                        form.setFieldValue("subject_id", v);
                                    }}
                                    size="large"
                                    className="topic-form-input"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("topic.topicLabel")}
                                name="topic"
                                rules={[
                                    {
                                        required: true,
                                        message: t("topic.topicRequired"),
                                    },
                                ]}
                                validateStatus={errors?.topic ? "error" : ""}
                                help={errors?.topic}
                            >
                                <Input
                                    className="topic-form-input"
                                    value={data.topic}
                                    onChange={(e) => {
                                        setData("topic", e.target.value);
                                        form.setFieldValue("topic", e.target.value);
                                    }}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("common.status")}
                                name="status"
                                valuePropName="checked"
                            >
                                <Switch
                                    checked={data.status}
                                    onChange={(v) => {
                                        setData("status", v);
                                        form.setFieldValue("status", v);
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Drawer>
            <style>{`
                .topic-form-input.ant-select .ant-select-selector,
                .topic-form-input.ant-input {
                    border-radius: 12px !important;
                    min-height: 46px;
                    font-size: 15px;
                    border-color: #d9d9d9;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }
                .topic-form-input.ant-select .ant-select-selector {
                    padding: 6px 16px !important;
                }
                .topic-form-input.ant-input {
                    padding: 10px 16px !important;
                }
                .topic-form-input.ant-select:hover .ant-select-selector,
                .topic-form-input.ant-input:hover {
                    border-color: #1e3a5f !important;
                }
                .topic-form-input.ant-select-focused .ant-select-selector,
                .topic-form-input.ant-input:focus {
                    border-color: #1e3a5f !important;
                    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.12) !important;
                }
            `}</style>
        </div>
    );
}
