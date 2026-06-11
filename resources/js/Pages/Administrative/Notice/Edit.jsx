import { CloseOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { useForm } from "@inertiajs/react";
import { Alert, Button, Col, Drawer, Form, Input, Row, Switch } from "antd";
import { useMemo, useState } from "react";
import { useAdminT } from "../../../contexts/AdminI18nContext";

function buildFromNotice(notice) {
    return {
        title: notice.title ?? "",
        description: notice.description ?? "",
        status: Boolean(notice.status),
    };
}

export default function Edit({ notice }) {
    const { t } = useAdminT();
    const initial = useMemo(() => buildFromNotice(notice), [notice]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();
    const { data, setData, put, processing, errors } = useForm(initial);

    const showLoading = () => {
        const next = buildFromNotice(notice);
        setData(() => next);
        setOpen(true);
        setLoading(true);
        setTimeout(() => {
            form.setFieldsValue(next);
            setLoading(false);
        }, 0);
    };

    const handleSubmit = async () => {
        try {
            await form.validateFields();
            put(route("administrative.notice.update", notice.id), {
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
                title={t("notice.editTitle")}
            />

            <Drawer
                closable
                destroyOnClose
                title={<p>{t("notice.editTitle")}</p>}
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
                                label={t("notice.titleLabel")}
                                name="title"
                                rules={[
                                    {
                                        required: true,
                                        message: t("notice.titleRequired"),
                                    },
                                ]}
                                validateStatus={errors?.title ? "error" : ""}
                                help={errors?.title}
                            >
                                <Input
                                    className="notice-form-input"
                                    value={data.title}
                                    onChange={(e) => {
                                        setData("title", e.target.value);
                                        form.setFieldValue("title", e.target.value);
                                    }}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("notice.descriptionLabel")}
                                name="description"
                                validateStatus={errors?.description ? "error" : ""}
                                help={errors?.description}
                            >
                                <Input.TextArea
                                    className="notice-form-textarea"
                                    value={data.description}
                                    onChange={(e) => {
                                        setData("description", e.target.value);
                                        form.setFieldValue("description", e.target.value);
                                    }}
                                    rows={5}
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
                .notice-form-input.ant-input,
                .notice-form-textarea.ant-input {
                    border-radius: 12px !important;
                    font-size: 15px;
                    border-color: #d9d9d9;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }
                .notice-form-input.ant-input {
                    min-height: 46px;
                    padding: 10px 16px !important;
                }
                .notice-form-textarea.ant-input {
                    padding: 12px 16px !important;
                }
                .notice-form-input.ant-input:hover,
                .notice-form-textarea.ant-input:hover {
                    border-color: #1e3a5f !important;
                }
                .notice-form-input.ant-input:focus,
                .notice-form-input.ant-input-focused,
                .notice-form-textarea.ant-input:focus,
                .notice-form-textarea.ant-input-focused {
                    border-color: #1e3a5f !important;
                    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.12) !important;
                }
            `}</style>
        </div>
    );
}
