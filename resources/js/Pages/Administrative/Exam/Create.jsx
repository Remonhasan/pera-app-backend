import {
    CloseOutlined,
    PlusOutlined,
    SaveOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import { useForm } from "@inertiajs/react";
import {
    Alert,
    Button,
    Col,
    DatePicker,
    Drawer,
    Form,
    Input,
    Row,
    Select,
    Switch,
    Upload,
} from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import MultipleImageUpload from "../../../components/reusable/MultipleImageUpload";
import { useAdminT } from "../../../contexts/AdminI18nContext";

function buildInitial() {
    return {
        job_type_id: null,
        name: "",
        exam_date: null,
        expected_exam_date: null,
        application_file: null,
        admit_card_file: null,
        images: [],
        status: true,
        exam_status: "pending",
    };
}

function extractNewFiles(fileList) {
    return (fileList || [])
        .map((file) => file?.originFileObj)
        .filter((file) => file instanceof File);
}

export default function Create({ jobTypes }) {
    const { t } = useAdminT();

    const jobTypeOptions = useMemo(
        () =>
            (jobTypes || []).map((type) => ({
                value: type.id,
                label: type.name,
            })),
        [jobTypes],
    );

    const examStatusOptions = useMemo(
        () => [
            { value: "pending", label: t("exam.statusPending") },
            { value: "completed", label: t("exam.statusCompleted") },
            { value: "passed", label: t("exam.statusPassed") },
        ],
        [t],
    );

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [applicationFileList, setApplicationFileList] = useState([]);
    const [admitCardFileList, setAdmitCardFileList] = useState([]);
    const [form] = Form.useForm();
    const initial = useMemo(() => buildInitial(), []);
    const { data, setData, post, processing, errors, transform } =
        useForm(initial);

    const syncFormFields = (payload) => {
        form.setFieldsValue({
            job_type_id: payload.job_type_id,
            name: payload.name,
            exam_date: payload.exam_date ? dayjs(payload.exam_date) : null,
            expected_exam_date: payload.expected_exam_date
                ? dayjs(payload.expected_exam_date)
                : null,
            exam_status: payload.exam_status,
            status: payload.status,
        });
    };

    const showLoading = () => {
        const fresh = buildInitial();
        setData(fresh);
        setApplicationFileList([]);
        setAdmitCardFileList([]);
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
        } catch {
            return;
        }

        const hasUploads =
            data.application_file instanceof File ||
            data.admit_card_file instanceof File ||
            (data.images || []).some((f) => f instanceof File);

        transform((formData) => formData);

        post(route("administrative.exam.store"), {
            forceFormData: hasUploads,
            preserveScroll: true,
            onSuccess: () => setOpen(false),
            onFinish: () => transform((d) => d),
        });
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
                title={<p>{t("exam.createTitle")}</p>}
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
                                label={t("exam.nameLabel")}
                                name="name"
                                rules={[
                                    {
                                        required: true,
                                        message: t("exam.nameRequired"),
                                    },
                                ]}
                                validateStatus={errors?.name ? "error" : ""}
                                help={errors?.name}
                            >
                                <Input
                                    className="exam-form-input"
                                    value={data.name}
                                    placeholder={t("exam.namePlaceholder")}
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
                                label={t("exam.jobTypeLabel")}
                                name="job_type_id"
                                validateStatus={errors?.job_type_id ? "error" : ""}
                                help={errors?.job_type_id}
                            >
                                <Select
                                    showSearch
                                    allowClear
                                    placeholder={t("exam.jobTypePlaceholder")}
                                    options={jobTypeOptions}
                                    optionFilterProp="label"
                                    value={data.job_type_id}
                                    onChange={(v) => {
                                        setData("job_type_id", v ?? null);
                                        form.setFieldValue("job_type_id", v);
                                    }}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={t("exam.examDateLabel")}
                                name="exam_date"
                                validateStatus={errors?.exam_date ? "error" : ""}
                                help={errors?.exam_date}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    format="YYYY-MM-DD"
                                    value={
                                        data.exam_date ? dayjs(data.exam_date) : null
                                    }
                                    onChange={(date) => setDateField("exam_date", date)}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={t("exam.expectedExamDateLabel")}
                                name="expected_exam_date"
                                validateStatus={
                                    errors?.expected_exam_date ? "error" : ""
                                }
                                help={errors?.expected_exam_date}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    format="YYYY-MM-DD"
                                    value={
                                        data.expected_exam_date
                                            ? dayjs(data.expected_exam_date)
                                            : null
                                    }
                                    onChange={(date) =>
                                        setDateField("expected_exam_date", date)
                                    }
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={t("exam.examStatusLabel")}
                                name="exam_status"
                                rules={[
                                    {
                                        required: true,
                                        message: t("exam.examStatusRequired"),
                                    },
                                ]}
                                validateStatus={errors?.exam_status ? "error" : ""}
                                help={errors?.exam_status}
                            >
                                <Select
                                    placeholder={t("exam.examStatusPlaceholder")}
                                    options={examStatusOptions}
                                    value={data.exam_status}
                                    onChange={(v) => {
                                        setData("exam_status", v);
                                        form.setFieldValue("exam_status", v);
                                    }}
                                    size="large"
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
                                label={t("exam.applicationFileLabel")}
                                validateStatus={
                                    errors?.application_file ? "error" : ""
                                }
                                help={errors?.application_file}
                            >
                                <Upload
                                    maxCount={1}
                                    beforeUpload={() => false}
                                    fileList={applicationFileList}
                                    onChange={({ fileList }) => {
                                        setApplicationFileList(fileList);
                                        const file = fileList[0]?.originFileObj ?? null;
                                        setData("application_file", file);
                                    }}
                                >
                                    <Button icon={<UploadOutlined />}>
                                        {t("exam.uploadFile")}
                                    </Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("exam.admitCardFileLabel")}
                                validateStatus={errors?.admit_card_file ? "error" : ""}
                                help={errors?.admit_card_file}
                            >
                                <Upload
                                    maxCount={1}
                                    beforeUpload={() => false}
                                    fileList={admitCardFileList}
                                    onChange={({ fileList }) => {
                                        setAdmitCardFileList(fileList);
                                        const file = fileList[0]?.originFileObj ?? null;
                                        setData("admit_card_file", file);
                                    }}
                                >
                                    <Button icon={<UploadOutlined />}>
                                        {t("exam.uploadFile")}
                                    </Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("exam.imagesLabel")}
                                validateStatus={errors?.images ? "error" : ""}
                                help={errors?.images}
                            >
                                <MultipleImageUpload
                                    value={data.images}
                                    onChange={(fileList) => {
                                        setData("images", extractNewFiles(fileList));
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Drawer>
            <style>{`
                .exam-form-input.ant-input {
                    border-radius: 12px !important;
                    min-height: 46px;
                    height: 44px;
                    padding: 0 16px;
                    font-size: 15px;
                    border-color: #d9d9d9;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }
                .exam-form-input.ant-input:hover {
                    border-color: #1e3a5f !important;
                }
                .exam-form-input.ant-input:focus {
                    border-color: #1e3a5f !important;
                    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.12) !important;
                }
            `}</style>
        </div>
    );
}
