import { CloseOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { useForm } from "@inertiajs/react";
import { Alert, Button, Col, Drawer, Form, Input, Row, Switch } from "antd";
import { useMemo, useState } from "react";
import { useAdminT } from "../../../contexts/AdminI18nContext";

function buildInitial() {
    return { title: "", description: "", status: true };
}

export default function Create() {
    const { t } = useAdminT();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();
    const initial = useMemo(() => buildInitial(), []);
    const { data, setData, post, processing, errors } = useForm(initial);

    const syncFormFields = (payload) => {
        form.setFieldsValue({
            title: payload.title,
            description: payload.description,
            status: payload.status,
        });
    };

    const showLoading = () => {
        const fresh = buildInitial();
        setData(fresh);
        setOpen(true);
        setLoading(true);
        setTimeout(() => {
            syncFormFields(fresh);
            setLoading(false);
        }, 0);
    };

    const handleSubmit = async () => {
        try {
            await form.validateFields();
            post(route("administrative.notice.store"), {
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
                type="primary"
                icon={<PlusOutlined />}
                onClick={showLoading}
                style={{ backgroundColor: "#1e3a5f", borderColor: "#1e3a5f" }}
            >
                {t("common.create")}
            </Button>

            <Drawer
                closable
                destroyOnClose
                title={<p>{t("notice.createTitle")}</p>}
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
