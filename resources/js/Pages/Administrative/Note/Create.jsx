import { CloseOutlined, PlusOutlined, SaveOutlined, UploadOutlined } from "@ant-design/icons";
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
    Upload,
} from "antd";
import { useMemo, useState } from "react";
import MultipleImageUpload from "../../../components/reusable/MultipleImageUpload";
import { useAdminT } from "../../../contexts/AdminI18nContext";

function buildInitial() {
    return {
        user_id: null,
        subject_id: null,
        topic_id: null,
        job_ids: [],
        images: [],
        files: [],
        drive_link: null,
        status: true,
    };
}

function extractNewFiles(fileList) {
    return (fileList || [])
        .map((file) => file?.originFileObj)
        .filter((file) => file instanceof File);
}

export default function Create({ members, subjects, topics, jobTypes }) {
    const { t } = useAdminT();

    const memberOptions = useMemo(
        () =>
            (members || []).map((u) => ({
                value: u.id,
                label: u.phone ? `${u.name} (${u.phone})` : u.name,
            })),
        [members],
    );

    const subjectOptions = useMemo(
        () =>
            (subjects || []).map((subject) => ({
                value: subject.id,
                label: subject.name,
            })),
        [subjects],
    );

    const jobTypeOptions = useMemo(
        () =>
            (jobTypes || []).map((type) => ({
                value: type.id,
                label: type.name,
            })),
        [jobTypes],
    );

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [fileList, setFileList] = useState([]);
    const [form] = Form.useForm();
    const initial = useMemo(() => buildInitial(), []);
    const { data, setData, post, processing, errors, transform } = useForm(initial);

    const topicOptions = useMemo(() => {
        if (!data.subject_id) return [];
        return (topics || [])
            .filter((item) => item.subject_id === data.subject_id)
            .map((item) => ({
                value: item.id,
                label: item.topic,
            }));
    }, [topics, data.subject_id]);

    const syncFormFields = (payload) => {
        form.setFieldsValue({
            user_id: payload.user_id,
            subject_id: payload.subject_id,
            topic_id: payload.topic_id,
            job_ids: payload.job_ids,
            drive_link: payload.drive_link,
            status: payload.status,
        });
    };

    const showLoading = () => {
        const fresh = buildInitial();
        setData(fresh);
        setFileList([]);
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
            (data.images || []).some((f) => f instanceof File) ||
            (data.files || []).some((f) => f instanceof File);

        transform((formData) => formData);

        post(route("administrative.note.store"), {
            forceFormData: hasUploads,
            preserveScroll: true,
            onSuccess: () => setOpen(false),
            onFinish: () => transform((d) => d),
        });
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
                title={<p>{t("note.createTitle")}</p>}
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
                                label={t("note.memberLabel")}
                                name="user_id"
                                validateStatus={errors?.user_id ? "error" : ""}
                                help={errors?.user_id}
                            >
                                <Select
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder={t("note.memberPlaceholder")}
                                    options={memberOptions}
                                    value={data.user_id}
                                    onChange={(v) => {
                                        setData("user_id", v ?? null);
                                        form.setFieldValue("user_id", v ?? null);
                                    }}
                                    size="large"
                                    className="note-form-input"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("note.subjectLabel")}
                                name="subject_id"
                                rules={[
                                    {
                                        required: true,
                                        message: t("note.subjectRequired"),
                                    },
                                ]}
                                validateStatus={errors?.subject_id ? "error" : ""}
                                help={errors?.subject_id}
                            >
                                <Select
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder={t("note.subjectPlaceholder")}
                                    options={subjectOptions}
                                    value={data.subject_id}
                                    onChange={(v) => {
                                        setData((prev) => ({
                                            ...prev,
                                            subject_id: v,
                                            topic_id: null,
                                        }));
                                        form.setFieldsValue({
                                            subject_id: v,
                                            topic_id: null,
                                        });
                                    }}
                                    size="large"
                                    className="note-form-input"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("note.topicLabel")}
                                name="topic_id"
                                validateStatus={errors?.topic_id ? "error" : ""}
                                help={errors?.topic_id}
                            >
                                <Select
                                    showSearch
                                    allowClear
                                    optionFilterProp="label"
                                    placeholder={t("note.topicPlaceholder")}
                                    options={topicOptions}
                                    value={data.topic_id}
                                    onChange={(v) => {
                                        setData("topic_id", v ?? null);
                                        form.setFieldValue("topic_id", v ?? null);
                                    }}
                                    size="large"
                                    className="note-form-input"
                                    disabled={!data.subject_id}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("note.jobTypesLabel")}
                                name="job_ids"
                                validateStatus={errors?.job_ids ? "error" : ""}
                                help={errors?.job_ids}
                            >
                                <Select
                                    mode="multiple"
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder={t("note.jobTypesPlaceholder")}
                                    options={jobTypeOptions}
                                    value={data.job_ids}
                                    onChange={(v) => {
                                        setData("job_ids", v || []);
                                        form.setFieldValue("job_ids", v || []);
                                    }}
                                    size="large"
                                    className="note-form-input"
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
                                    className="note-form-input"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("note.imagesLabel")}
                                validateStatus={errors?.images ? "error" : ""}
                                help={errors?.images}
                            >
                                <MultipleImageUpload
                                    value={data.images}
                                    onChange={(fileList) => {
                                        setData(
                                            "images",
                                            extractNewFiles(fileList),
                                        );
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t("note.filesLabel")}
                                validateStatus={errors?.files ? "error" : ""}
                                help={errors?.files}
                            >
                                <Upload
                                    multiple
                                    beforeUpload={() => false}
                                    fileList={fileList}
                                    onChange={({ fileList: nextList }) => {
                                        setFileList(nextList);
                                        setData(
                                            "files",
                                            extractNewFiles(nextList),
                                        );
                                    }}
                                >
                                    <Button icon={<UploadOutlined />}>
                                        {t("note.uploadFiles")}
                                    </Button>
                                </Upload>
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
                .note-form-input.ant-select .ant-select-selector,
                .note-form-input.ant-picker,
                .note-form-input.ant-input-number,
                .note-form-input.ant-input {
                    border-radius: 12px !important;
                    min-height: 46px;
                    font-size: 15px;
                    border-color: #d9d9d9;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }
                .note-form-input.ant-select .ant-select-selector,
                .note-form-input.ant-picker {
                    padding: 6px 16px !important;
                }
                .note-form-input.ant-input-number .ant-input-number-input,
                .note-form-input.ant-input {
                    height: 44px;
                    padding: 0 16px;
                    font-size: 15px;
                }
                .note-form-input.ant-select:hover .ant-select-selector,
                .note-form-input.ant-picker:hover,
                .note-form-input.ant-input-number:hover,
                .note-form-input.ant-input:hover {
                    border-color: #1e3a5f !important;
                }
                .note-form-input.ant-select-focused .ant-select-selector,
                .note-form-input.ant-picker-focused,
                .note-form-input.ant-input-number-focused,
                .note-form-input.ant-input:focus {
                    border-color: #1e3a5f !important;
                    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.12) !important;
                }
            `}</style>
        </div>
    );
}
