import { CloseOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { useForm } from "@inertiajs/react";
import {
    Alert,
    Button,
    Col,
    DatePicker,
    Drawer,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Switch,
} from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useAdminT } from "../../../contexts/AdminI18nContext";

const { TextArea } = Input;

function buildInitial() {
    const now = dayjs();
    return {
        user_id: null,
        bank_id: null,
        saving_type_id: null,
        start_date: now.format("YYYY-MM-DD"),
        end_date: now.add(1, "month").format("YYYY-MM-DD"),
        amount: 0,
        description: "",
        drive_link: null,
        status: true,
        goal_status: "pending",
    };
}

export default function Create({ members, banks, savingTypes }) {
    const { t } = useAdminT();

    const memberOptions = useMemo(
        () =>
            (members || []).map((u) => ({
                value: u.id,
                label: u.phone ? `${u.name} (${u.phone})` : u.name,
            })),
        [members],
    );

    const bankOptions = useMemo(
        () =>
            (banks || []).map((bank) => ({
                value: bank.id,
                label: bank.name,
            })),
        [banks],
    );

    const savingTypeOptions = useMemo(
        () =>
            (savingTypes || []).map((type) => ({
                value: type.id,
                label: type.name,
            })),
        [savingTypes],
    );

    const goalStatusOptions = useMemo(
        () => [
            { value: "pending", label: t("goal.statusPending") },
            { value: "doing", label: t("goal.statusDoing") },
            { value: "achieved", label: t("goal.statusAchieved") },
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
            bank_id: payload.bank_id,
            saving_type_id: payload.saving_type_id,
            start_date: payload.start_date ? dayjs(payload.start_date) : null,
            end_date: payload.end_date ? dayjs(payload.end_date) : null,
            amount: payload.amount,
            description: payload.description,
            drive_link: payload.drive_link,
            status: payload.status,
            goal_status: payload.goal_status,
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
            post(route("administrative.goal.store"), {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
            });
        } catch {
            // validation
        }
    };

    const setDateField = (key, date) => {
        const v = date ? date.format("YYYY-MM-DD") : null;
        setData(key, v);
        form.setFieldValue(key, date);
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
                title={<p>{t("goal.createTitle")}</p>}
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
                                label={t("goal.memberLabel")}
                                name="user_id"
                                validateStatus={errors?.user_id ? "error" : ""}
                                help={errors?.user_id}
                            >
                                <Select
                                    showSearch
                                    allowClear
                                    placeholder={t("goal.memberPlaceholder")}
                                    options={memberOptions}
                                    optionFilterProp="label"
                                    value={data.user_id}
                                    onChange={(v) => {
                                        setData("user_id", v ?? null);
                                        form.setFieldValue("user_id", v);
                                    }}
                                    size="large"
                                    className="goal-form-select"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={t("goal.bankLabel")}
                                name="bank_id"
                                validateStatus={errors?.bank_id ? "error" : ""}
                                help={errors?.bank_id}
                            >
                                <Select
                                    showSearch
                                    allowClear
                                    placeholder={t("goal.bankPlaceholder")}
                                    options={bankOptions}
                                    optionFilterProp="label"
                                    value={data.bank_id}
                                    onChange={(v) => {
                                        setData("bank_id", v ?? null);
                                        form.setFieldValue("bank_id", v);
                                    }}
                                    size="large"
                                    className="goal-form-select"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={t("goal.savingTypeLabel")}
                                name="saving_type_id"
                                validateStatus={errors?.saving_type_id ? "error" : ""}
                                help={errors?.saving_type_id}
                            >
                                <Select
                                    showSearch
                                    allowClear
                                    placeholder={t("goal.savingTypePlaceholder")}
                                    options={savingTypeOptions}
                                    optionFilterProp="label"
                                    value={data.saving_type_id}
                                    onChange={(v) => {
                                        setData("saving_type_id", v ?? null);
                                        form.setFieldValue("saving_type_id", v);
                                    }}
                                    size="large"
                                    className="goal-form-select"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={t("goal.amountLabel")}
                                name="amount"
                                rules={[
                                    {
                                        required: true,
                                        message: t("goal.amountRequired"),
                                    },
                                ]}
                                validateStatus={errors?.amount ? "error" : ""}
                                help={errors?.amount}
                            >
                                <InputNumber
                                    className="goal-form-input"
                                    style={{ width: "100%" }}
                                    min={0}
                                    value={data.amount}
                                    onChange={(v) => {
                                        setData("amount", v ?? 0);
                                        form.setFieldValue("amount", v ?? 0);
                                    }}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={t("goal.startDateLabel")}
                                name="start_date"
                                rules={[
                                    {
                                        required: true,
                                        message: t("goal.startDateRequired"),
                                    },
                                ]}
                                validateStatus={errors?.start_date ? "error" : ""}
                                help={errors?.start_date}
                            >
                                <DatePicker
                                    className="goal-form-input"
                                    style={{ width: "100%" }}
                                    format="YYYY-MM-DD"
                                    value={
                                        data.start_date
                                            ? dayjs(data.start_date)
                                            : null
                                    }
                                    onChange={(date) =>
                                        setDateField("start_date", date)
                                    }
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={t("goal.endDateLabel")}
                                name="end_date"
                                rules={[
                                    {
                                        required: true,
                                        message: t("goal.endDateRequired"),
                                    },
                                ]}
                                validateStatus={errors?.end_date ? "error" : ""}
                                help={errors?.end_date}
                            >
                                <DatePicker
                                    className="goal-form-input"
                                    style={{ width: "100%" }}
                                    format="YYYY-MM-DD"
                                    value={
                                        data.end_date ? dayjs(data.end_date) : null
                                    }
                                    onChange={(date) =>
                                        setDateField("end_date", date)
                                    }
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={t("goal.goalStatusLabel")}
                                name="goal_status"
                                rules={[
                                    {
                                        required: true,
                                        message: t("goal.goalStatusRequired"),
                                    },
                                ]}
                                validateStatus={errors?.goal_status ? "error" : ""}
                                help={errors?.goal_status}
                            >
                                <Select
                                    placeholder={t("goal.goalStatusPlaceholder")}
                                    options={goalStatusOptions}
                                    value={data.goal_status}
                                    onChange={(v) => {
                                        setData("goal_status", v);
                                        form.setFieldValue("goal_status", v);
                                    }}
                                    size="large"
                                    className="goal-form-select"
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
                        <Col span={24}>
                            <Form.Item
                                label={t("goal.descriptionLabel")}
                                name="description"
                                validateStatus={errors?.description ? "error" : ""}
                                help={errors?.description}
                            >
                                <TextArea
                                    className="goal-form-textarea"
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
                        <Col span={24}>
                            <Form.Item
                                label={t("common.driveLinkLabel")}
                                name="drive_link"
                                validateStatus={errors?.drive_link ? "error" : ""}
                                help={errors?.drive_link}
                            >
                                <Input
                                    value={data.drive_link ?? ""}
                                    placeholder={t("common.driveLinkPlaceholder")}
                                    onChange={(e) => {
                                        const v = e.target.value || null;
                                        setData("drive_link", v);
                                        form.setFieldValue("drive_link", v);
                                    }}
                                    size="large"
                                    className="goal-form-input"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Drawer>
            <style>{`
                .goal-form-input.ant-input,
                .goal-form-textarea.ant-input,
                .goal-form-input.ant-picker,
                .goal-form-input.ant-input-number {
                    border-radius: 12px !important;
                    font-size: 15px;
                    border-color: #d9d9d9;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }
                .goal-form-input.ant-input,
                .goal-form-input.ant-picker,
                .goal-form-input.ant-input-number {
                    min-height: 46px;
                }
                .goal-form-textarea.ant-input {
                    padding: 10px 16px !important;
                }
                .goal-form-select .ant-select-selector {
                    border-radius: 12px !important;
                    min-height: 46px !important;
                    padding: 6px 12px !important;
                }
            `}</style>
        </div>
    );
}
