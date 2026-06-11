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
import SingleImageUpload from "../../../components/reusable/SingleImageUpload";
import { useAdminT } from "../../../contexts/AdminI18nContext";

const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

function buildInitial() {
    const now = dayjs();
    return {
        user_id: null,
        expense_type_id: null,
        budget_type_id: null,
        name: "",
        month: now.month() + 1,
        year: now.year(),
        date: null,
        amount: 0,
        description: null,
        drive_link: null,
        image: null,
        status: true,
    };
}

export default function Create({ members, expenseTypes, budgetTypes }) {
    const { t } = useAdminT();

    const memberOptions = useMemo(
        () =>
            (members || []).map((u) => ({
                value: u.id,
                label: u.phone ? `${u.name} (${u.phone})` : u.name,
            })),
        [members],
    );

    const expenseTypeOptions = useMemo(
        () =>
            (expenseTypes || []).map((type) => ({
                value: type.id,
                label: type.name,
            })),
        [expenseTypes],
    );

    const budgetTypeOptions = useMemo(
        () =>
            (budgetTypes || []).map((type) => ({
                value: type.id,
                label: type.name,
            })),
        [budgetTypes],
    );

    const monthOptions = useMemo(
        () =>
            MONTH_NAMES.map((name, index) => ({
                value: index + 1,
                label: name,
            })),
        [],
    );

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();
    const initial = useMemo(() => buildInitial(), []);
    const { data, setData, post, processing, errors } = useForm(initial);

    const syncFormFields = (payload) => {
        form.setFieldsValue({
            user_id: payload.user_id,
            expense_type_id: payload.expense_type_id,
            budget_type_id: payload.budget_type_id,
            name: payload.name,
            month: payload.month,
            year: payload.year,
            date: payload.date ? dayjs(payload.date) : null,
            amount: payload.amount,
            description: payload.description,
            drive_link: payload.drive_link,
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
            post(route("administrative.expense.store"), {
                forceFormData: data.image instanceof File,
                preserveScroll: true,
                onSuccess: () => setOpen(false),
            });
        } catch {
            // validation
        }
    };

    const setDateField = (date) => {
        const v = date ? date.format("YYYY-MM-DD") : null;
        setData("date", v);
        form.setFieldValue("date", date ?? null);
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
                title={<p>{t("expense.createTitle")}</p>}
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
                                label={t("expense.memberLabel")}
                                name="user_id"
                                rules={[
                                    {
                                        required: true,
                                        message: t("expense.memberRequired"),
                                    },
                                ]}
                                validateStatus={errors?.user_id ? "error" : ""}
                                help={errors?.user_id}
                            >
                                <Select
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder={t("expense.memberPlaceholder")}
                                    options={memberOptions}
                                    value={data.user_id}
                                    onChange={(v) => {
                                        setData("user_id", v);
                                        form.setFieldValue("user_id", v);
                                    }}
                                    size="large"
                                    className="expense-form-input"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("expense.expenseTypeLabel")}
                                name="expense_type_id"
                                rules={[
                                    {
                                        required: true,
                                        message: t("expense.expenseTypeRequired"),
                                    },
                                ]}
                                validateStatus={errors?.expense_type_id ? "error" : ""}
                                help={errors?.expense_type_id}
                            >
                                <Select
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder={t("expense.expenseTypePlaceholder")}
                                    options={expenseTypeOptions}
                                    value={data.expense_type_id}
                                    onChange={(v) => {
                                        setData("expense_type_id", v);
                                        form.setFieldValue("expense_type_id", v);
                                    }}
                                    size="large"
                                    className="expense-form-input"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("budget.budgetTypeLabel")}
                                name="budget_type_id"
                                validateStatus={errors?.budget_type_id ? "error" : ""}
                                help={errors?.budget_type_id}
                            >
                                <Select
                                    showSearch
                                    allowClear
                                    optionFilterProp="label"
                                    placeholder={t("budget.budgetTypePlaceholder")}
                                    options={budgetTypeOptions}
                                    value={data.budget_type_id}
                                    onChange={(v) => {
                                        const next = v ?? null;
                                        setData("budget_type_id", next);
                                        form.setFieldValue("budget_type_id", next);
                                    }}
                                    size="large"
                                    className="expense-form-input"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("expense.nameLabel")}
                                name="name"
                                rules={[
                                    {
                                        required: true,
                                        message: t("expense.nameRequired"),
                                    },
                                ]}
                                validateStatus={errors?.name ? "error" : ""}
                                help={errors?.name}
                            >
                                <Input
                                    className="expense-form-input"
                                    value={data.name}
                                    onChange={(e) => {
                                        setData("name", e.target.value);
                                        form.setFieldValue("name", e.target.value);
                                    }}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("expense.monthLabel")}
                                name="month"
                                rules={[
                                    {
                                        required: true,
                                        message: t("expense.monthRequired"),
                                    },
                                ]}
                                validateStatus={errors?.month ? "error" : ""}
                                help={errors?.month}
                            >
                                <Select
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder={t("expense.monthPlaceholder")}
                                    options={monthOptions}
                                    value={data.month}
                                    onChange={(v) => {
                                        setData("month", v);
                                        form.setFieldValue("month", v);
                                    }}
                                    size="large"
                                    className="expense-form-input"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("expense.yearLabel")}
                                name="year"
                                rules={[
                                    {
                                        required: true,
                                        message: t("expense.yearRequired"),
                                    },
                                ]}
                                validateStatus={errors?.year ? "error" : ""}
                                help={errors?.year}
                            >
                                <InputNumber
                                    className="expense-form-input w-full"
                                    min={2000}
                                    max={2100}
                                    style={{ width: "100%" }}
                                    value={data.year}
                                    onChange={(v) => {
                                        const next = v ?? dayjs().year();
                                        setData("year", next);
                                        form.setFieldValue("year", next);
                                    }}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("expense.dateLabel")}
                                name="date"
                                validateStatus={errors?.date ? "error" : ""}
                                help={errors?.date}
                            >
                                <DatePicker
                                    className="expense-form-input w-full"
                                    style={{ width: "100%" }}
                                    format="YYYY-MM-DD"
                                    value={data.date ? dayjs(data.date) : null}
                                    onChange={setDateField}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("expense.amountLabel")}
                                name="amount"
                                rules={[
                                    {
                                        required: true,
                                        message: t("expense.amountRequired"),
                                    },
                                ]}
                                validateStatus={errors?.amount ? "error" : ""}
                                help={errors?.amount}
                            >
                                <InputNumber
                                    className="expense-form-input w-full"
                                    min={0}
                                    step={0.01}
                                    style={{ width: "100%" }}
                                    value={data.amount}
                                    onChange={(v) => {
                                        const next = v ?? 0;
                                        setData("amount", next);
                                        form.setFieldValue("amount", next);
                                    }}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("expense.descriptionLabel")}
                                name="description"
                                validateStatus={errors?.description ? "error" : ""}
                                help={errors?.description}
                            >
                                <Input.TextArea
                                    rows={3}
                                    value={data.description ?? ""}
                                    onChange={(e) => {
                                        const v = e.target.value || null;
                                        setData("description", v);
                                        form.setFieldValue("description", v);
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
                                    className="expense-form-input"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("expense.imageLabel")}
                                validateStatus={errors?.image ? "error" : ""}
                                help={errors?.image}
                            >
                                <SingleImageUpload
                                    value={data.image}
                                    onChange={(file) => {
                                        if (file?.originFileObj) {
                                            setData("image", file.originFileObj);
                                        } else {
                                            setData("image", null);
                                        }
                                    }}
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
                .expense-form-input.ant-select .ant-select-selector,
                .expense-form-input.ant-picker,
                .expense-form-input.ant-input-number,
                .expense-form-input.ant-input {
                    border-radius: 12px !important;
                    min-height: 46px;
                    font-size: 15px;
                    border-color: #d9d9d9;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }
                .expense-form-input.ant-select .ant-select-selector,
                .expense-form-input.ant-picker {
                    padding: 6px 16px !important;
                }
                .expense-form-input.ant-input-number .ant-input-number-input,
                .expense-form-input.ant-input {
                    height: 44px;
                    padding: 0 16px;
                    font-size: 15px;
                }
                .expense-form-input.ant-select:hover .ant-select-selector,
                .expense-form-input.ant-picker:hover,
                .expense-form-input.ant-input-number:hover,
                .expense-form-input.ant-input:hover {
                    border-color: #1e3a5f !important;
                }
                .expense-form-input.ant-select-focused .ant-select-selector,
                .expense-form-input.ant-picker-focused,
                .expense-form-input.ant-input-number-focused,
                .expense-form-input.ant-input:focus {
                    border-color: #1e3a5f !important;
                    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.12) !important;
                }
            `}</style>
        </div>
    );
}
