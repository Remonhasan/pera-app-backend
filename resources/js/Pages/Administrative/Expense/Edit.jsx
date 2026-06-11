import { CloseOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
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

function buildFromExpense(expense) {
    return {
        user_id: expense.user_id ?? expense.user?.id ?? null,
        expense_type_id:
            expense.expense_type_id ?? expense.expense_type?.id ?? null,
        budget_type_id:
            expense.budget_type_id ?? expense.budget_type?.id ?? null,
        name: expense.name ?? "",
        month: expense.month != null ? Number(expense.month) : dayjs().month() + 1,
        year: expense.year != null ? Number(expense.year) : dayjs().year(),
        date: expense.date ? String(expense.date).slice(0, 10) : null,
        amount: expense.amount != null ? Number(expense.amount) : 0,
        description: expense.description ?? null,
        drive_link: expense.drive_link ?? null,
        image: expense.image ?? null,
        clear_expense_image: false,
        status: Boolean(expense.status),
    };
}

export default function Edit({ expense, members, expenseTypes, budgetTypes }) {
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

    const initial = useMemo(() => buildFromExpense(expense), [expense]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();
    const { data, setData, put, post, processing, errors, transform } =
        useForm(initial);

    const imageUploadValue = useMemo(() => {
        if (data.clear_expense_image) return null;
        if (data.image instanceof File) return data.image;
        const path = data.image ?? expense.image;
        if (!path || typeof path !== "string") return null;
        if (/^https?:\/\//i.test(path)) return path;
        const baseName = path.split("/").pop() || "image";
        const url = route("administrative.expense.image", expense.id, true);
        return {
            uid: "-server-expense",
            name: baseName.length > 24 ? `${baseName.slice(0, 12)}…` : baseName,
            status: "done",
            url,
            thumbUrl: url,
        };
    }, [data.clear_expense_image, data.image, expense.id, expense.image]);

    const showLoading = () => {
        const next = buildFromExpense(expense);
        setData(() => next);
        setOpen(true);
        setLoading(true);
        setTimeout(() => {
            form.setFieldsValue({
                user_id: next.user_id,
                expense_type_id: next.expense_type_id,
                budget_type_id: next.budget_type_id,
                name: next.name,
                month: next.month,
                year: next.year,
                date: next.date ? dayjs(next.date) : null,
                amount: next.amount,
                description: next.description,
                drive_link: next.drive_link,
                status: next.status,
            });
            setLoading(false);
        }, 0);
    };

    const handleSubmit = async () => {
        try {
            await form.validateFields();
        } catch {
            return;
        }

        const hasNewImageFile = data.image instanceof File;

        transform((formData) => {
            const out = { ...formData };
            if (!(out.image instanceof File)) {
                delete out.image;
            }
            if (!out.clear_expense_image) {
                delete out.clear_expense_image;
            }
            if (hasNewImageFile) {
                out._method = "put";
            }
            return out;
        });

        const visitOptions = {
            forceFormData: hasNewImageFile,
            preserveScroll: true,
            onSuccess: () => setOpen(false),
            onFinish: () => transform((d) => d),
        };

        const url = route("administrative.expense.update", expense.id);
        if (hasNewImageFile) {
            post(url, visitOptions);
        } else {
            put(url, visitOptions);
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
                type="default"
                icon={<EditOutlined />}
                onClick={showLoading}
                title={t("expense.editTitle")}
            />

            <Drawer
                closable
                destroyOnClose
                title={<p>{t("expense.editTitle")}</p>}
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
                                    value={imageUploadValue}
                                    onChange={(file) => {
                                        if (file?.originFileObj) {
                                            setData({
                                                ...data,
                                                image: file.originFileObj,
                                                clear_expense_image: false,
                                            });
                                        } else if (file?.url || file?.thumbUrl) {
                                            setData({
                                                ...data,
                                                image: expense.image,
                                                clear_expense_image: false,
                                            });
                                        } else {
                                            setData({
                                                ...data,
                                                image: null,
                                                clear_expense_image: true,
                                            });
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
