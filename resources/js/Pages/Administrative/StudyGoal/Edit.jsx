import { CloseOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { useForm } from "@inertiajs/react";
import {
    Alert,
    Button,
    Col,
    DatePicker,
    Drawer,
    Form,
    Row,
    Select,
    Switch,
} from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useAdminT } from "../../../contexts/AdminI18nContext";

function buildFormState(studyGoal) {
    return {
        user_id: studyGoal.user_id ?? null,
        subject_id: studyGoal.subject_id ?? null,
        topic_id: studyGoal.topic_id ?? null,
        job_id: studyGoal.job_id ?? null,
        date_from: studyGoal.date_from ?? null,
        date_to: studyGoal.date_to ?? null,
        extended_date: studyGoal.extended_date ?? null,
        status: Boolean(studyGoal.status),
        study_goal_status: studyGoal.study_goal_status ?? "pending",
    };
}

export default function Edit({ studyGoal, members, subjects, topics, jobTypes }) {
    const { t } = useAdminT();
    const initial = useMemo(() => buildFormState(studyGoal), [studyGoal]);
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

    const statusOptions = useMemo(
        () => [
            { value: "pending", label: t("studyGoal.statusPending") },
            { value: "doing", label: t("studyGoal.statusDoing") },
            { value: "completed", label: t("studyGoal.statusCompleted") },
        ],
        [t],
    );

    const topicOptions = useMemo(() => {
        if (!data.subject_id) return [];
        return (topics || [])
            .filter((item) => item.subject_id === data.subject_id)
            .map((item) => ({
                value: item.id,
                label: item.topic,
            }));
    }, [topics, data.subject_id]);

    const showLoading = () => {
        const next = buildFormState(studyGoal);
        setData(() => next);
        setOpen(true);
        setLoading(true);
        setTimeout(() => {
            form.setFieldsValue({
                ...next,
                date_from: next.date_from ? dayjs(next.date_from) : null,
                date_to: next.date_to ? dayjs(next.date_to) : null,
                extended_date: next.extended_date ? dayjs(next.extended_date) : null,
            });
            setLoading(false);
        }, 0);
    };

    const handleSubmit = async () => {
        try {
            await form.validateFields();
            put(route("administrative.study-goal.update", studyGoal.id), {
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
                type="default"
                icon={<EditOutlined />}
                onClick={showLoading}
                title={t("studyGoal.editTitle")}
            />
            <Drawer
                closable
                destroyOnClose
                title={<p>{t("studyGoal.editTitle")}</p>}
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
                                label={t("studyGoal.memberLabel")}
                                name="user_id"
                                validateStatus={errors?.user_id ? "error" : ""}
                                help={errors?.user_id}
                            >
                                <Select
                                    showSearch
                                    allowClear
                                    placeholder={t("studyGoal.memberPlaceholder")}
                                    options={memberOptions}
                                    optionFilterProp="label"
                                    value={data.user_id}
                                    onChange={(v) => {
                                        setData("user_id", v ?? null);
                                        form.setFieldValue("user_id", v);
                                    }}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={t("studyGoal.subjectLabel")}
                                name="subject_id"
                                rules={[
                                    {
                                        required: true,
                                        message: t("studyGoal.subjectRequired"),
                                    },
                                ]}
                                validateStatus={errors?.subject_id ? "error" : ""}
                                help={errors?.subject_id}
                            >
                                <Select
                                    showSearch
                                    placeholder={t("studyGoal.subjectPlaceholder")}
                                    options={subjectOptions}
                                    optionFilterProp="label"
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
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={t("studyGoal.topicLabel")}
                                name="topic_id"
                                validateStatus={errors?.topic_id ? "error" : ""}
                                help={errors?.topic_id}
                            >
                                <Select
                                    showSearch
                                    allowClear
                                    disabled={!data.subject_id}
                                    placeholder={t("studyGoal.topicPlaceholder")}
                                    options={topicOptions}
                                    optionFilterProp="label"
                                    value={data.topic_id}
                                    onChange={(v) => {
                                        setData("topic_id", v ?? null);
                                        form.setFieldValue("topic_id", v);
                                    }}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={t("studyGoal.jobTypeLabel")}
                                name="job_id"
                                validateStatus={errors?.job_id ? "error" : ""}
                                help={errors?.job_id}
                            >
                                <Select
                                    showSearch
                                    allowClear
                                    placeholder={t("studyGoal.jobTypePlaceholder")}
                                    options={jobTypeOptions}
                                    optionFilterProp="label"
                                    value={data.job_id}
                                    onChange={(v) => {
                                        setData("job_id", v ?? null);
                                        form.setFieldValue("job_id", v);
                                    }}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={t("studyGoal.dateFromLabel")}
                                name="date_from"
                                validateStatus={errors?.date_from ? "error" : ""}
                                help={errors?.date_from}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    format="YYYY-MM-DD"
                                    value={data.date_from ? dayjs(data.date_from) : null}
                                    onChange={(date) => setDateField("date_from", date)}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={t("studyGoal.dateToLabel")}
                                name="date_to"
                                validateStatus={errors?.date_to ? "error" : ""}
                                help={errors?.date_to}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    format="YYYY-MM-DD"
                                    value={data.date_to ? dayjs(data.date_to) : null}
                                    onChange={(date) => setDateField("date_to", date)}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={t("studyGoal.extendedDateLabel")}
                                name="extended_date"
                                validateStatus={errors?.extended_date ? "error" : ""}
                                help={errors?.extended_date}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    format="YYYY-MM-DD"
                                    value={
                                        data.extended_date ? dayjs(data.extended_date) : null
                                    }
                                    onChange={(date) => setDateField("extended_date", date)}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={t("studyGoal.studyGoalStatusLabel")}
                                name="study_goal_status"
                                rules={[
                                    {
                                        required: true,
                                        message: t("studyGoal.studyGoalStatusRequired"),
                                    },
                                ]}
                                validateStatus={errors?.study_goal_status ? "error" : ""}
                                help={errors?.study_goal_status}
                            >
                                <Select
                                    placeholder={t("studyGoal.studyGoalStatusPlaceholder")}
                                    options={statusOptions}
                                    value={data.study_goal_status}
                                    onChange={(v) => {
                                        setData("study_goal_status", v);
                                        form.setFieldValue("study_goal_status", v);
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
                    </Row>
                </Form>
            </Drawer>
        </div>
    );
}
