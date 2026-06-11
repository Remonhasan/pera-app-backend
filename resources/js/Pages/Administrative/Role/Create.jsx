import { CloseOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { useForm, usePage } from "@inertiajs/react";
import { Alert, Button, Card, Checkbox, Col, Drawer, Form, Input, Row } from "antd";
import { useState } from "react";
import { useAdminT } from "../../../contexts/AdminI18nContext";

export default function Create() {
    const { t } = useAdminT();
    const title = "Create Role";
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const { permission } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        name: "",
        permissions: [],
    });

    const showLoading = () => {
        setOpen(true);
        setLoading(true);
        setTimeout(() => setLoading(false), 800);
    };

    const handleSubmit = () => {
        post(route("administrative.role.store"), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    const onChange = (checkedValues) => {
        setData("permissions", checkedValues);
    };

    const options = Array.isArray(permission) ? permission : [];

    const allPermissionValues = options.flatMap((group) =>
        group?.options ? group.options.map((opt) => opt.value) : [],
    );

    const isAllSelected =
        allPermissionValues.length > 0 &&
        allPermissionValues.every((value) => data.permissions.includes(value));

    const handleSelectAll = (e) => {
        if (e.target.checked) setData("permissions", allPermissionValues);
        else setData("permissions", []);
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
                {(errors?.name || errors?.permissions) && (
                    <Alert
                        type="error"
                        showIcon
                        message="Please fix the errors below."
                        style={{ marginBottom: 16 }}
                    />
                )}

                <Form layout="vertical">
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Form.Item
                                label="Role name"
                                validateStatus={errors?.name ? "error" : ""}
                                help={errors?.name}
                                required
                            >
                                <Input
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    placeholder="e.g. administrator"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Card
                        size="small"
                        title={
                            <Checkbox checked={isAllSelected} onChange={handleSelectAll}>
                                Select all permissions
                            </Checkbox>
                        }
                        style={{ marginTop: 12 }}
                    >
                        {options.map((group) => (
                            <div key={group.label} style={{ marginBottom: 16 }}>
                                <div style={{ fontWeight: 600, marginBottom: 8 }}>{group.label}</div>
                                <Checkbox.Group
                                    style={{ width: "100%" }}
                                    value={data.permissions}
                                    onChange={onChange}
                                >
                                    <Row gutter={[12, 12]}>
                                        {(group.options || []).map((opt) => (
                                            <Col xs={24} md={12} key={opt.value}>
                                                <Checkbox value={opt.value}>{opt.label}</Checkbox>
                                            </Col>
                                        ))}
                                    </Row>
                                </Checkbox.Group>
                            </div>
                        ))}
                        {errors?.permissions && (
                            <div style={{ color: "#ff4d4f", marginTop: 8 }}>{errors.permissions}</div>
                        )}
                    </Card>
                </Form>
            </Drawer>
        </div>
    );
}

