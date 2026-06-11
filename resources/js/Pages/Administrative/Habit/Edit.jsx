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

const { TextArea } = Input;

function buildFormState(habit) {
    return {
        user_ids: habit.user_ids ?? [],
        name: habit.name ?? "",
        description: habit.description ?? "",
        status: Boolean(habit.status),
        habit_status: habit.habit_status ?? "pending",
    };
}

export default function Edit({ habit, members }) {
    const { t } = useAdminT();
    const initial = useMemo(() => buildFormState(habit), [habit]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();
    const { data, setData, put, processing, errors } = useForm(initial);

    const memberOptions = useMemo(
        () =>
            (members || []).map((u) => ({
                value: u.id,
                label: u.phone ? `${u.name} (${u.phone})` : u.name,
            })),
        [members],
    );

    const habitStatusOptions = useMemo(
        () => [
            { value: "pending", label: t("habit.statusPending") },
            { value: "adapted", label: t("habit.statusAdapted") },
            { value: "improved", label: t("habit.statusImproved") },
        ],
        [t],
    );

    const showLoading = () => {
        const next = buildFormState(habit);
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
            put(route("administrative.habit.update", habit.id), {
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
                title={t("habit.editTitle")}
            />

            <Drawer
                closable
                destroyOnClose
                title={<p>{t("habit.editTitle")}</p>}
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
                                label={t("habit.membersLabel")}
                                name="user_ids"
                                rules={[
                                    {
                                        required: true,
                                        message: t("habit.membersRequired"),
                                    },
                                ]}
                                validateStatus={errors?.user_ids ? "error" : ""}
                                help={errors?.user_ids}
                            >
                                <Select
                                    mode="multiple"
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder={t("habit.membersPlaceholder")}
                                    options={memberOptions}
                                    value={data.user_ids}
                                    onChange={(v) => {
                                        setData("user_ids", v || []);
                                        form.setFieldValue("user_ids", v || []);
                                    }}
                                    size="large"
                                    className="habit-form-select"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={t("habit.nameLabel")}
                                name="name"
                                rules={[
                                    {
                                        required: true,
                                        message: t("habit.nameRequired"),
                                    },
                                ]}
                                validateStatus={errors?.name ? "error" : ""}
                                help={errors?.name}
                            >
                                <Input
                                    className="habit-form-input"
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
                                label={t("habit.habitStatusLabel")}
                                name="habit_status"
                                rules={[
                                    {
                                        required: true,
                                        message: t("habit.habitStatusRequired"),
                                    },
                                ]}
                                validateStatus={errors?.habit_status ? "error" : ""}
                                help={errors?.habit_status}
                            >
                                <Select
                                    placeholder={t("habit.habitStatusPlaceholder")}
                                    options={habitStatusOptions}
                                    value={data.habit_status}
                                    onChange={(v) => {
                                        setData("habit_status", v);
                                        form.setFieldValue("habit_status", v);
                                    }}
                                    size="large"
                                    className="habit-form-select"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item
                                label={t("habit.descriptionLabel")}
                                name="description"
                                validateStatus={errors?.description ? "error" : ""}
                                help={errors?.description}
                            >
                                <TextArea
                                    className="habit-form-textarea"
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
                .habit-form-input.ant-input,
                .habit-form-textarea.ant-input {
                    border-radius: 12px !important;
                    font-size: 15px;
                    border-color: #d9d9d9;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }
                .habit-form-input.ant-input {
                    min-height: 46px;
                    padding: 10px 16px !important;
                }
                .habit-form-textarea.ant-input {
                    padding: 10px 16px !important;
                }
                .habit-form-input.ant-input:hover,
                .habit-form-textarea.ant-input:hover {
                    border-color: #1e3a5f !important;
                }
                .habit-form-input.ant-input:focus,
                .habit-form-input.ant-input-focused,
                .habit-form-textarea.ant-input:focus,
                .habit-form-textarea.ant-input-focused {
                    border-color: #1e3a5f !important;
                    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.12) !important;
                }
                .habit-form-select .ant-select-selector {
                    border-radius: 12px !important;
                    min-height: 46px !important;
                    padding: 6px 12px !important;
                }
            `}</style>
        </div>
    );
}
