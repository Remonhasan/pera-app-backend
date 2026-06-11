import { CloseOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { useForm } from "@inertiajs/react";
import { Button, Col, Drawer, Form, Input, Row, Alert } from "antd";
import { useState, useEffect } from "react";

export default function Edit({ permission }) {
    const title = "Edit Permission";
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();

    const { data, setData, put, processing, errors } = useForm({
        name: permission.name ?? "",
        label: permission.label ?? "",
    });

    const showLoading = () => {
        setOpen(true);
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 800);
    };

    useEffect(() => {
        if (open) {
            // Sync form with permission data when drawer opens
            const formValues = {
                name: permission.name ?? "",
                label: permission.label ?? "",
            };
            setTimeout(() => {
                form.setFieldsValue(formValues);
            }, 0);
        } else {
            // Reset form when drawer closes
            form.resetFields();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleSubmit = async () => {
        try {
            // Validate form before submitting
            await form.validateFields();

            // If validation passes, submit to server
            put(route("administrative.permission.update", permission.id), {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
                onError: (errors) => console.log(errors),
            });
        } catch (errorInfo) {
            // Validation failed, Ant Design will show errors
            console.log("Validation failed:", errorInfo);
        }
    };

    const handleClose = () => {
        form.resetFields();
        setOpen(false);
    };

    // Gather all error messages for top summary
    const allErrors = Object.entries(errors).flatMap(([key, value]) => {
        if (typeof value === "string") return [value];
        if (typeof value === "object")
            return Object.entries(value).flatMap(([subKey, subValue]) => {
                if (typeof subValue === "string") return [subValue];
                if (typeof subValue === "object")
                    return Object.values(subValue);
                return [];
            });
        return [];
    });

    return (
        <div>
            <Button
                color="primary" variant="outlined"
                icon={<EditOutlined />}
                onClick={showLoading}
            ></Button>
            <Drawer
                closable
                destroyOnClose
                title={title}
                placement="right"
                open={open}
                size="large"
                onClose={handleClose}
                headerStyle={{
                    backgroundColor: '#1e3a5f',
                    color: '#ffffff',
                    borderBottom: 'none',
                }}
                bodyStyle={{
                    padding: '24px',
                }}
                footer={
                    <div style={{ textAlign: "right" }}>
                        <Button
                            icon={<CloseOutlined />}
                            onClick={handleClose}
                            style={{ marginRight: 8 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={processing}
                            onClick={handleSubmit}
                            className="submit-btn"
                            style={{
                                backgroundColor: '#1e3a5f',
                                borderColor: '#1e3a5f',
                            }}
                        >
                            Submit
                        </Button>
                    </div>
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    autoComplete="off"
                    onValuesChange={(changedValues) => {
                        // Sync Ant Design Form values with Inertia form data
                        Object.keys(changedValues).forEach((key) => {
                            setData(key, changedValues[key]);
                        });
                    }}
                >
                    {/* Top-level error summary */}
                    {allErrors.length > 0 && (
                        <Alert
                            type="error"
                            description={
                                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                                    {allErrors.map((err, idx) => (
                                        <li key={idx}>{err}</li>
                                    ))}
                                </ul>
                            }
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="label"
                                label={<span className="form-label">Label Name</span>}
                                validateStatus={errors?.label ? "error" : ""}
                                help={errors?.label}
                                validateTrigger={["onChange", "onBlur"]}
                                rules={[
                                    {
                                        required: true,
                                        message: "The Label Name field is required.",
                                    },
                                    {
                                        min: 2,
                                        message: "Label Name must be at least 2 characters.",
                                    },
                                ]}
                            >
                                <Input
                                    className="text-input"
                                    placeholder="Enter Permission Label"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="name"
                                label={<span className="form-label">Permission Name</span>}
                                validateStatus={errors?.name ? "error" : ""}
                                help={errors?.name}
                                validateTrigger={["onChange", "onBlur"]}
                                rules={[
                                    {
                                        required: true,
                                        message: "The Permission Name field is required.",
                                    },
                                    {
                                        min: 2,
                                        message: "Permission Name must be at least 2 characters.",
                                    },
                                ]}
                            >
                                <Input
                                    placeholder="Enter Permission Name"
                                    className="text-input"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Drawer>
            <style>{`
                /* Deep green header styling */
                .ant-drawer-header {
                    background-color: #1e3a5f !important;
                }
                .ant-drawer-header .ant-drawer-title {
                    color: #ffffff !important;
                    font-weight: 600 !important;
                    font-size: 18px !important;
                }
                .ant-drawer-header .ant-drawer-close {
                    color: #ffffff !important;
                }
                .ant-drawer-header .ant-drawer-close:hover {
                    color: rgba(255, 255, 255, 0.8) !important;
                }
                
                /* Form styling improvements */
                .form-label {
                    font-weight: 500 !important;
                    color: #262626 !important;
                    font-size: 14px !important;
                }
                
                .text-input {
                    border-radius: 6px !important;
                    transition: all 0.3s ease !important;
                }
                
                .text-input:hover {
                    border-color: #1e3a5f !important;
                }
                
                .text-input:focus {
                    border-color: #1e3a5f !important;
                    box-shadow: 0 0 0 2px rgba(4, 76, 66, 0.1) !important;
                }
                
                .ant-form-item-label > label.ant-form-item-required:not(.ant-form-item-required-mark-optional)::before {
                    color: #ff4d4f !important;
                }
                
                .ant-form-item {
                    margin-bottom: 20px !important;
                }
                
                .ant-input-lg, .ant-select-lg {
                    height: 42px !important;
                }
                
                .ant-input-lg {
                    padding: 8px 12px !important;
                }
                
                .submit-btn {
                    font-weight: 500 !important;
                    border-radius: 6px !important;
                }
                
                .ant-drawer-body {
                    background-color: #fafafa !important;
                }
            `}</style>
        </div>
    );
}
