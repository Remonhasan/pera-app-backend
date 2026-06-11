import { CloseOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { useForm } from "@inertiajs/react";
import { Alert, Button, Col, Drawer, Form, Input, Row } from "antd";
import { useEffect, useState } from "react";
import { useAdminT } from "../../../contexts/AdminI18nContext";

export default function Create() {
    const { t } = useAdminT();
    const title = "Create Permission";
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        label: "",
    });

    const showLoading = () => {
        setOpen(true);
        setLoading(true);
        setTimeout(() => setLoading(false), 800);
    };

    useEffect(() => {
        if (!open) {
            form.resetFields();
            reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleSubmit = async () => {
        try {
            await form.validateFields();
            post(route("administrative.permission.store"), {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
            });
        } catch {
            // AntD will show field errors
        }
    };

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
                title={<p>{title}</p>}
                placement="right"
                open={open}
                loading={loading}
                size={"large"}
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
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={processing}
                            onClick={handleSubmit}
                            style={{ backgroundColor: "#1e3a5f", borderColor: "#1e3a5f" }}
                        >
                            Save
                        </Button>
                    </div>
                }
            >
                {(errors?.name || errors?.label) && (
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
                                label="Permission name"
                                name="name"
                                rules={[{ required: true, message: "Name is required" }]}
                                validateStatus={errors?.name ? "error" : ""}
                                help={errors?.name}
                            >
                                <Input
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    placeholder="e.g. user_list"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="Label / group"
                                name="label"
                                rules={[{ required: true, message: "Label is required" }]}
                                validateStatus={errors?.label ? "error" : ""}
                                help={errors?.label}
                            >
                                <Input
                                    value={data.label}
                                    onChange={(e) => setData("label", e.target.value)}
                                    placeholder="e.g. User Management"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Drawer>
        </div>
    );
}

