import { CloseOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
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

const { TextArea } = Input;

function buildInitial() {
    return {
        user_id: null,
        name: "",
        description: "",
        status: true,
        task_status: "pending",
    };
}

export default function Create({ members }) {
    const { t } = useAdminT();

    const memberOptions = useMemo(
        () =>
            (members || []).map((u) => ({
                value: u.id,
                label: u.phone ? `${u.name} (${u.phone})` : u.name,
            })),
        [members],
    );

    const taskStatusOptions = useMemo(
        () => [
            { value: "pending", label: t("task.statusPending") },
            { value: "doing", label: t("task.statusDoing") },
            { value: "completed", label: t("task.statusCompleted") },
        ],
        [t],
    );

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();
    const initial = useMemo(() => buildInitial(), []);
    const { data, setData, post, processing, errors } = useForm(initial);

    const syncFormFields = (payload) => {
        form.setFieldsValue({
            user_id: payload.user_id,
            name: payload.name,
            description: payload.description,
            status: payload.status,
            task_status: payload.task_status,
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
            post(route("administrative.task.store"), {
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
                title={<p>{t("task.createTitle")}</p>}
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
                                label={t("task.memberLabel")}
                                name="user_id"
                                rules={[
                                    {
                                        required: true,
                                        message: t("task.memberRequired"),
                                    },
                                ]}
                                validateStatus={errors?.user_id ? "error" : ""}
                                help={errors?.user_id}
                            >
                                <Select
                                    showSearch
                                    allowClear
                                    placeholder={t("task.memberPlaceholder")}
                                    options={memberOptions}
                                    optionFilterProp="label"
                                    value={data.user_id}
                                    onChange={(v) => {
                                        setData("user_id", v);
                                        form.setFieldValue("user_id", v);
                                    }}
                                    size="large"
                                    className="task-form-select"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={t("task.nameLabel")}
                                name="name"
                                rules={[
                                    {
                                        required: true,
                                        message: t("task.nameRequired"),
                                    },
                                ]}
                                validateStatus={errors?.name ? "error" : ""}
                                help={errors?.name}
                            >
                                <Input
                                    className="task-form-input"
                                    value={data.name}
                                    onChange={(e) => {
                                        setData("name", e.target.value);
                                        form.setFieldValue("name", e.target.value);
                                    }}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item
                                label={t("task.descriptionLabel")}
                                name="description"
                                validateStatus={errors?.description ? "error" : ""}
                                help={errors?.description}
                            >
                                <TextArea
                                    className="task-form-textarea"
                                    rows={4}
                                    value={data.description}
                                    onChange={(e) => {
                                        setData("description", e.target.value);
                                        form.setFieldValue(
                                            "description",
                                            e.target.value,
                                        );
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={t("task.taskStatusLabel")}
                                name="task_status"
                                rules={[
                                    {
                                        required: true,
                                        message: t("task.taskStatusRequired"),
                                    },
                                ]}
                                validateStatus={errors?.task_status ? "error" : ""}
                                help={errors?.task_status}
                            >
                                <Select
                                    placeholder={t("task.taskStatusPlaceholder")}
                                    options={taskStatusOptions}
                                    value={data.task_status}
                                    onChange={(v) => {
                                        setData("task_status", v);
                                        form.setFieldValue("task_status", v);
                                    }}
                                    size="large"
                                    className="task-form-select"
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
                .task-form-input.ant-input,
                .task-form-textarea.ant-input {
                    border-radius: 12px !important;
                    font-size: 15px;
                    border-color: #d9d9d9;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }
                .task-form-input.ant-input {
                    min-height: 46px;
                    padding: 10px 16px !important;
                }
                .task-form-textarea.ant-input {
                    padding: 10px 16px !important;
                }
                .task-form-input.ant-input:hover,
                .task-form-textarea.ant-input:hover {
                    border-color: #1e3a5f !important;
                }
                .task-form-input.ant-input:focus,
                .task-form-input.ant-input-focused,
                .task-form-textarea.ant-input:focus,
                .task-form-textarea.ant-input-focused {
                    border-color: #1e3a5f !important;
                    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.12) !important;
                }
                .task-form-select .ant-select-selector {
                    border-radius: 12px !important;
                    min-height: 46px !important;
                    padding: 6px 12px !important;
                }
            `}</style>
        </div>
    );
}
