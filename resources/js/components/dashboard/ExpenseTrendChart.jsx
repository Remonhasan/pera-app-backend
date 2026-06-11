import { useMemo } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Card, Typography } from "antd";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { formatAdminDecimal } from "../../helpers/adminNumberFormat";
import { ADMIN_NAVY } from "../../theme/adminColors";

const { Title, Text } = Typography;

const CHART_HEIGHT = 340;

function ChartTooltip({ active, payload, t, locale }) {
    if (!active || !payload?.length) {
        return null;
    }
    const row = payload[0].payload;
    const loc = locale === "bn" ? "bn-BD" : "en-GB";
    const fullDate = new Intl.DateTimeFormat(loc, {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
        numberingSystem: locale === "bn" ? "beng" : "latn",
    }).format(new Date(`${row.date}T12:00:00`));

    return (
        <div
            style={{
                padding: "12px 16px",
                borderRadius: 12,
                background: "#fff",
                boxShadow: "0 10px 40px rgba(30, 58, 95, 0.14)",
                border: "1px solid rgba(30, 58, 95, 0.08)",
            }}
        >
            <div
                style={{
                    fontSize: 12,
                    color: "rgba(30, 58, 95, 0.55)",
                    marginBottom: 6,
                }}
            >
                {fullDate}
            </div>
            <div
                style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: ADMIN_NAVY,
                    fontVariantNumeric: "tabular-nums",
                }}
            >
                {formatAdminDecimal(payload[0].value, locale)}{" "}
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                    {t("dashboard.chartSeries")}
                </span>
            </div>
        </div>
    );
}

export default function ExpenseTrendChart({ trend, totalAmount, t, locale }) {
    const chartData = useMemo(() => {
        const loc = locale === "bn" ? "bn-BD" : "en-GB";
        const dateOpts = {
            day: "numeric",
            month: "short",
            numberingSystem: locale === "bn" ? "beng" : "latn",
        };
        return (trend ?? []).map((row) => ({
            ...row,
            labelShort: new Intl.DateTimeFormat(loc, dateOpts).format(
                new Date(`${row.date}T12:00:00`),
            ),
        }));
    }, [trend, locale]);

    const hasActivity = useMemo(
        () =>
            chartData.some((row) => Number(row.amount) > 0) ||
            Number(totalAmount) > 0,
        [chartData, totalAmount],
    );

    const maxVal = useMemo(
        () =>
            Math.max(
                0.01,
                ...chartData.map((row) => Number(row.amount) || 0),
            ),
        [chartData],
    );

    return (
        <Card
            bordered={false}
            style={{
                marginTop: 8,
                borderRadius: 14,
                boxShadow: "0 2px 16px rgba(30, 58, 95, 0.07)",
                border: "1px solid rgba(30, 58, 95, 0.06)",
            }}
            styles={{ body: { padding: "24px 24px 12px" } }}
        >
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: 8,
                }}
            >
                <div>
                    <Title
                        level={5}
                        style={{
                            margin: 0,
                            color: ADMIN_NAVY,
                            fontWeight: 700,
                            letterSpacing: "-0.02em",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <RiMoneyDollarCircleLine
                            aria-hidden
                            style={{ fontSize: 20, flexShrink: 0 }}
                        />
                        {t("dashboard.chartTitle")}
                    </Title>
                    <Text
                        type="secondary"
                        style={{ display: "block", marginTop: 4, fontSize: 14 }}
                    >
                        {t("dashboard.chartSubtitle")}
                    </Text>
                </div>
                <div
                    style={{
                        padding: "10px 16px",
                        borderRadius: 12,
                        background: "rgba(30, 58, 95, 0.06)",
                        textAlign: "right",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 2,
                    }}
                >
                    <Text
                        type="secondary"
                        style={{
                            fontSize: 11,
                            textTransform: "uppercase",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                        }}
                    >
                        <RiMoneyDollarCircleLine aria-hidden style={{ fontSize: 13 }} />
                        {t("dashboard.chartSeries")}
                    </Text>
                    <div
                        style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: ADMIN_NAVY,
                            lineHeight: 1.2,
                            fontVariantNumeric: "tabular-nums",
                        }}
                    >
                        {formatAdminDecimal(totalAmount ?? 0, locale)}
                    </div>
                </div>
            </div>

            {!hasActivity ? (
                <div
                    style={{
                        height: CHART_HEIGHT,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "rgba(30, 58, 95, 0.45)",
                        fontSize: 15,
                        fontWeight: 500,
                        borderRadius: 12,
                        background:
                            "linear-gradient(180deg, rgba(30,58,95,0.04) 0%, rgba(30,58,95,0.02) 100%)",
                    }}
                >
                    {t("dashboard.chartEmpty")}
                </div>
            ) : (
                <div style={{ width: "100%", height: CHART_HEIGHT }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 12, right: 8, left: -8, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient
                                    id="adminExpenseTrendFill"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor={ADMIN_NAVY}
                                        stopOpacity={0.28}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor={ADMIN_NAVY}
                                        stopOpacity={0.02}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="4 8"
                                vertical={false}
                                stroke="rgba(30, 58, 95, 0.08)"
                            />
                            <XAxis
                                dataKey="labelShort"
                                tick={{
                                    fill: "rgba(30, 58, 95, 0.5)",
                                    fontSize: 11,
                                }}
                                tickLine={false}
                                axisLine={false}
                                dy={8}
                                interval="preserveStartEnd"
                                minTickGap={28}
                            />
                            <YAxis
                                width={44}
                                tick={{
                                    fill: "rgba(30, 58, 95, 0.5)",
                                    fontSize: 11,
                                }}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals
                                domain={[0, maxVal]}
                                tickFormatter={(v) => formatAdminDecimal(v, locale)}
                            />
                            <Tooltip
                                content={(props) => (
                                    <ChartTooltip
                                        {...props}
                                        t={t}
                                        locale={locale}
                                    />
                                )}
                                cursor={{
                                    stroke: ADMIN_NAVY,
                                    strokeWidth: 1,
                                    strokeOpacity: 0.25,
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke={ADMIN_NAVY}
                                strokeWidth={2.5}
                                fill="url(#adminExpenseTrendFill)"
                                activeDot={{
                                    r: 6,
                                    strokeWidth: 2,
                                    stroke: "#fff",
                                    fill: ADMIN_NAVY,
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </Card>
    );
}
