import { Link, usePage } from "@inertiajs/react";
import { Menu } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useAdminT } from "../../contexts/AdminI18nContext";
import {
    RiHomeOfficeLine,
    RiListCheck2,
    RiPriceTag3Line,
    RiWallet3Line,
    RiMoneyDollarCircleLine,
    RiBankLine,
    RiSafe2Line,
    RiExchangeDollarLine,
    RiBookReadLine,
    RiBriefcaseLine,
    RiBookOpenLine,
    RiBookmarkLine,
    RiStickyNoteLine,
    RiTaskLine,
    RiHeartPulseLine,
    RiFlagLine,
    RiFocus3Line,
    RiAwardLine,
    RiFileChartLine,
    RiKey2Line,
    RiSettings3Line,
    RiShieldUserLine,
    RiUser3Line,
} from "react-icons/ri";
import { route } from "ziggy-js";
import { ADMIN_NAVY } from "../../theme/adminColors";

/** Map nested administrative routes to the sidebar item key (Ziggy returns e.g. administrative.user.edit). */
function menuKeyForRoute(name, urlPath) {
    if (typeof name === "string") {
        if (name.startsWith("administrative.user.")) {
            return "administrative.user.index";
        }
        if (name.startsWith("administrative.role.")) {
            return "administrative.role.index";
        }
        if (name.startsWith("administrative.permission.")) {
            return "administrative.permission.index";
        }
        if (name.startsWith("administrative.budget-type.")) {
            return "administrative.budget-type.index";
        }
        if (name.startsWith("administrative.budget.")) {
            return "administrative.budget.index";
        }
        if (name.startsWith("administrative.expense-target.")) {
            return "administrative.expense-target.index";
        }
        if (name.startsWith("administrative.expense-type.")) {
            return "administrative.expense-type.index";
        }
        if (name.startsWith("administrative.expense.")) {
            return "administrative.expense.index";
        }
        if (name.startsWith("administrative.bank.")) {
            return "administrative.bank.index";
        }
        if (name.startsWith("administrative.saving-type.")) {
            return "administrative.saving-type.index";
        }
        if (name.startsWith("administrative.saving.")) {
            return "administrative.saving.index";
        }
        if (name.startsWith("administrative.withdraw.")) {
            return "administrative.withdraw.index";
        }
        if (name.startsWith("administrative.goal.")) {
            return "administrative.goal.index";
        }
        if (name.startsWith("administrative.job-type.")) {
            return "administrative.job-type.index";
        }
        if (name.startsWith("administrative.subject.")) {
            return "administrative.subject.index";
        }
        if (name.startsWith("administrative.topic.")) {
            return "administrative.topic.index";
        }
        if (name.startsWith("administrative.note.")) {
            return "administrative.note.index";
        }
        if (name.startsWith("administrative.exam.")) {
            return "administrative.exam.index";
        }
        if (name.startsWith("administrative.task-type.")) {
            return "administrative.task-type.index";
        }
        if (name.startsWith("administrative.task.")) {
            return "administrative.task.index";
        }
        if (name.startsWith("administrative.habit-type.")) {
            return "administrative.habit-type.index";
        }
        if (name.startsWith("administrative.habit.")) {
            return "administrative.habit.index";
        }
        if (name.startsWith("administrative.notice.")) {
            return "administrative.notice.index";
        }
        if (name.startsWith("administrative.notifications.")) {
            return "administrative.notifications.page";
        }
        return name;
    }
    const path = (urlPath || "").split("?")[0].replace(/\/$/, "") || "/";
    if (
        path === "/administrative/dashboard" ||
        path.endsWith("/administrative/dashboard")
    ) {
        return "administrative.dashboard";
    }
    if (path.includes("/administrative/user")) {
        return "administrative.user.index";
    }
    if (path.includes("/administrative/role")) {
        return "administrative.role.index";
    }
    if (path.includes("/administrative/permission")) {
        return "administrative.permission.index";
    }
    if (path.includes("/administrative/notifications")) {
        return "administrative.notifications.page";
    }
    return null;
}

const Sidebar = () => {
    const { t } = useAdminT();
    const page = usePage();
    const { auth } = page.props;
    const url = page.url;
    const ziggyName = route().current();
    const permissions = auth?.permissions || [];

    const hasPermission = (permission) => permissions.includes(permission);

    const menuItems = [
        {
            key: "administrative.dashboard",
            icon: <RiHomeOfficeLine />,
            label: (
                <Link preserveScroll href={route("administrative.dashboard")}>
                    {t("nav.dashboard")}
                </Link>
            ),
        },
        hasPermission("expense_target_list") && {
            key: "administrative.expense-target.index",
            icon: <RiFocus3Line />,
            label: (
                <Link
                    preserveScroll
                    href={route("administrative.expense-target.index")}
                >
                    {t("nav.expenseTargets")}
                </Link>
            ),
        },
        (hasPermission("budget_type_list") || hasPermission("budget_list")) && {
            key: "nav-budget",
            icon: <RiWallet3Line />,
            label: t("nav.budget"),
            children: [
                hasPermission("budget_type_list") && {
                    key: "administrative.budget-type.index",
                    icon: <RiPriceTag3Line />,
                    label: (
                        <Link
                            preserveScroll
                            href={route("administrative.budget-type.index")}
                        >
                            {t("nav.budgetTypes")}
                        </Link>
                    ),
                },
                hasPermission("budget_list") && {
                    key: "administrative.budget.index",
                    icon: <RiWallet3Line />,
                    label: (
                        <Link
                            preserveScroll
                            href={route("administrative.budget.index")}
                        >
                            {t("nav.budgets")}
                        </Link>
                    ),
                },
            ].filter(Boolean),
        },
        (hasPermission("expense_type_list") ||
            hasPermission("expense_list")) && {
            key: "nav-expense",
            icon: <RiMoneyDollarCircleLine />,
            label: t("nav.expense"),
            children: [
                hasPermission("expense_type_list") && {
                    key: "administrative.expense-type.index",
                    icon: <RiPriceTag3Line />,
                    label: (
                        <Link
                            preserveScroll
                            href={route("administrative.expense-type.index")}
                        >
                            {t("nav.expenseTypes")}
                        </Link>
                    ),
                },
                hasPermission("expense_list") && {
                    key: "administrative.expense.index",
                    icon: <RiMoneyDollarCircleLine />,
                    label: (
                        <Link
                            preserveScroll
                            href={route("administrative.expense.index")}
                        >
                            {t("nav.expenses")}
                        </Link>
                    ),
                },
            ].filter(Boolean),
        },
        (hasPermission("bank_list") ||
            hasPermission("saving_type_list") ||
            hasPermission("saving_list") ||
            hasPermission("withdraw_list") ||
            hasPermission("goal_list")) && {
            key: "nav-savings",
            icon: <RiSafe2Line />,
            label: t("nav.savings"),
            children: [
                hasPermission("bank_list") && {
                    key: "administrative.bank.index",
                    icon: <RiBankLine />,
                    label: (
                        <Link
                            preserveScroll
                            href={route("administrative.bank.index")}
                        >
                            {t("nav.banks")}
                        </Link>
                    ),
                },
                hasPermission("saving_type_list") && {
                    key: "administrative.saving-type.index",
                    icon: <RiPriceTag3Line />,
                    label: (
                        <Link
                            preserveScroll
                            href={route("administrative.saving-type.index")}
                        >
                            {t("nav.savingTypes")}
                        </Link>
                    ),
                },
                hasPermission("saving_list") && {
                    key: "administrative.saving.index",
                    icon: <RiSafe2Line />,
                    label: (
                        <Link
                            preserveScroll
                            href={route("administrative.saving.index")}
                        >
                            {t("nav.savingsRecords")}
                        </Link>
                    ),
                },
                hasPermission("withdraw_list") && {
                    key: "administrative.withdraw.index",
                    icon: <RiExchangeDollarLine />,
                    label: (
                        <Link
                            preserveScroll
                            href={route("administrative.withdraw.index")}
                        >
                            {t("nav.withdraws")}
                        </Link>
                    ),
                },
                hasPermission("goal_list") && {
                    key: "administrative.goal.index",
                    icon: <RiFlagLine />,
                    label: (
                        <Link
                            preserveScroll
                            href={route("administrative.goal.index")}
                        >
                            {t("nav.goals")}
                        </Link>
                    ),
                },
            ].filter(Boolean),
        },
        (hasPermission("job_type_list") ||
            hasPermission("subject_list") ||
            hasPermission("topic_list") ||
            hasPermission("note_list") ||
            hasPermission("study_goal_list") ||
            hasPermission("exam_list")) && {
            key: "nav-study",
            icon: <RiBookReadLine />,
            label: t("nav.study"),
            children: [
                hasPermission("job_type_list") && {
                    key: "administrative.job-type.index",
                    icon: <RiBriefcaseLine />,
                    label: (
                        <Link
                            preserveScroll
                            href={route("administrative.job-type.index")}
                        >
                            {t("nav.jobTypes")}
                        </Link>
                    ),
                },
                hasPermission("subject_list") && {
                    key: "administrative.subject.index",
                    icon: <RiBookOpenLine />,
                    label: (
                        <Link
                            preserveScroll
                            href={route("administrative.subject.index")}
                        >
                            {t("nav.subjects")}
                        </Link>
                    ),
                },
                hasPermission("topic_list") && {
                    key: "administrative.topic.index",
                    icon: <RiBookmarkLine />,
                    label: (
                        <Link
                            preserveScroll
                            href={route("administrative.topic.index")}
                        >
                            {t("nav.topics")}
                        </Link>
                    ),
                },
                hasPermission("note_list") && {
                    key: "administrative.note.index",
                    icon: <RiStickyNoteLine />,
                    label: (
                        <Link
                            preserveScroll
                            href={route("administrative.note.index")}
                        >
                            {t("nav.notes")}
                        </Link>
                    ),
                },
                hasPermission("study_goal_list") && {
                    key: "administrative.study-goal.index",
                    icon: <RiFocus3Line />,
                    label: (
                        <Link
                            preserveScroll
                            href={route("administrative.study-goal.index")}
                        >
                            {t("nav.studyGoals")}
                        </Link>
                    ),
                },
                hasPermission("exam_list") && {
                    key: "administrative.exam.index",
                    icon: <RiAwardLine />,
                    label: (
                        <Link
                            preserveScroll
                            href={route("administrative.exam.index")}
                        >
                            {t("nav.exams")}
                        </Link>
                    ),
                },
            ].filter(Boolean),
        },
        (hasPermission("task_type_list") || hasPermission("task_list")) && {
            key: "nav-task",
            icon: <RiTaskLine />,
            label: t("nav.tasks"),
            children: [
                hasPermission("task_type_list") && {
                    key: "administrative.task-type.index",
                    icon: <RiListCheck2 />,
                    label: (
                        <Link
                            preserveScroll
                            href={route("administrative.task-type.index")}
                        >
                            {t("nav.taskTypes")}
                        </Link>
                    ),
                },
                hasPermission("task_list") && {
                    key: "administrative.task.index",
                    icon: <RiTaskLine />,
                    label: (
                        <Link
                            preserveScroll
                            href={route("administrative.task.index")}
                        >
                            {t("nav.tasksRecords")}
                        </Link>
                    ),
                },
            ].filter(Boolean),
        },
        (hasPermission("habit_type_list") || hasPermission("habit_list")) && {
            key: "nav-habit",
            icon: <RiHeartPulseLine />,
            label: t("nav.habits"),
            children: [
                hasPermission("habit_type_list") && {
                    key: "administrative.habit-type.index",
                    icon: <RiListCheck2 />,
                    label: (
                        <Link
                            preserveScroll
                            href={route("administrative.habit-type.index")}
                        >
                            {t("nav.habitTypes")}
                        </Link>
                    ),
                },
                hasPermission("habit_list") && {
                    key: "administrative.habit.index",
                    icon: <RiHeartPulseLine />,
                    label: (
                        <Link
                            preserveScroll
                            href={route("administrative.habit.index")}
                        >
                            {t("nav.habitsRecords")}
                        </Link>
                    ),
                },
            ].filter(Boolean),
        },
        hasPermission("report_list") && {
            key: "nav-report",
            icon: <RiFileChartLine />,
            label: t("nav.reports"),
            children: [
                {
                    key: "nav-report-expense",
                    icon: <RiMoneyDollarCircleLine />,
                    label: t("nav.reportExpense"),
                    children: [
                        {
                            key: "administrative.report.daily-expense.index",
                            icon: <RiMoneyDollarCircleLine />,
                            label: (
                                <Link
                                    preserveScroll
                                    href={route(
                                        "administrative.report.daily-expense.index",
                                    )}
                                >
                                    {t("nav.dailyExpense")}
                                </Link>
                            ),
                        },
                        {
                            key: "administrative.report.expense-track.index",
                            icon: <RiWallet3Line />,
                            label: (
                                <Link
                                    preserveScroll
                                    href={route(
                                        "administrative.report.expense-track.index",
                                    )}
                                >
                                    {t("nav.expenseTrackReport")}
                                </Link>
                            ),
                        },
                        {
                            key: "administrative.report.expense-target.index",
                            icon: <RiFocus3Line />,
                            label: (
                                <Link
                                    preserveScroll
                                    href={route(
                                        "administrative.report.expense-target.index",
                                    )}
                                >
                                    {t("nav.expenseTargetReport")}
                                </Link>
                            ),
                        },
                    ],
                },
                {
                    key: "administrative.report.savings.index",
                    icon: <RiSafe2Line />,
                    label: (
                        <Link
                            preserveScroll
                            href={route("administrative.report.savings.index")}
                        >
                            {t("nav.savingsReport")}
                        </Link>
                    ),
                },
                {
                    key: "administrative.report.topicwise-study-goal.index",
                    icon: <RiFocus3Line />,
                    label: (
                        <Link
                            preserveScroll
                            href={route(
                                "administrative.report.topicwise-study-goal.index",
                            )}
                        >
                            {t("nav.topicwiseStudyGoal")}
                        </Link>
                    ),
                },
                // {
                //     key: "nav-report-study",
                //     icon: <RiBookReadLine />,
                //     label: t("nav.reportStudy"),
                //     children: [
                //         {
                //             key: "administrative.report.study.index",
                //             icon: <RiBookReadLine />,
                //             label: (
                //                 <Link
                //                     preserveScroll
                //                     href={route(
                //                         "administrative.report.study.index",
                //                     )}
                //                 >
                //                     {t("nav.studyReport")}
                //                 </Link>
                //             ),
                //         },
                //         {
                //             key: "administrative.report.topicwise-study-goal.index",
                //             icon: <RiFocus3Line />,
                //             label: (
                //                 <Link
                //                     preserveScroll
                //                     href={route(
                //                         "administrative.report.topicwise-study-goal.index",
                //                     )}
                //                 >
                //                     {t("nav.topicwiseStudyGoal")}
                //                 </Link>
                //             ),
                //         },
                //     ],
                // },
            ],
        },
        // hasPermission("notice_list") && {
        //     key: "administrative.notice.index",
        //     icon: <RiNotification3Line />,
        //     label: (
        //         <Link
        //             preserveScroll
        //             href={route("administrative.notice.index")}
        //         >
        //             {t("nav.notices")}
        //         </Link>
        //     ),
        // },
        (hasPermission("user_list") ||
            hasPermission("role_list") ||
            hasPermission("permission_list")) && {
            key: "nav-settings",
            icon: <RiSettings3Line />,
            label: t("nav.settings"),
            children: [
                hasPermission("user_list") && {
                    key: "administrative.user.index",
                    icon: <RiUser3Line />,
                    label: (
                        <Link
                            preserveScroll
                            href={route("administrative.user.index")}
                        >
                            {t("nav.users")}
                        </Link>
                    ),
                },
                hasPermission("role_list") && {
                    key: "administrative.role.index",
                    icon: <RiShieldUserLine />,
                    label: (
                        <Link
                            preserveScroll
                            href={route("administrative.role.index")}
                        >
                            {t("nav.roles")}
                        </Link>
                    ),
                },
                hasPermission("permission_list") && {
                    key: "administrative.permission.index",
                    icon: <RiKey2Line />,
                    label: (
                        <Link
                            preserveScroll
                            href={route("administrative.permission.index")}
                        >
                            {t("nav.permissions")}
                        </Link>
                    ),
                },
            ].filter(Boolean),
        },
        // hasPermission("notification_list") && {
        //     key: "administrative.notifications.page",
        //     icon: <RiNotification3Line />,
        //     label: (
        //         <Link
        //             preserveScroll
        //             href={route("administrative.notifications.page")}
        //         >
        //             {t("nav.notifications")}
        //         </Link>
        //     ),
        // },
    ].filter(Boolean);

    const selectedKey = useMemo(
        () => menuKeyForRoute(ziggyName, url),
        [ziggyName, url],
    );
    const selectedKeys = selectedKey ? [selectedKey] : [];

    const settingsLeafKeys = useMemo(
        () => [
            "administrative.user.index",
            "administrative.role.index",
            "administrative.permission.index",
        ],
        [],
    );
    const budgetLeafKeys = useMemo(
        () => [
            "administrative.budget-type.index",
            "administrative.budget.index",
        ],
        [],
    );
    const expenseLeafKeys = useMemo(
        () => [
            "administrative.expense-type.index",
            "administrative.expense.index",
        ],
        [],
    );
    const savingsLeafKeys = useMemo(
        () => [
            "administrative.bank.index",
            "administrative.saving-type.index",
            "administrative.saving.index",
            "administrative.withdraw.index",
            "administrative.goal.index",
        ],
        [],
    );
    const studyLeafKeys = useMemo(
        () => [
            "administrative.job-type.index",
            "administrative.subject.index",
            "administrative.topic.index",
            "administrative.note.index",
            "administrative.study-goal.index",
            "administrative.exam.index",
        ],
        [],
    );
    const taskLeafKeys = useMemo(
        () => ["administrative.task-type.index", "administrative.task.index"],
        [],
    );
    const habitLeafKeys = useMemo(
        () => ["administrative.habit-type.index", "administrative.habit.index"],
        [],
    );
    const reportExpenseLeafKeys = useMemo(
        () => [
            "administrative.report.daily-expense.index",
            "administrative.report.expense-track.index",
            "administrative.report.expense-target.index",
        ],
        [],
    );
    const reportLeafKeys = useMemo(
        () => [
            "administrative.report.daily-expense.index",
            "administrative.report.expense-track.index",
            "administrative.report.expense-target.index",
            "administrative.report.savings.index",
            "administrative.report.study.index",
            "administrative.report.topicwise-study-goal.index",
        ],
        [],
    );
    const reportStudyLeafKeys = useMemo(
        () => [
            "administrative.report.study.index",
            "administrative.report.topicwise-study-goal.index",
        ],
        [],
    );
    const [openKeys, setOpenKeys] = useState([]);
    useEffect(() => {
        setOpenKeys((prev) => {
            let next = prev;
            if (
                selectedKey &&
                settingsLeafKeys.includes(selectedKey) &&
                !next.includes("nav-settings")
            ) {
                next = [...next, "nav-settings"];
            }
            if (
                selectedKey &&
                budgetLeafKeys.includes(selectedKey) &&
                !next.includes("nav-budget")
            ) {
                next = [...next, "nav-budget"];
            }
            if (
                selectedKey &&
                expenseLeafKeys.includes(selectedKey) &&
                !next.includes("nav-expense")
            ) {
                next = [...next, "nav-expense"];
            }
            if (
                selectedKey &&
                savingsLeafKeys.includes(selectedKey) &&
                !next.includes("nav-savings")
            ) {
                next = [...next, "nav-savings"];
            }
            if (
                selectedKey &&
                studyLeafKeys.includes(selectedKey) &&
                !next.includes("nav-study")
            ) {
                next = [...next, "nav-study"];
            }
            if (
                selectedKey &&
                taskLeafKeys.includes(selectedKey) &&
                !next.includes("nav-task")
            ) {
                next = [...next, "nav-task"];
            }
            if (
                selectedKey &&
                habitLeafKeys.includes(selectedKey) &&
                !next.includes("nav-habit")
            ) {
                next = [...next, "nav-habit"];
            }
            if (
                selectedKey &&
                reportLeafKeys.includes(selectedKey) &&
                !next.includes("nav-report")
            ) {
                next = [...next, "nav-report"];
            }
            if (
                selectedKey &&
                reportStudyLeafKeys.includes(selectedKey) &&
                !next.includes("nav-report-study")
            ) {
                next = [...next, "nav-report-study"];
            }
            if (
                selectedKey &&
                reportExpenseLeafKeys.includes(selectedKey) &&
                !next.includes("nav-report-expense")
            ) {
                next = [...next, "nav-report-expense"];
            }
            return next;
        });
    }, [
        selectedKey,
        url,
        settingsLeafKeys,
        budgetLeafKeys,
        expenseLeafKeys,
        savingsLeafKeys,
        studyLeafKeys,
        taskLeafKeys,
        habitLeafKeys,
        reportLeafKeys,
        reportStudyLeafKeys,
        reportExpenseLeafKeys,
    ]);

    return (
        <div className="sidebar-menu-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 pb-4">
            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={selectedKeys}
                openKeys={openKeys}
                onOpenChange={setOpenKeys}
                items={menuItems}
                className="sidebar-menu !border-e-0 shadow-none text-base font-medium !bg-transparent"
            />

            <style>{`
                .sidebar-menu .ant-menu-item-selected::after {
                    display: none;
                }
                /* Admin ConfigProvider sets colorPrimary = sidebar navy; antd uses it as darkItemSelectedBg, so the default "active" state was invisible. */
                .sidebar-menu.ant-menu-dark.ant-menu-inline .ant-menu-item:hover:not(.ant-menu-item-selected):not(.ant-menu-item-disabled) {
                    background-color: rgba(255, 255, 255, 0.08) !important;
                }
                .sidebar-menu.ant-menu-dark.ant-menu-inline .ant-menu-item-selected {
                    background-color: rgba(255, 255, 255, 0.14) !important;
                }
                .sidebar-menu.ant-menu-dark.ant-menu-inline .ant-menu-item-selected:hover:not(.ant-menu-item-disabled) {
                    background-color: rgba(255, 255, 255, 0.18) !important;
                }
                .sidebar-menu.ant-menu-dark.ant-menu-inline .ant-menu-item-active:not(.ant-menu-item-selected):not(.ant-menu-item-disabled) {
                    background-color: rgba(255, 255, 255, 0.08) !important;
                }
                .sidebar-menu.ant-menu-dark .ant-menu-item a,
                .sidebar-menu.ant-menu-dark .ant-menu-title-content a {
                    color: #ffffff !important;
                }
                .sidebar-menu.ant-menu-dark .ant-menu-item-icon {
                    color: rgba(255, 255, 255, 0.92) !important;
                }
                .sidebar-menu.ant-menu-dark .ant-menu-item-selected .ant-menu-item-icon {
                    color: #ffffff !important;
                }
                .sidebar-menu.ant-menu-dark .ant-menu-item:hover .ant-menu-item-icon,
                .sidebar-menu.ant-menu-dark .ant-menu-item-active .ant-menu-item-icon {
                    color: #ffffff !important;
                }
                .sidebar-menu.ant-menu-dark .ant-menu-submenu-title,
                .sidebar-menu.ant-menu-dark .ant-menu-submenu-title .ant-menu-title-content {
                    color: #ffffff !important;
                }
                .sidebar-menu.ant-menu-dark .ant-menu-submenu-title:hover {
                    background-color: rgba(255, 255, 255, 0.08) !important;
                }
                /* Inline submenu: antd dark theme uses a separate grey/black bg — align with sider (ADMIN_NAVY). */
                .sidebar-menu.ant-menu-dark .ant-menu-sub.ant-menu-inline {
                    background: ${ADMIN_NAVY} !important;
                }
                .sidebar-menu.ant-menu-dark.ant-menu-inline .ant-menu-submenu .ant-menu-item {
                    background-color: transparent !important;
                }
                .sidebar-menu.ant-menu-dark .ant-menu-submenu-open > .ant-menu-submenu-title {
                    background-color: transparent !important;
                }
                .sidebar-menu.ant-menu-dark .ant-menu-submenu .ant-menu-item:hover:not(.ant-menu-item-selected):not(.ant-menu-item-disabled) {
                    background-color: rgba(255, 255, 255, 0.08) !important;
                }
                .sidebar-menu.ant-menu-dark .ant-menu-submenu .ant-menu-item-selected {
                    background-color: rgba(255, 255, 255, 0.14) !important;
                }
                .sidebar-menu.ant-menu-dark .ant-menu-submenu .ant-menu-item-selected:hover:not(.ant-menu-item-disabled) {
                    background-color: rgba(255, 255, 255, 0.18) !important;
                }
                .sidebar-menu.ant-menu-dark .ant-menu-submenu .ant-menu-item-active:not(.ant-menu-item-selected):not(.ant-menu-item-disabled) {
                    background-color: rgba(255, 255, 255, 0.08) !important;
                }
            `}</style>
        </div>
    );
};

export default Sidebar;
