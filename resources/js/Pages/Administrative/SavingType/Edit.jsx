import { CloseOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { useForm } from "@inertiajs/react";
import { Alert, Button, Col, Drawer, Form, Input, Row, Switch } from "antd";
import { useMemo, useState } from "react";
import { useAdminT } from "../../../contexts/AdminI18nContext";

function buildFromsavingType(savingType) {
    return {
        name: savingType.name ?? "",
        status: Boolean(savingType.status),
    };
}

export default function Edit({ savingType }) {
    const { t } = useAdminT();
    const initial = useMemo(() => buildFromsavingType(savingType), [savingType]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();
    const { data, setData, put, processing, errors } = useForm(initial);

    const showLoading = () => {
        const next = buildFromsavingType(savingType);
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
            put(route("administrative.saving-type.update", savingType.id), {
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
                title={t("savingType.editTitle")}
            />

            <Drawer
                closable
                destroyOnClose
                title={<p>{t("savingType.editTitle")}</p>}
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
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={t("savingType.nameLabel")}
                                name="name"
                                rules={[
                                    {
                                        required: true,
                                        message: t("savingType.nameRequired"),
                                    },
                                ]}
                                validateStatus={errors?.name ? "error" : ""}
                                help={errors?.name}
                            >
                                <Input
                                    className="saving-type-form-input"
                                    value={data.name}
                                    onChange={(e) => {
                                        setData("name", e.target.value);
                                        form.setFieldValue("name", e.target.value);
                                    }}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
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
                .saving-type-form-input.ant-input {
                    border-radius: 12px !important;
                    min-height: 46px;
                    font-size: 15px;
                    border-color: #d9d9d9;
                    padding: 10px 16px !important;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }
                .saving-type-form-input.ant-input:hover {
                    border-color: #1e3a5f !important;
                }
                .saving-type-form-input.ant-input:focus,
                .saving-type-form-input.ant-input-focused {
                    border-color: #1e3a5f !important;
                    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.12) !important;
                }
            `}</style>
        </div>
    );
}
