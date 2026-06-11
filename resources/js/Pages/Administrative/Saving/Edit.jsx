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

function buildFromSaving(saving) {
    return {
        user_id: saving.user_id ?? saving.user?.id ?? null,
        bank_id: saving.bank_id ?? saving.bank?.id ?? null,
        saving_type_id:
            saving.saving_type_id ?? saving.saving_type?.id ?? null,
        month: saving.month != null ? Number(saving.month) : dayjs().month() + 1,
        year: saving.year != null ? Number(saving.year) : dayjs().year(),
        date: saving.date ? String(saving.date).slice(0, 10) : null,
        amount: saving.amount != null ? Number(saving.amount) : 0,
        description: saving.description ?? null,
        drive_link: saving.drive_link ?? null,
        image: saving.image ?? null,
        clear_saving_image: false,
        status: Boolean(saving.status),
    };
}

export default function Edit({ saving, members, banks, savingTypes }) {
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

    const monthOptions = useMemo(
        () =>
            MONTH_NAMES.map((name, index) => ({
                value: index + 1,
                label: name,
            })),
        [],
    );

    const initial = useMemo(() => buildFromSaving(saving), [saving]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();
    const { data, setData, put, post, processing, errors, transform } =
        useForm(initial);

    const imageUploadValue = useMemo(() => {
        if (data.clear_saving_image) return null;
        if (data.image instanceof File) return data.image;
        const path = data.image ?? saving.image;
        if (!path || typeof path !== "string") return null;
        if (/^https?:\/\//i.test(path)) return path;
        const baseName = path.split("/").pop() || "image";
        const url = route("administrative.saving.image", saving.id, true);
        return {
            uid: "-server-saving",
            name: baseName.length > 24 ? `${baseName.slice(0, 12)}…` : baseName,
            status: "done",
            url,
            thumbUrl: url,
        };
    }, [data.clear_saving_image, data.image, saving.id, saving.image]);

    const showLoading = () => {
        const next = buildFromSaving(saving);
        setData(() => next);
        setOpen(true);
        setLoading(true);
        setTimeout(() => {
            form.setFieldsValue({
                user_id: next.user_id,
                bank_id: next.bank_id,
                saving_type_id: next.saving_type_id,
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
            if (!out.clear_saving_image) {
                delete out.clear_saving_image;
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

        const url = route("administrative.saving.update", saving.id);
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
                title={t("saving.editTitle")}
            />

            <Drawer
                closable
                destroyOnClose
                title={<p>{t("saving.editTitle")}</p>}
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
                                label={t("saving.memberLabel")}
                                name="user_id"
                                rules={[
                                    {
                                        required: true,
                                        message: t("saving.memberRequired"),
                                    },
                                ]}
                                validateStatus={errors?.user_id ? "error" : ""}
                                help={errors?.user_id}
                            >
                                <Select
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder={t("saving.memberPlaceholder")}
                                    options={memberOptions}
                                    value={data.user_id}
                                    onChange={(v) => {
                                        setData("user_id", v);
                                        form.setFieldValue("user_id", v);
                                    }}
                                    size="large"
                                    className="saving-form-input"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("saving.bankLabel")}
                                name="bank_id"
                                rules={[
                                    {
                                        required: true,
                                        message: t("saving.bankRequired"),
                                    },
                                ]}
                                validateStatus={errors?.bank_id ? "error" : ""}
                                help={errors?.bank_id}
                            >
                                <Select
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder={t("saving.bankPlaceholder")}
                                    options={bankOptions}
                                    value={data.bank_id}
                                    onChange={(v) => {
                                        setData("bank_id", v);
                                        form.setFieldValue("bank_id", v);
                                    }}
                                    size="large"
                                    className="saving-form-input"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("saving.savingTypeLabel")}
                                name="saving_type_id"
                                rules={[
                                    {
                                        required: true,
                                        message: t("saving.savingTypeRequired"),
                                    },
                                ]}
                                validateStatus={errors?.saving_type_id ? "error" : ""}
                                help={errors?.saving_type_id}
                            >
                                <Select
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder={t("saving.savingTypePlaceholder")}
                                    options={savingTypeOptions}
                                    value={data.saving_type_id}
                                    onChange={(v) => {
                                        setData("saving_type_id", v);
                                        form.setFieldValue("saving_type_id", v);
                                    }}
                                    size="large"
                                    className="saving-form-input"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("saving.monthLabel")}
                                name="month"
                                rules={[
                                    {
                                        required: true,
                                        message: t("saving.monthRequired"),
                                    },
                                ]}
                                validateStatus={errors?.month ? "error" : ""}
                                help={errors?.month}
                            >
                                <Select
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder={t("saving.monthPlaceholder")}
                                    options={monthOptions}
                                    value={data.month}
                                    onChange={(v) => {
                                        setData("month", v);
                                        form.setFieldValue("month", v);
                                    }}
                                    size="large"
                                    className="saving-form-input"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("saving.yearLabel")}
                                name="year"
                                rules={[
                                    {
                                        required: true,
                                        message: t("saving.yearRequired"),
                                    },
                                ]}
                                validateStatus={errors?.year ? "error" : ""}
                                help={errors?.year}
                            >
                                <InputNumber
                                    className="saving-form-input w-full"
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
                                label={t("saving.dateLabel")}
                                name="date"
                                validateStatus={errors?.date ? "error" : ""}
                                help={errors?.date}
                            >
                                <DatePicker
                                    className="saving-form-input w-full"
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
                                label={t("saving.amountLabel")}
                                name="amount"
                                rules={[
                                    {
                                        required: true,
                                        message: t("saving.amountRequired"),
                                    },
                                ]}
                                validateStatus={errors?.amount ? "error" : ""}
                                help={errors?.amount}
                            >
                                <InputNumber
                                    className="saving-form-input w-full"
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
                                label={t("saving.descriptionLabel")}
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
                                    className="saving-form-input"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("saving.imageLabel")}
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
                                                clear_saving_image: false,
                                            });
                                        } else if (file?.url || file?.thumbUrl) {
                                            setData({
                                                ...data,
                                                image: saving.image,
                                                clear_saving_image: false,
                                            });
                                        } else {
                                            setData({
                                                ...data,
                                                image: null,
                                                clear_saving_image: true,
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
                .saving-form-input.ant-select .ant-select-selector,
                .saving-form-input.ant-picker,
                .saving-form-input.ant-input-number,
                .saving-form-input.ant-input {
                    border-radius: 12px !important;
                    min-height: 46px;
                    font-size: 15px;
                    border-color: #d9d9d9;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }
                .saving-form-input.ant-select .ant-select-selector,
                .saving-form-input.ant-picker {
                    padding: 6px 16px !important;
                }
                .saving-form-input.ant-input-number .ant-input-number-input,
                .saving-form-input.ant-input {
                    height: 44px;
                    padding: 0 16px;
                    font-size: 15px;
                }
                .saving-form-input.ant-select:hover .ant-select-selector,
                .saving-form-input.ant-picker:hover,
                .saving-form-input.ant-input-number:hover,
                .saving-form-input.ant-input:hover {
                    border-color: #1e3a5f !important;
                }
                .saving-form-input.ant-select-focused .ant-select-selector,
                .saving-form-input.ant-picker-focused,
                .saving-form-input.ant-input-number-focused,
                .saving-form-input.ant-input:focus {
                    border-color: #1e3a5f !important;
                    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.12) !important;
                }
            `}</style>
        </div>
    );
}
