import { Head, Link, router, usePage } from "@inertiajs/react";
import { Card, Col, DatePicker, Empty, Row, Typography } from "antd";
import dayjs from "dayjs";
import { useCallback, useMemo } from "react";
import { route } from "ziggy-js";
import {
    RiBookReadLine,
    RiFlagLine,
    RiHeartPulseLine,
    RiMoneyDollarCircleLine,
    RiSafe2Line,
    RiTaskLine,
    RiWallet3Line,
} from "react-icons/ri";
import ExpenseTrendChart from "../../components/dashboard/ExpenseTrendChart";
import AppLayout from "../../components/layouts/AppLayout";
import { useAdminT } from "../../contexts/AdminI18nContext";
import {
    formatAdminDecimal,
    formatAdminInteger,
} from "../../helpers/adminNumberFormat";
import { ADMIN_NAVY } from "../../theme/adminColors";

const { Title } = Typography;

function StatCard({
    title,
    value,
    icon,
    accent,
    href,
    cardBackground,
    borderColor,
    locale,
    formatValue,
}) {
    const displayValue = formatValue
        ? formatValue(value, locale)
        : formatAdminInteger(value, locale);

    const body = (
        <Card
            bordered={false}
            className="admin-dashboard-stat-card"
            style={{
                borderRadius: 12,
                border: `1px solid ${borderColor}`,
                background: cardBackground,
                height: "100%",
            }}
            styles={{
                body: {
                    padding: "14px 16px",
                    height: "100%",
                    background: "transparent",
                },
            }}
        >
            <div className="flex h-full items-center gap-3">
                <div
                    className="flex shrink-0 items-center justify-center"
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: accent,
                        color: "#fff",
                        fontSize: 20,
                        boxShadow: `0 4px 12px ${borderColor}`,
                    }}
                    aria-hidden
                >
                    {icon}
                </div>
                <div className="min-w-0 flex-1">
                    <div
                        className="truncate text-xs font-medium leading-tight"
                        style={{ color: "rgba(30, 58, 95, 0.58)" }}
                        title={title}
                    >
                        {title}
                    </div>
                    <div
                        className="mt-0.5 truncate text-xl font-bold leading-tight"
                        style={{
                            color: ADMIN_NAVY,
                            fontVariantNumeric: "tabular-nums",
                            letterSpacing: "-0.02em",
                        }}
                        title={displayValue}
                    >
                        {displayValue}
                    </div>
                </div>
            </div>
        </Card>
    );

    if (href) {
        return (
            <Link
                href={href}
                className="admin-dashboard-stat-link block h-full text-inherit no-underline hover:text-inherit focus:text-inherit"
            >
                {body}
            </Link>
        );
    }

    return body;
}

function buildCards(dashboardData, t, hasPermission) {
    const decimal = (value, locale) => formatAdminDecimal(value, locale, 2);
    const cards = [];

    if (hasPermission("budget_list") && dashboardData?.budget) {
        cards.push({
            key: "budget-amount",
            title: t("dashboard.totalBudget"),
            value: dashboardData.budget.amount ?? 0,
            href: route("administrative.budget.index"),
            icon: <RiWallet3Line />,
            accent: "#531dab",
            cardBackground:
                "linear-gradient(135deg, #fdfaff 0%, #f3e8ff 100%)",
            borderColor: "rgba(83, 29, 171, 0.18)",
            formatValue: decimal,
        });
    }

    if (hasPermission("expense_list") && dashboardData?.expense) {
        cards.push({
            key: "expense-amount",
            title: t("dashboard.totalExpense"),
            value: dashboardData.expense.amount ?? 0,
            href: route("administrative.expense.index"),
            icon: <RiMoneyDollarCircleLine />,
            accent: "#cf1322",
            cardBackground:
                "linear-gradient(135deg, #fffafa 0%, #fff1f0 100%)",
            borderColor: "rgba(207, 19, 34, 0.18)",
            formatValue: decimal,
        });
    }

    if (hasPermission("saving_list") && dashboardData?.savings?.saved != null) {
        cards.push({
            key: "savings-saved",
            title: t("dashboard.totalSaved"),
            value: dashboardData.savings.saved ?? 0,
            href: route("administrative.saving.index"),
            icon: <RiSafe2Line />,
            accent: "#389e0d",
            cardBackground:
                "linear-gradient(135deg, #f9fff6 0%, #e8f8e0 100%)",
            borderColor: "rgba(56, 158, 13, 0.2)",
            formatValue: decimal,
        });
    }

    if (
        hasPermission("withdraw_list") &&
        dashboardData?.savings?.withdrawn != null
    ) {
        cards.push({
            key: "savings-withdrawn",
            title: t("dashboard.totalWithdrawn"),
            value: dashboardData.savings.withdrawn ?? 0,
            href: route("administrative.withdraw.index"),
            icon: <RiSafe2Line />,
            accent: "#d48806",
            cardBackground:
                "linear-gradient(135deg, #fffdf8 0%, #fff4e0 100%)",
            borderColor: "rgba(212, 136, 6, 0.18)",
            formatValue: decimal,
        });
    }

    if (hasPermission("goal_list") && dashboardData?.goals) {
        cards.push(
            {
                key: "goals-active",
                title: t("dashboard.activeGoals"),
                value: dashboardData.goals.active ?? 0,
                href: route("administrative.goal.index"),
                icon: <RiFlagLine />,
                accent: "#096dd9",
                cardBackground:
                    "linear-gradient(135deg, #f0f8ff 0%, #e6f4ff 100%)",
                borderColor: "rgba(9, 109, 217, 0.18)",
            },
            {
                key: "goals-achieved",
                title: t("dashboard.achievedGoals"),
                value: dashboardData.goals.achieved ?? 0,
                href: route("administrative.goal.index"),
                icon: <RiFlagLine />,
                accent: "#389e0d",
                cardBackground:
                    "linear-gradient(135deg, #f9fff6 0%, #e8f8e0 100%)",
                borderColor: "rgba(56, 158, 13, 0.2)",
            },
        );
    }

    if (hasPermission("note_list") && dashboardData?.study?.notes != null) {
        cards.push({
            key: "study-notes",
            title: t("dashboard.studyNotes"),
            value: dashboardData.study.notes ?? 0,
            href: route("administrative.note.index"),
            icon: <RiBookReadLine />,
            accent: ADMIN_NAVY,
            cardBackground:
                "linear-gradient(135deg, #fafcff 0%, #e8f0fb 100%)",
            borderColor: "rgba(30, 58, 95, 0.15)",
        });
    }

    if (
        hasPermission("study_goal_list") &&
        dashboardData?.study?.studyGoals != null
    ) {
        cards.push({
            key: "study-goals",
            title: t("dashboard.studyGoals"),
            value: dashboardData.study.studyGoals ?? 0,
            href: route("administrative.study-goal.index"),
            icon: <RiBookReadLine />,
            accent: "#531dab",
            cardBackground:
                "linear-gradient(135deg, #fdfaff 0%, #f3e8ff 100%)",
            borderColor: "rgba(83, 29, 171, 0.18)",
        });
    }

    if (hasPermission("task_list") && dashboardData?.tasks) {
        cards.push(
            {
                key: "tasks-pending",
                title: t("dashboard.pendingTasks"),
                value: dashboardData.tasks.pending ?? 0,
                href: route("administrative.task.index"),
                icon: <RiTaskLine />,
                accent: "#d48806",
                cardBackground:
                    "linear-gradient(135deg, #fffdf8 0%, #fff4e0 100%)",
                borderColor: "rgba(212, 136, 6, 0.18)",
            },
            {
                key: "tasks-doing",
                title: t("dashboard.doingTasks"),
                value: dashboardData.tasks.doing ?? 0,
                href: route("administrative.task.index"),
                icon: <RiTaskLine />,
                accent: "#096dd9",
                cardBackground:
                    "linear-gradient(135deg, #f0f8ff 0%, #e6f4ff 100%)",
                borderColor: "rgba(9, 109, 217, 0.18)",
            },
            {
                key: "tasks-completed",
                title: t("dashboard.completedTasks"),
                value: dashboardData.tasks.completed ?? 0,
                href: route("administrative.task.index"),
                icon: <RiTaskLine />,
                accent: "#389e0d",
                cardBackground:
                    "linear-gradient(135deg, #f9fff6 0%, #e8f8e0 100%)",
                borderColor: "rgba(56, 158, 13, 0.2)",
            },
        );
    }

    if (hasPermission("habit_list") && dashboardData?.habits) {
        cards.push({
            key: "habits-total",
            title: t("dashboard.totalHabits"),
            value: dashboardData.habits.total ?? 0,
            href: route("administrative.habit.index"),
            icon: <RiHeartPulseLine />,
            accent: "#c41d7f",
            cardBackground:
                "linear-gradient(135deg, #fff5fa 0%, #ffe6f1 100%)",
            borderColor: "rgba(196, 29, 127, 0.18)",
        });
    }

    return cards;
}

export default function Dashboard({ dashboardData, filters = {} }) {
    const { t, locale } = useAdminT();
    const { auth } = usePage().props;
    const permissions = auth?.permissions || [];
    const hasPermission = (permission) => permissions.includes(permission);

    const applyDateFilters = useCallback((nextFrom, nextTo) => {
        const q = {};
        if (nextFrom) {
            q.date_from = nextFrom.format("YYYY-MM-DD");
        }
        if (nextTo) {
            q.date_to = nextTo.format("YYYY-MM-DD");
        }
        router.get(route("administrative.dashboard"), q, {
            preserveScroll: true,
            replace: true,
        });
    }, []);

    const cards = useMemo(
        () => buildCards(dashboardData, t, hasPermission),
        [dashboardData, t, permissions],
    );

    const showExpenseChart =
        hasPermission("expense_list") && dashboardData?.expense?.trend;

    return (
        <AppLayout>
            <Head title={t("nav.dashboard")} />

            <Row
                justify="space-between"
                align="middle"
                gutter={[16, 16]}
                style={{ marginBottom: 20 }}
            >
                <Col xs={24} lg={12}>
                    <Title
                        level={4}
                        style={{
                            margin: 0,
                            color: ADMIN_NAVY,
                            fontWeight: 700,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        {t("dashboard.welcome")}
                    </Title>
                </Col>
                <Col xs={24} lg={12}>
                    <Row gutter={[12, 12]} justify="end" wrap={false}>
                        <Col xs={24} sm={12}>
                            <DatePicker
                                className="dashboard-filter-input w-full"
                                style={{ width: "100%" }}
                                placeholder={t("dashboard.dateFrom")}
                                value={
                                    filters?.date_from
                                        ? dayjs(filters.date_from)
                                        : null
                                }
                                onChange={(date) =>
                                    applyDateFilters(
                                        date,
                                        filters?.date_to
                                            ? dayjs(filters.date_to)
                                            : null,
                                    )
                                }
                                allowClear
                                size="large"
                            />
                        </Col>
                        <Col xs={24} sm={12}>
                            <DatePicker
                                className="dashboard-filter-input w-full"
                                style={{ width: "100%" }}
                                placeholder={t("dashboard.dateTo")}
                                value={
                                    filters?.date_to ? dayjs(filters.date_to) : null
                                }
                                onChange={(date) =>
                                    applyDateFilters(
                                        filters?.date_from
                                            ? dayjs(filters.date_from)
                                            : null,
                                        date,
                                    )
                                }
                                allowClear
                                size="large"
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>

            {cards.length === 0 ? (
                <Card
                    bordered={false}
                    style={{
                        borderRadius: 12,
                        border: "1px solid rgba(30, 58, 95, 0.08)",
                    }}
                >
                    <Empty description={t("dashboard.noModules")} />
                </Card>
            ) : (
                <Row gutter={[12, 12]}>
                    {cards.map((card) => (
                        <Col
                            key={card.key}
                            xs={12}
                            sm={8}
                            md={6}
                            lg={6}
                            xl={4}
                            xxl={4}
                        >
                            <StatCard
                                title={card.title}
                                value={card.value}
                                icon={card.icon}
                                accent={card.accent}
                                href={card.href}
                                cardBackground={card.cardBackground}
                                borderColor={card.borderColor}
                                locale={locale}
                                formatValue={card.formatValue}
                            />
                        </Col>
                    ))}
                </Row>
            )}

            {showExpenseChart && (
                <ExpenseTrendChart
                    trend={dashboardData.expense.trend}
                    totalAmount={dashboardData.expense.amount}
                    t={t}
                    locale={locale}
                />
            )}

            <style>{`
                .admin-dashboard-stat-link {
                    display: block;
                    height: 100%;
                    transition: transform 0.15s ease, box-shadow 0.15s ease;
                }
                .admin-dashboard-stat-link:hover .admin-dashboard-stat-card {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(30, 58, 95, 0.1);
                }
                .admin-dashboard-stat-card {
                    transition: transform 0.15s ease, box-shadow 0.15s ease;
                    box-shadow: 0 1px 4px rgba(30, 58, 95, 0.06);
                }
                .dashboard-filter-input.ant-picker {
                    border-radius: 12px !important;
                    min-height: 46px;
                    font-size: 15px;
                    border-color: #d9d9d9;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }
                .dashboard-filter-input.ant-picker:hover {
                    border-color: #1e3a5f !important;
                }
                .dashboard-filter-input.ant-picker-focused {
                    border-color: #1e3a5f !important;
                    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.12) !important;
                }
            `}</style>
        </AppLayout>
    );
}
