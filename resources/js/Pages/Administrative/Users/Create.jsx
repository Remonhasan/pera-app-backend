import SingleImageUpload from "@/components/reusable/SingleImageUpload";
import { useAdminT } from "@/contexts/AdminI18nContext";
import { CloseOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { useForm, usePage } from "@inertiajs/react";
import { Button, Col, Drawer, Form, Input, Row, Select, Alert } from "antd";
import { useEffect, useMemo, useState } from "react";

const PHONE_COUNTRY_CODE = "+88";

function stripPhoneCountryCode(phone) {
    const normalized = String(phone ?? "").trim();
    if (!normalized) {
        return "";
    }

    if (normalized.startsWith("+880")) {
        return normalized.slice(4).trim();
    }

    if (normalized.startsWith("+88")) {
        return normalized.slice(3).trim();
    }

    return normalized.replace(/^\+/, "").trim();
}

export default function Create() {
    const { t } = useAdminT();
    const title = t("user.createTitle");
    const { roles } = usePage().props;

    const roleOptions = useMemo(
        () =>
            (roles || []).map((role) => ({
                value: role.value,
                label: role.label || role.value,
            })),
        [roles],
    );
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();

    // Filter out "user" role from the roles list in create mode
    const filteredRoles = useMemo(() => {
        if (!roleOptions || !Array.isArray(roleOptions)) return [];
        return roleOptions.filter((role) => {
            const roleValue = role?.value?.toString().toLowerCase() || "";
            return roleValue !== "user";
        });
    }, [roleOptions]);

    const showLoading = () => {
        setOpen(true);
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 800);
    };

    const initialFormData = {
        name: "",
        phone: "",
        phone_country: PHONE_COUNTRY_CODE,
        email: "",
        password: "",
        password_confirmation: "",
        image: "",
        signature: "",
        role: "",
        status: 1,
    };

    const { data, setData, post, processing, errors, reset } =
        useForm(initialFormData);

    const [passwordValidation, setPasswordValidation] = useState({
        hasLowerCase: false,
        hasUpperCase: false,
        hasNumber: false,
        hasSpecialChar: false,
        minLength: false,
        notContainsName: true,
    });

    const getSelectedRole = (roleId) => {
        return roles.find((role) => role.value === roleId);
    };

    // Password validation function
    const validatePassword = (password, userName) => {
        const validation = {
            hasLowerCase: /[a-z]/.test(password),
            hasUpperCase: /[A-Z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecialChar: /[@$!%*?&]/.test(password),
            minLength: password.length >= 8,
            notContainsName: userName
                ? !password.toLowerCase().includes(userName.toLowerCase())
                : true,
        };
        setPasswordValidation(validation);
        return validation;
    };

    // Check if all password requirements are met
    const isPasswordValid = useMemo(() => {
        return Object.values(passwordValidation).every((v) => v === true);
    }, [passwordValidation]);

    useEffect(() => {
        if (open) {
            // Reset both Inertia form and Ant Design form when drawer opens
            reset(initialFormData);
            setTimeout(() => {
                form.resetFields();
                // Clear select values so placeholders show
                const formValues = {
                    ...initialFormData,
                    role: undefined,
                };
                form.setFieldsValue(formValues);
            }, 0);
            // Reset additional state
            setPasswordValidation({
                hasLowerCase: false,
                hasUpperCase: false,
                hasNumber: false,
                hasSpecialChar: false,
                minLength: false,
                notContainsName: true,
            });
        } else {
            // Reset form when drawer closes
            reset(initialFormData);
            form.resetFields();
            // Clear select values so placeholders show
            const formValues = {
                ...initialFormData,
                role: undefined,
            };
            form.setFieldsValue(formValues);
            setPasswordValidation({
                hasLowerCase: false,
                hasUpperCase: false,
                hasNumber: false,
                hasSpecialChar: false,
                minLength: false,
                notContainsName: true,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleSubmit = async () => {
        try {
            // Validate form before submitting
            await form.validateFields();

            // Ensure phone_country is included in the submission
            // The backend will combine phone_country with phone
            const submitData = {
                ...data,
                phone_country: PHONE_COUNTRY_CODE,
            };

            // Check if there's an image file to upload
            const hasImageFile = data.image instanceof File;

            post(route("administrative.user.store"), {
                ...submitData,
                preserveScroll: true,
                forceFormData: hasImageFile, // Use FormData if image file is present
                onSuccess: () => {
                    reset(initialFormData);
                    form.resetFields();
                    form.setFieldsValue({
                        ...initialFormData,
                        role: undefined,
                    });
                    setPasswordValidation({
                        hasLowerCase: false,
                        hasUpperCase: false,
                        hasNumber: false,
                        hasSpecialChar: false,
                        minLength: false,
                        notContainsName: true,
                    });
                    setOpen(false);
                },
                onError: () => {
                    // Error handling
                },
            });
        } catch (errorInfo) {
            // Validation failed, Ant Design will show errors
            console.log("Validation failed:", errorInfo);
        }
    };

    const handleClose = () => {
        reset(initialFormData);
        form.resetFields();
        form.setFieldsValue({
            ...initialFormData,
            role: undefined,
        });
        setPasswordValidation({
            hasLowerCase: false,
            hasUpperCase: false,
            hasNumber: false,
            hasSpecialChar: false,
            minLength: false,
            notContainsName: true,
        });
        setOpen(false);
    };

    // Gather all error messages for top summary
    const allErrors = Object.entries(errors).flatMap(([key, value]) => {
        if (typeof value === "string") return [value];
        if (typeof value === "object")
            return Object.entries(value).flatMap(([subKey, subValue]) => {
                if (typeof subValue === "string") return [subValue];
                if (typeof subValue === "object")
                    return Object.values(subValue);
                return [];
            });
        return [];
    });

    return (
        <div>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showLoading}
                className="create-btn"
                style={{
                    backgroundColor: "#1e3a5f",
                    borderColor: "#1e3a5f",
                }}
            >
                {t("common.create")}
            </Button>
            <style>{`
                .create-btn {
                    background-color: #1e3a5f !important;
                    border-color: #1e3a5f !important;
                    color: white !important;
                    font-weight: 500 !important;
                    height: 40px !important;
                    padding: 0 20px !important;
                    border-radius: 8px !important;
                    transition: all 0.3s ease !important;
                    box-shadow: 0 2px 4px rgba(4, 76, 66, 0.2) !important;
                }
                
                .create-btn:hover {
                    background-color: #162f4d !important;
                    border-color: #162f4d !important;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(4, 76, 66, 0.3) !important;
                }
                
                .create-btn:active {
                    transform: translateY(0);
                    box-shadow: 0 2px 4px rgba(4, 76, 66, 0.2) !important;
                }
                
                .create-btn .anticon {
                    font-size: 16px !important;
                }
                
                /* Deep green header styling */
                .ant-drawer-header {
                    background-color: #1e3a5f !important;
                }
                .ant-drawer-header .ant-drawer-title {
                    color: #ffffff !important;
                    font-weight: 600 !important;
                    font-size: 18px !important;
                }
                .ant-drawer-header .ant-drawer-close {
                    color: #ffffff !important;
                }
                .ant-drawer-header .ant-drawer-close:hover {
                    color: rgba(255, 255, 255, 0.8) !important;
                }
                
                /* Form styling improvements */
                .form-label {
                    font-weight: 500 !important;
                    color: #262626 !important;
                    font-size: 14px !important;
                }
                
                .text-input {
                    border-radius: 6px !important;
                    transition: all 0.3s ease !important;
                }
                
                .text-input:hover {
                    border-color: #1e3a5f !important;
                }
                
                .text-input:focus {
                    border-color: #1e3a5f !important;
                    box-shadow: 0 0 0 2px rgba(4, 76, 66, 0.1) !important;
                }
                
                .ant-form-item-label > label.ant-form-item-required:not(.ant-form-item-required-mark-optional)::before {
                    color: #ff4d4f !important;
                }
                
                .ant-form-item {
                    margin-bottom: 20px !important;
                }
                
                .ant-input-lg, .ant-select-lg {
                    height: 42px !important;
                }

                .phone-input-group {
                    display: flex !important;
                    width: 100% !important;
                }

                .phone-input-group .phone-country-addon {
                    width: 88px !important;
                    flex-shrink: 0 !important;
                    text-align: center !important;
                    border-radius: 6px 0 0 6px !important;
                    background-color: #fafafa !important;
                    color: #262626 !important;
                    cursor: default !important;
                }

                .phone-input-group .phone-number-input {
                    flex: 1 !important;
                    border-radius: 0 6px 6px 0 !important;
                }
                
                .ant-input-lg {
                    padding: 8px 12px !important;
                }
                
                .submit-btn {
                    font-weight: 500 !important;
                    border-radius: 6px !important;
                }
                
                .ant-drawer-body {
                    background-color: #fafafa !important;
                }
                
                /* Phone input group styling */
                .phone-input-group {
                    display: flex !important;
                    width: 100% !important;
                }

                .phone-input-group .phone-country-addon {
                    width: 88px !important;
                    flex-shrink: 0 !important;
                    text-align: center !important;
                    border-radius: 6px 0 0 6px !important;
                    background-color: #fafafa !important;
                    color: #262626 !important;
                    cursor: default !important;
                }

                .phone-input-group .phone-number-input {
                    flex: 1 !important;
                    border-radius: 0 6px 6px 0 !important;
                }
            `}</style>
            <Drawer
                closable
                destroyOnClose
                title={title}
                placement="right"
                open={open}
                size="large"
                onClose={handleClose}
                headerStyle={{
                    backgroundColor: "#1e3a5f",
                    color: "#ffffff",
                    borderBottom: "none",
                }}
                bodyStyle={{
                    padding: "24px",
                }}
                footer={
                    <div style={{ textAlign: "right" }}>
                        <Button
                            icon={<CloseOutlined />}
                            onClick={handleClose}
                            style={{ marginRight: 8 }}
                        >
                            {t("user.formCancel")}
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={processing}
                            onClick={handleSubmit}
                            className="submit-btn"
                            style={{
                                backgroundColor: "#1e3a5f",
                                borderColor: "#1e3a5f",
                            }}
                        >
                            {t("user.formSubmit")}
                        </Button>
                    </div>
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    autoComplete="off"
                    onValuesChange={(changedValues) => {
                        // Sync Ant Design Form values with Inertia form data
                        Object.keys(changedValues).forEach((key) => {
                            setData(key, changedValues[key]);
                        });
                    }}
                >
                    {/* Top-level error summary */}
                    {allErrors.length > 0 && (
                        <Alert
                            type="error"
                            description={
                                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                                    {allErrors.map((err, idx) => (
                                        <li key={idx}>{err}</li>
                                    ))}
                                </ul>
                            }
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="name"
                                label={
                                    <span className="form-label">
                                        {t("user.fullName")}
                                    </span>
                                }
                                validateStatus={errors?.name ? "error" : ""}
                                help={errors?.name}
                                required={true}
                                validateTrigger={["onChange", "onBlur"]}
                                rules={[
                                    {
                                        required: true,
                                        message: t("user.nameRequired"),
                                    },
                                    {
                                        min: 2,
                                        message: t("user.nameMin"),
                                    },
                                ]}
                            >
                                <Input
                                    placeholder={t("user.fullNamePh")}
                                    className="text-input"
                                    size="large"
                                    onChange={(e) => {
                                        setData("name", e.target.value);
                                        // Re-validate password if it exists when name changes
                                        if (data.password) {
                                            validatePassword(
                                                data.password,
                                                e.target.value,
                                            );
                                        }
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={
                                    <span className="form-label">{t("user.phone")}</span>
                                }
                                validateStatus={errors?.phone ? "error" : ""}
                                help={errors?.phone}
                                required={true}
                            >
                                <Input.Group compact className="phone-input-group">
                                    <Input
                                        value={PHONE_COUNTRY_CODE}
                                        readOnly
                                        tabIndex={-1}
                                        size="large"
                                        className="text-input phone-country-addon"
                                    />
                                    <Form.Item
                                        name="phone"
                                        noStyle
                                        validateTrigger={["onChange", "onBlur"]}
                                        rules={[
                                            {
                                                required: true,
                                                    message: t("user.phoneRequired"),
                                                },
                                                {
                                                    pattern: /^[0-9\-\s()]+$/,
                                                    message: t("user.phoneInvalid"),
                                            },
                                        ]}
                                    >
                                        <Input
                                            className="text-input phone-number-input"
                                            placeholder={t("user.phonePh")}
                                            size="large"
                                        />
                                    </Form.Item>
                                </Input.Group>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="email"
                                label={
                                    <span className="form-label">{t("user.email")}</span>
                                }
                                validateStatus={errors?.email ? "error" : ""}
                                help={errors?.email}
                                required={true}
                                validateTrigger={["onChange", "onBlur"]}
                                rules={[
                                    {
                                        required: true,
                                        message: t("user.emailRequired"),
                                    },
                                    {
                                        type: "email",
                                        message: t("user.emailInvalid"),
                                    },
                                ]}
                            >
                                <Input
                                    placeholder={t("user.emailPh")}
                                    className="text-input"
                                    type="email"
                                    size="large"
                                    autoComplete="off"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="role"
                                label={
                                    <span className="form-label">
                                        {t("user.roleLevel")}
                                    </span>
                                }
                                validateStatus={errors?.role ? "error" : ""}
                                help={errors?.role}
                                required={true}
                                validateTrigger={["onChange", "onBlur"]}
                                rules={[
                                    {
                                        required: true,
                                        message: t("user.roleRequired"),
                                    },
                                ]}
                            >
                                <Select
                                    showSearch
                                    className="input-select"
                                    placeholder={t("user.roleLevelPh")}
                                    size="large"
                                    options={filteredRoles}
                                    onChange={(value) => setData("role", value)}
                                    filterOption={(input, option) =>
                                        (option?.label ?? "")
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="password"
                                label={
                                    <span className="form-label">
                                        {t("user.password")}
                                    </span>
                                }
                                validateStatus={errors?.password ? "error" : ""}
                                required={true}
                                validateTrigger={["onChange", "onBlur"]}
                                rules={[
                                    {
                                        required: true,
                                        message: t("user.passwordRequired"),
                                    },
                                    {
                                        validator: (_, value) => {
                                            // Skip validation if value is empty (required rule handles that)
                                            if (!value) {
                                                return Promise.resolve();
                                            }
                                            const validation = validatePassword(
                                                value,
                                                data.name,
                                            );
                                            if (!validation.minLength) {
                                                return Promise.reject(
                                                    new Error(
                                                        t("user.passwordMinLength"),
                                                    ),
                                                );
                                            }
                                            if (!validation.hasLowerCase) {
                                                return Promise.reject(
                                                    new Error(
                                                        t("user.passwordLower"),
                                                    ),
                                                );
                                            }
                                            if (!validation.hasUpperCase) {
                                                return Promise.reject(
                                                    new Error(
                                                        t("user.passwordUpper"),
                                                    ),
                                                );
                                            }
                                            if (!validation.hasNumber) {
                                                return Promise.reject(
                                                    new Error(
                                                        t("user.passwordNumber"),
                                                    ),
                                                );
                                            }
                                            if (!validation.hasSpecialChar) {
                                                return Promise.reject(
                                                    new Error(
                                                        t("user.passwordSpecial"),
                                                    ),
                                                );
                                            }
                                            if (!validation.notContainsName) {
                                                return Promise.reject(
                                                    new Error(
                                                        t("user.passwordNoName"),
                                                    ),
                                                );
                                            }
                                            return Promise.resolve();
                                        },
                                    },
                                ]}
                                help={
                                    <div>
                                        {errors.password && (
                                            <div
                                                style={{
                                                    color: "red",
                                                    marginBottom: 8,
                                                }}
                                            >
                                                {errors.password}
                                            </div>
                                        )}
                                        <div
                                            style={{
                                                fontSize: "12px",
                                                color: "#8c8c8c",
                                            }}
                                        >
                                            <div style={{ marginBottom: 4 }}>
                                                <span
                                                    style={{
                                                        color: passwordValidation.minLength
                                                            ? "#52c41a"
                                                            : "#8c8c8c",
                                                    }}
                                                >
                                                    {passwordValidation.minLength
                                                        ? "✓"
                                                        : "○"}
                                                </span>{" "}
                                                {t("user.passwordRuleMinLength")}
                                            </div>
                                            <div style={{ marginBottom: 4 }}>
                                                <span
                                                    style={{
                                                        color: passwordValidation.hasLowerCase
                                                            ? "#52c41a"
                                                            : "#8c8c8c",
                                                    }}
                                                >
                                                    {passwordValidation.hasLowerCase
                                                        ? "✓"
                                                        : "○"}
                                                </span>{" "}
                                                {t("user.passwordRuleLower")}
                                            </div>
                                            <div style={{ marginBottom: 4 }}>
                                                <span
                                                    style={{
                                                        color: passwordValidation.hasUpperCase
                                                            ? "#52c41a"
                                                            : "#8c8c8c",
                                                    }}
                                                >
                                                    {passwordValidation.hasUpperCase
                                                        ? "✓"
                                                        : "○"}
                                                </span>{" "}
                                                {t("user.passwordRuleUpper")}
                                            </div>
                                            <div style={{ marginBottom: 4 }}>
                                                <span
                                                    style={{
                                                        color: passwordValidation.hasNumber
                                                            ? "#52c41a"
                                                            : "#8c8c8c",
                                                    }}
                                                >
                                                    {passwordValidation.hasNumber
                                                        ? "✓"
                                                        : "○"}
                                                </span>{" "}
                                                {t("user.passwordRuleNumber")}
                                            </div>
                                            <div style={{ marginBottom: 4 }}>
                                                <span
                                                    style={{
                                                        color: passwordValidation.hasSpecialChar
                                                            ? "#52c41a"
                                                            : "#8c8c8c",
                                                    }}
                                                >
                                                    {passwordValidation.hasSpecialChar
                                                        ? "✓"
                                                        : "○"}
                                                </span>{" "}
                                                {t("user.passwordRuleSpecial")}
                                            </div>
                                            <div>
                                                <span
                                                    style={{
                                                        color: passwordValidation.notContainsName
                                                            ? "#52c41a"
                                                            : "#8c8c8c",
                                                    }}
                                                >
                                                    {passwordValidation.notContainsName
                                                        ? "✓"
                                                        : "○"}
                                                </span>{" "}
                                                {t("user.passwordRuleNoName")}
                                            </div>
                                        </div>
                                    </div>
                                }
                            >
                                <Input.Password
                                    placeholder={t("user.passwordPh")}
                                    className="text-input"
                                    autoComplete="new-password"
                                    onChange={(e) => {
                                        const password = e.target.value;
                                        setData("password", password);
                                        validatePassword(password, data.name);
                                        // Trigger confirm password validation if it has a value
                                        if (data.password_confirmation) {
                                            form.validateFields([
                                                "password_confirmation",
                                            ]);
                                        }
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="password_confirmation"
                                label={
                                    <span className="form-label">
                                        {t("user.confirmPassword")}
                                    </span>
                                }
                                validateStatus={
                                    errors?.password_confirmation ? "error" : ""
                                }
                                required={true}
                                validateTrigger={["onChange", "onBlur"]}
                                dependencies={["password"]}
                                rules={[
                                    {
                                        required: true,
                                        message: t("user.confirmPasswordRequired"),
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (
                                                !value ||
                                                getFieldValue("password") ===
                                                    value
                                            ) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(
                                                new Error(t("user.passwordsNoMatch")),
                                            );
                                        },
                                    }),
                                ]}
                                help={errors?.password_confirmation}
                            >
                                <Input.Password
                                    placeholder={t("user.confirmPasswordPh")}
                                    className="text-input"
                                    autoComplete="new-password"
                                    onChange={(e) => {
                                        setData(
                                            "password_confirmation",
                                            e.target.value,
                                        );
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="image"
                                label={
                                    <span className="form-label">{t("user.image")}</span>
                                }
                                validateStatus={errors?.image ? "error" : ""}
                                help={
                                    errors?.image ? (
                                        <div>
                                            <div
                                                style={{
                                                    color: "red",
                                                    marginBottom: 4,
                                                }}
                                            >
                                                {errors.image}
                                            </div>
                                            <div
                                                style={{
                                                    color: "#8c8c8c",
                                                    fontSize: "12px",
                                                }}
                                            >
                                                {t("user.imageFormats")}
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            style={{
                                                color: "#8c8c8c",
                                                fontSize: "12px",
                                            }}
                                        >
                                            {t("user.imageFormats")}
                                        </div>
                                    )
                                }
                            >
                                <SingleImageUpload
                                    value={data.image}
                                    onChange={(file) => {
                                        if (file?.originFileObj) {
                                            // New file uploaded
                                            setData(
                                                "image",
                                                file.originFileObj,
                                            );
                                        } else if (
                                            file?.url ||
                                            file?.thumbUrl
                                        ) {
                                            // Existing file - extract relative path
                                            const path =
                                                file.url || file.thumbUrl;
                                            const relativePath =
                                                path.startsWith("/storage/")
                                                    ? path.replace(
                                                          "/storage/",
                                                          "",
                                                      )
                                                    : path;
                                            setData("image", relativePath);
                                        } else {
                                            // File removed
                                            setData("image", "");
                                        }
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="signature"
                                label={
                                    <span className="form-label">
                                        {t("user.signature")}
                                    </span>
                                }
                                validateStatus={
                                    errors?.signature ? "error" : ""
                                }
                                help={
                                    errors?.signature ? (
                                        <div>
                                            <div
                                                style={{
                                                    color: "red",
                                                    marginBottom: 4,
                                                }}
                                            >
                                                {errors.signature}
                                            </div>
                                            <div
                                                style={{
                                                    color: "#8c8c8c",
                                                    fontSize: "12px",
                                                }}
                                            >
                                                {t("user.imageFormats")}
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            style={{
                                                color: "#8c8c8c",
                                                fontSize: "12px",
                                            }}
                                        >
                                            {t("user.imageFormats")}
                                        </div>
                                    )
                                }
                            >
                                <SingleImageUpload
                                    value={data.signature}
                                    onChange={(file) => {
                                        if (file?.originFileObj) {
                                            // New file uploaded
                                            setData(
                                                "signature",
                                                file.originFileObj,
                                            );
                                        } else if (
                                            file?.url ||
                                            file?.thumbUrl
                                        ) {
                                            // Existing file - extract relative path
                                            const path =
                                                file.url || file.thumbUrl;
                                            const relativePath =
                                                path.startsWith("/storage/")
                                                    ? path.replace(
                                                          "/storage/",
                                                          "",
                                                      )
                                                    : path;
                                            setData("signature", relativePath);
                                        } else {
                                            // File removed
                                            setData("signature", "");
                                        }
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="status"
                                label={
                                    <span className="form-label">{t("common.status")}</span>
                                }
                                validateStatus={errors?.status ? "error" : ""}
                                help={errors?.status}
                                initialValue={1}
                            >
                                <Select
                                    className="input-select"
                                    placeholder={t("user.statusPh")}
                                    size="large"
                                    value={data.status}
                                    options={[
                                        { value: 1, label: t("common.active") },
                                        { value: 0, label: t("common.inactive") },
                                    ]}
                                    onChange={(value) =>
                                        setData("status", value)
                                    }
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Drawer>
        </div>
    );
}
