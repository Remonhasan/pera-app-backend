import { CloseOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { useForm } from "@inertiajs/react";
import {
    Alert,
    Button,
    Col,
    Drawer,
    Form,
    InputNumber,
    Row,
    Select,
    Switch,
} from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
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

function buildFromExpenseTarget(expenseTarget) {
    return {
        user_id: expenseTarget.user_id ?? expenseTarget.user?.id ?? null,
        budget_type_id:
            expenseTarget.budget_type_id ?? expenseTarget.budget_type?.id ?? null,
        month: expenseTarget.month != null ? Number(expenseTarget.month) : dayjs().month() + 1,
        year: expenseTarget.year != null ? Number(expenseTarget.year) : dayjs().year(),
        amount: expenseTarget.amount != null ? Number(expenseTarget.amount) : 0,
        status: Boolean(expenseTarget.status),
    };
}

export default function Edit({ expenseTarget, budgetTypes, members }) {
    const { t } = useAdminT();

    const memberOptions = useMemo(
        () =>
            (members || []).map((u) => ({
                value: u.id,
                label: u.phone ? `${u.name} (${u.phone})` : u.name,
            })),
        [members],
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

    const initial = useMemo(
        () => buildFromExpenseTarget(expenseTarget),
        [expenseTarget],
    );
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();
    const { data, setData, put, processing, errors } = useForm(initial);

    const showLoading = () => {
        const next = buildFromExpenseTarget(expenseTarget);
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
            put(route("administrative.expense-target.update", expenseTarget.id), {
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
                title={t("expenseTarget.editTitle")}
            />

            <Drawer
                closable
                destroyOnClose
                title={<p>{t("expenseTarget.editTitle")}</p>}
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
                                label={t("expenseTarget.memberLabel")}
                                name="user_id"
                                validateStatus={errors?.user_id ? "error" : ""}
                                help={errors?.user_id}
                            >
                                <Select
                                    showSearch
                                    allowClear
                                    optionFilterProp="label"
                                    placeholder={t("expenseTarget.memberPlaceholder")}
                                    options={memberOptions}
                                    value={data.user_id}
                                    onChange={(v) => {
                                        const next = v ?? null;
                                        setData("user_id", next);
                                        form.setFieldValue("user_id", next);
                                    }}
                                    size="large"
                                    className="expense-target-form-input"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("expenseTarget.budgetTypeLabel")}
                                name="budget_type_id"
                                rules={[
                                    {
                                        required: true,
                                        message: t("expenseTarget.budgetTypeRequired"),
                                    },
                                ]}
                                validateStatus={errors?.budget_type_id ? "error" : ""}
                                help={errors?.budget_type_id}
                            >
                                <Select
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder={t("expenseTarget.budgetTypePlaceholder")}
                                    options={budgetTypeOptions}
                                    value={data.budget_type_id}
                                    onChange={(v) => {
                                        setData("budget_type_id", v);
                                        form.setFieldValue("budget_type_id", v);
                                    }}
                                    size="large"
                                    className="expense-target-form-input"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("expenseTarget.monthLabel")}
                                name="month"
                                rules={[
                                    {
                                        required: true,
                                        message: t("expenseTarget.monthRequired"),
                                    },
                                ]}
                                validateStatus={errors?.month ? "error" : ""}
                                help={errors?.month}
                            >
                                <Select
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder={t("expenseTarget.monthPlaceholder")}
                                    options={monthOptions}
                                    value={data.month}
                                    onChange={(v) => {
                                        setData("month", v);
                                        form.setFieldValue("month", v);
                                    }}
                                    size="large"
                                    className="expense-target-form-input"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("expenseTarget.yearLabel")}
                                name="year"
                                rules={[
                                    {
                                        required: true,
                                        message: t("expenseTarget.yearRequired"),
                                    },
                                ]}
                                validateStatus={errors?.year ? "error" : ""}
                                help={errors?.year}
                            >
                                <InputNumber
                                    className="expense-target-form-input w-full"
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
                                label={t("expenseTarget.amountLabel")}
                                name="amount"
                                rules={[
                                    {
                                        required: true,
                                        message: t("expenseTarget.amountRequired"),
                                    },
                                ]}
                                validateStatus={errors?.amount ? "error" : ""}
                                help={errors?.amount}
                            >
                                <InputNumber
                                    className="expense-target-form-input w-full"
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
                .expense-target-form-input.ant-select .ant-select-selector,
                .expense-target-form-input.ant-input-number {
                    border-radius: 12px !important;
                    min-height: 46px;
                    font-size: 15px;
                    border-color: #d9d9d9;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }
                .expense-target-form-input.ant-select .ant-select-selector {
                    padding: 6px 16px !important;
                }
                .expense-target-form-input.ant-input-number .ant-input-number-input {
                    height: 44px;
                    padding: 0 16px;
                    font-size: 15px;
                }
                .expense-target-form-input.ant-select:hover .ant-select-selector,
                .expense-target-form-input.ant-input-number:hover {
                    border-color: #1e3a5f !important;
                }
                .expense-target-form-input.ant-select-focused .ant-select-selector,
                .expense-target-form-input.ant-input-number-focused {
                    border-color: #1e3a5f !important;
                    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.12) !important;
                }
            `}</style>
        </div>
    );
}
