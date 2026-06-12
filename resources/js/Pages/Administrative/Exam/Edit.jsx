import {
    CloseOutlined,
    EditOutlined,
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

function buildFromExam(exam) {
    return {
        job_type_id: exam.job_type_id ?? exam.job_type?.id ?? null,
        name: exam.name ?? "",
        exam_date: exam.exam_date ?? null,
        expected_exam_date: exam.expected_exam_date ?? null,
        application_file: null,
        admit_card_file: null,
        images: [],
        keep_application_file: exam.application_file ?? null,
        keep_admit_card_file: exam.admit_card_file ?? null,
        keep_images: exam.images ?? [],
        status: Boolean(exam.status),
        exam_status: exam.exam_status ?? "pending",
    };
}

function extractNewFiles(fileList) {
    return (fileList || [])
        .map((file) => file?.originFileObj)
        .filter((file) => file instanceof File);
}

function buildFileUploadValue(exam, path, prefix) {
    if (!path) return [];
    const baseName = String(path).split("/").pop() || "file";
    const url = route(
        "administrative.exam.file",
        { exam: exam.id, path },
        true,
    );
    return [
        {
            uid: `keep-${prefix}`,
            name: baseName,
            status: "done",
            url,
            path,
        },
    ];
}

function buildImageUploadValue(exam, keepImages) {
    return (keepImages || []).map((path, index) => {
        const baseName = String(path).split("/").pop() || "image";
        const url = route(
            "administrative.exam.file",
            { exam: exam.id, path },
            true,
        );
        return {
            uid: `keep-image-${index}`,
            name: baseName,
            status: "done",
            url,
            thumbUrl: url,
            path,
        };
    });
}

function extractKeptPaths(fileList) {
    return (fileList || [])
        .map((file) => {
            if (file?.originFileObj) return null;
            if (typeof file === "string") return file;
            if (file?.path) return file.path;
            const url = file?.url || file?.thumbUrl;
            if (!url) return null;
            try {
                const parsed = new URL(url, window.location.origin);
                const pathParam = parsed.searchParams.get("path");
                if (pathParam) return pathParam;
            } catch {
                // ignore invalid URLs
            }
            return url
                .replace(/^\/storage\//, "")
                .replace(/^https?:\/\/[^/]+\/storage\//, "");
        })
        .filter(Boolean);
}

export default function Edit({ exam, jobTypes }) {
    const { t } = useAdminT();
    const initial = useMemo(() => buildFromExam(exam), [exam]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [applicationFileList, setApplicationFileList] = useState([]);
    const [admitCardFileList, setAdmitCardFileList] = useState([]);
    const [form] = Form.useForm();
    const { data, setData, put, post, processing, errors, transform } =
        useForm(initial);

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

    const imageUploadValue = useMemo(() => {
        const kept = buildImageUploadValue(exam, data.keep_images ?? []);
        const pending = (data.images ?? []).filter((file) => file instanceof File);
        return [...kept, ...pending];
    }, [exam, data.keep_images, data.images]);

    const showLoading = () => {
        const next = buildFromExam(exam);
        setData(() => next);
        setApplicationFileList(
            buildFileUploadValue(exam, next.keep_application_file, "application"),
        );
        setAdmitCardFileList(
            buildFileUploadValue(exam, next.keep_admit_card_file, "admit-card"),
        );
        setOpen(true);
        setLoading(true);
        setTimeout(() => {
            form.setFieldsValue({
                job_type_id: next.job_type_id,
                name: next.name,
                exam_date: next.exam_date ? dayjs(next.exam_date) : null,
                expected_exam_date: next.expected_exam_date
                    ? dayjs(next.expected_exam_date)
                    : null,
                exam_status: next.exam_status,
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

        const hasNewImageUploads = (data.images || []).some(
            (f) => f instanceof File,
        );
        const hasNewUploads =
            data.application_file instanceof File ||
            data.admit_card_file instanceof File ||
            hasNewImageUploads;
        const hasPdfRemovals =
            (exam.application_file && !data.keep_application_file) ||
            (exam.admit_card_file && !data.keep_admit_card_file);
        const hasImageChanges =
            JSON.stringify(data.keep_images ?? []) !==
            JSON.stringify(exam.images ?? []);
        const useFormData = hasNewUploads || hasPdfRemovals;

        transform((formData) => {
            const out = { ...formData };
            if (useFormData) {
                out._method = "put";
                if (hasImageChanges || hasNewImageUploads) {
                    out.keep_images_updated = true;
                    out.keep_images = formData.keep_images ?? [];
                }
            }
            return out;
        });

        const visitOptions = {
            forceFormData: useFormData,
            preserveScroll: true,
            onSuccess: () => setOpen(false),
            onFinish: () => transform((d) => d),
        };

        const url = route("administrative.exam.update", exam.id);
        if (useFormData) {
            post(url, visitOptions);
        } else {
            put(url, visitOptions);
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
                color="primary"
                variant="outlined"
                icon={<EditOutlined />}
                onClick={showLoading}
                title={t("exam.editTitle")}
            />
            <Drawer
                closable
                destroyOnClose
                title={<p>{t("exam.editTitle")}</p>}
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
                                validateStatus={errors?.exam_status ? "error" : ""}
                                help={errors?.exam_status}
                            >
                                <Select
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
                                        setData((prev) => ({
                                            ...prev,
                                            application_file: file,
                                            keep_application_file: file
                                                ? null
                                                : extractKeptPaths(fileList)[0] ?? null,
                                        }));
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
                                        setData((prev) => ({
                                            ...prev,
                                            admit_card_file: file,
                                            keep_admit_card_file: file
                                                ? null
                                                : extractKeptPaths(fileList)[0] ?? null,
                                        }));
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
                                    value={imageUploadValue}
                                    onChange={(fileList) => {
                                        setData((prev) => ({
                                            ...prev,
                                            images: extractNewFiles(fileList),
                                            keep_images: extractKeptPaths(fileList),
                                        }));
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
