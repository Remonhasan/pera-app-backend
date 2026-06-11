import { Head, useForm } from "@inertiajs/react";
import { Button, Checkbox, Form, Input, Typography } from "antd";
import AdminShell from "../../components/layouts/AdminShell";
import { adminMessages } from "../../i18n/adminMessages";
import {
    ADMIN_NAVY,
    ADMIN_NAVY_HOVER,
} from "../../theme/adminColors";

const { Text, Title } = Typography;

const REMEMBER_ME_KEY = "remember_me_credentials";

/** Deep green login palette (aligned with admin sidebar / primary actions). */
const LOGIN_THEME = {
    bgFrom: "#051410",
    bgVia: "#0c2419",
    bgTo: "#1e3a5f",
    cardBg: "rgba(6, 20, 14, 0.92)",
    accent: "#3d7a5c",
    accentLight: "#5a9e78",
    border: "rgba(61, 122, 92, 0.35)",
    borderFocus: "rgba(90, 158, 120, 0.75)",
    glow: "rgba(30, 58, 95, 0.45)",
};

/** Login page copy is Bangla only (aligned with `adminMessages.bn.login`). */
const loginCopy = adminMessages.bn.login;

function LoginContent() {
    // Load saved credentials from localStorage on mount
    const getSavedCredentials = () => {
        try {
            const saved = localStorage.getItem(REMEMBER_ME_KEY);
            if (saved) {
                const credentials = JSON.parse(saved);
                return {
                    email: credentials.email || "",
                    password: credentials.password || "",
                    remember: true,
                };
            }
        } catch (error) {
            console.error("Error loading saved credentials:", error);
        }
        return {
            email: "",
            password: "",
            remember: false,
        };
    };

    const savedCredentials = getSavedCredentials();

    const { data, setData, post, processing, errors, reset } = useForm({
        email: savedCredentials.email,
        password: savedCredentials.password,
        remember: savedCredentials.remember,
    });

    // Save credentials to localStorage when remember is checked
    const saveCredentials = (email, password) => {
        try {
            localStorage.setItem(
                REMEMBER_ME_KEY,
                JSON.stringify({ email, password }),
            );
        } catch (error) {
            console.error("Error saving credentials:", error);
        }
    };

    // Clear saved credentials from localStorage
    const clearSavedCredentials = () => {
        try {
            localStorage.removeItem(REMEMBER_ME_KEY);
        } catch (error) {
            console.error("Error clearing credentials:", error);
        }
    };

    // Handle remember checkbox change
    const handleRememberChange = (checked) => {
        setData("remember", checked);
        if (!checked) {
            clearSavedCredentials();
        }
    };

    const onFinish = () => {
        post(route("login.store"), {
            onSuccess: () => {
                // Save credentials if remember me is checked
                if (data.remember) {
                    saveCredentials(data.email, data.password);
                } else {
                    clearSavedCredentials();
                }
                // Only reset password on successful login
                reset("password");
            },
            // Don't reset password on error - keep it so user can retry
            // The onFinish callback was resetting password even on errors
        });
    };

    const onFinishFailed = () => {};

    return (
        <>
            <Head title={loginCopy.headTitle} />
            {/* Full-screen admin login background */}
            <section
                lang="bn"
                className="relative flex justify-center items-center min-h-screen px-4 py-6 overflow-hidden login-page"
                style={{
                    background: `linear-gradient(to bottom right, ${LOGIN_THEME.bgFrom}, ${LOGIN_THEME.bgVia}, ${LOGIN_THEME.bgTo})`,
                }}
            >
                <div
                    className="pointer-events-none absolute inset-0 opacity-30 mix-blend-soft-light"
                    style={{
                        background:
                            "radial-gradient(circle at 12% 18%, rgba(61, 122, 92, 0.35) 0, transparent 48%), radial-gradient(circle at 82% 8%, rgba(30, 58, 95, 0.4) 0, transparent 42%), radial-gradient(circle at 55% 110%, rgba(45, 106, 79, 0.25) 0, transparent 50%)",
                    }}
                />

                <div
                    className="hidden lg:block absolute -left-32 top-10 w-96 h-96 rounded-full blur-3xl"
                    style={{
                        backgroundColor: "rgba(30, 58, 95, 0.12)",
                        border: "1px solid rgba(61, 122, 92, 0.12)",
                    }}
                />
                <div
                    className="hidden lg:block absolute -right-36 -bottom-14 w-[30rem] h-[30rem] rounded-full blur-3xl"
                    style={{
                        backgroundColor: "rgba(45, 106, 79, 0.08)",
                        border: "1px solid rgba(61, 122, 92, 0.1)",
                    }}
                />

                <div className="relative z-10 w-full max-w-md mx-auto">
                    <div className="relative w-full">
                        <div
                            className="absolute -inset-0.5 opacity-80 blur-xl rounded-3xl"
                            style={{
                                background: `linear-gradient(to bottom right, ${LOGIN_THEME.accent}99, ${ADMIN_NAVY}99, ${LOGIN_THEME.accentLight}66)`,
                            }}
                        />

                        <div
                            className="relative rounded-3xl px-7 py-8 sm:px-9 sm:py-9 backdrop-blur-xl"
                            style={{
                                backgroundColor: LOGIN_THEME.cardBg,
                                border: `1px solid ${LOGIN_THEME.border}`,
                                boxShadow:
                                    "0 22px 65px rgba(5, 20, 16, 0.85)",
                            }}
                        >
                            <div className="mb-7 text-center">
                                <div
                                    className="inline-flex items-center justify-center rounded-2xl px-4 py-2 mb-4 shadow-lg"
                                    style={{
                                        backgroundColor: "rgba(5, 20, 16, 0.5)",
                                        border: `1px solid ${LOGIN_THEME.border}`,
                                        boxShadow:
                                            "0 8px 24px rgba(5, 20, 16, 0.5)",
                                    }}
                                >
                                    <span
                                        className="text-xs font-semibold tracking-[0.25em] uppercase"
                                        style={{ color: LOGIN_THEME.accentLight }}
                                    >
                                        {loginCopy.accessBadge}
                                    </span>
                                </div>

                                <Title
                                    level={3}
                                    className="!mb-1 tracking-tight"
                                    style={{ color: "#f0fdf4" }}
                                >
                                    {loginCopy.signInTitle}
                                </Title>
                                <Text
                                    className="text-sm"
                                    style={{ color: "rgba(240, 253, 244, 0.72)" }}
                                >
                                    {loginCopy.signInSubtitle}
                                </Text>
                            </div>

                            <Form
                                onFinish={onFinish}
                                id="submitForm"
                                onFinishFailed={onFinishFailed}
                                layout="vertical"
                                autoComplete="off"
                                requiredMark={false}
                            >
                                <Form.Item
                                    label={
                                        <span
                                            className="font-semibold text-sm"
                                            style={{ color: "#f0fdf4" }}
                                        >
                                            {loginCopy.emailLabel}
                                        </span>
                                    }
                                    name="email"
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            message: loginCopy.emailRequired,
                                        },
                                    ]}
                                    validateStatus={errors.email ? "error" : ""}
                                    help={errors.email}
                                >
                                    <Input
                                        placeholder={loginCopy.emailPlaceholder}
                                        value={data.email}
                                        autoComplete="email"
                                        className="login-input-field"
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={
                                        <span
                                            className="font-semibold text-sm"
                                            style={{ color: "#f0fdf4" }}
                                        >
                                            {loginCopy.passwordLabel}
                                        </span>
                                    }
                                    name="password"
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            message: loginCopy.passwordRequired,
                                        },
                                    ]}
                                    validateStatus={
                                        errors.password ? "error" : ""
                                    }
                                    help={errors.password}
                                >
                                    <Input.Password
                                        placeholder={
                                            loginCopy.passwordPlaceholder
                                        }
                                        value={data.password}
                                        autoComplete="current-password"
                                        className="login-input-field"
                                    />
                                </Form.Item>

                                <div className="flex justify-between items-center mb-5">
                                    <Form.Item
                                        name="remember"
                                        valuePropName="checked"
                                        className="mb-0"
                                    >
                                        <Checkbox
                                            checked={data.remember}
                                            onChange={(e) =>
                                                handleRememberChange(
                                                    e.target.checked,
                                                )
                                            }
                                            className="login-checkbox [&_.ant-checkbox-inner]:border-[#3d7a5c] [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-[#1e3a5f] [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-[#1e3a5f]"
                                        >
                                            <span
                                                className="text-[13px]"
                                                style={{
                                                    color: "rgba(240, 253, 244, 0.8)",
                                                }}
                                            >
                                                {loginCopy.rememberMe}
                                            </span>
                                        </Checkbox>
                                    </Form.Item>
                                </div>

                                <Form.Item className="mb-1">
                                    <Button
                                        type="primary"
                                        form="submitForm"
                                        htmlType="submit"
                                        loading={processing}
                                        className="w-full h-10 rounded-lg font-semibold tracking-wide border-0 transition-all duration-200 login-submit-btn"
                                        style={{
                                            backgroundColor: ADMIN_NAVY,
                                            borderColor: ADMIN_NAVY,
                                            color: "#ffffff",
                                            boxShadow:
                                                "0 14px 30px rgba(30, 58, 95, 0.45)",
                                        }}
                                    >
                                        {loginCopy.submit}
                                    </Button>
                                </Form.Item>

                                <p
                                    className="mt-4 text-[11px] text-center"
                                    style={{ color: "rgba(240, 253, 244, 0.55)" }}
                                >
                                    {loginCopy.authorizedOnly}
                                </p>
                            </Form>
                        </div>
                    </div>
                </div>
            </section>
            <style>{`
                .login-submit-btn:hover {
                    background-color: ${ADMIN_NAVY_HOVER} !important;
                    border-color: ${ADMIN_NAVY_HOVER} !important;
                    transform: translateY(-1px);
                    box-shadow: 0 16px 34px rgba(30, 58, 95, 0.55) !important;
                }

                .login-input-field,
                .login-input-field.ant-input,
                .login-input-field.ant-input-affix-wrapper {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    width: 100% !important;
                }
                
                .login-input-field:hover,
                .login-input-field.ant-input:hover,
                .login-input-field.ant-input-affix-wrapper:hover {
                    background: transparent !important;
                }
                
                .login-input-field.ant-input,
                .login-input-field.ant-input:not(:disabled):not(.ant-input-disabled),
                .login-input-field input,
                .login-input-field input:not(:disabled) {
                    background: linear-gradient(135deg, rgba(5, 20, 16, 0.92) 0%, rgba(30, 58, 95, 0.45) 100%) !important;
                    background-color: transparent !important;
                    border: 1.5px solid rgba(61, 122, 92, 0.35) !important;
                    border-radius: 12px !important;
                    padding: 14px 18px !important;
                    color: #f0fdf4 !important;
                    font-size: 15px !important;
                    font-weight: 400 !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    text-shadow: none !important;
                    box-shadow: 0 2px 10px rgba(5, 20, 16, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                }
                
                .login-input-field.ant-input:-webkit-autofill,
                .login-input-field.ant-input:-webkit-autofill:hover,
                .login-input-field.ant-input:-webkit-autofill:focus,
                .login-input-field input:-webkit-autofill,
                .login-input-field input:-webkit-autofill:hover,
                .login-input-field input:-webkit-autofill:focus {
                    -webkit-text-fill-color: #f0fdf4 !important;
                    -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
                    background: linear-gradient(135deg, rgba(5, 20, 16, 0.92) 0%, rgba(30, 58, 95, 0.45) 100%) !important;
                    transition: background-color 5000s ease-in-out 0s !important;
                }
                
                .login-input-field.ant-input-affix-wrapper input {
                    background: transparent !important;
                    border: none !important;
                    border-radius: 0 !important;
                    box-shadow: none !important;
                    padding: 14px 18px !important;
                    padding-right: 45px !important;
                }
                
                .login-input-field.ant-input::placeholder,
                .login-input-field input::placeholder {
                    color: rgba(187, 247, 208, 0.45) !important;
                    font-weight: 400 !important;
                }
                
                .login-input-field.ant-input:hover,
                .login-input-field input:hover {
                    border-color: rgba(90, 158, 120, 0.55) !important;
                    box-shadow: 0 4px 18px rgba(30, 58, 95, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
                    background: linear-gradient(135deg, rgba(5, 20, 16, 0.96) 0%, rgba(30, 58, 95, 0.55) 100%) !important;
                    transform: translateY(-1px) !important;
                }
                
                .login-input-field.ant-input-affix-wrapper:hover input {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    transform: none !important;
                }
                
                .login-input-field.ant-input:focus,
                .login-input-field.ant-input:focus-within,
                .login-input-field input:focus,
                .login-input-field input:focus-within {
                    border-color: rgba(90, 158, 120, 0.85) !important;
                    box-shadow: 0 0 0 4px rgba(30, 58, 95, 0.35), 0 6px 20px rgba(61, 122, 92, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
                    background: linear-gradient(135deg, rgba(5, 20, 16, 0.98) 0%, rgba(30, 58, 95, 0.62) 100%) !important;
                    background-color: transparent !important;
                    outline: none !important;
                    transform: translateY(-1px) !important;
                    color: #f0fdf4 !important;
                }
                
                .login-input-field.ant-input-affix-wrapper:focus-within input {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    transform: none !important;
                }
                
                .login-input-field.ant-input-affix-wrapper {
                    background: linear-gradient(135deg, rgba(5, 20, 16, 0.92) 0%, rgba(30, 58, 95, 0.45) 100%) !important;
                    border: 1.5px solid rgba(61, 122, 92, 0.35) !important;
                    border-radius: 12px !important;
                    box-shadow: 0 2px 10px rgba(5, 20, 16, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                
                .login-input-field.ant-input-affix-wrapper:hover {
                    border-color: rgba(90, 158, 120, 0.55) !important;
                    box-shadow: 0 4px 18px rgba(30, 58, 95, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
                    background: linear-gradient(135deg, rgba(5, 20, 16, 0.96) 0%, rgba(30, 58, 95, 0.55) 100%) !important;
                    transform: translateY(-1px) !important;
                }
                
                .login-input-field.ant-input-affix-wrapper:focus-within {
                    border-color: rgba(90, 158, 120, 0.85) !important;
                    box-shadow: 0 0 0 4px rgba(30, 58, 95, 0.35), 0 6px 20px rgba(61, 122, 92, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
                    background: linear-gradient(135deg, rgba(5, 20, 16, 0.98) 0%, rgba(30, 58, 95, 0.62) 100%) !important;
                    transform: translateY(-1px) !important;
                }
                
                .login-input-field .ant-input-password-icon {
                    color: rgba(90, 158, 120, 0.85) !important;
                    transition: all 0.3s ease !important;
                    font-size: 16px !important;
                    padding-right: 12px !important;
                }
                
                .login-input-field .ant-input-password-icon:hover {
                    color: rgba(187, 247, 208, 0.95) !important;
                    transform: scale(1.1) !important;
                }
                
                .ant-form-item-has-error .login-input-field.ant-input,
                .ant-form-item-has-error .login-input-field input,
                .ant-form-item-has-error .login-input-field.ant-input-affix-wrapper {
                    border-color: rgba(239, 68, 68, 0.7) !important;
                    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15), 0 2px 10px rgba(239, 68, 68, 0.2) !important;
                }
                
                .ant-form-item-has-error .login-input-field.ant-input-affix-wrapper input {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                }
            `}</style>
        </>
    );
}

export default function Login() {
    return (
        <AdminShell>
            <LoginContent />
        </AdminShell>
    );
}
