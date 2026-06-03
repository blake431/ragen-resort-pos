"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const CHART_COLORS = ["#059669", "#D4AF37", "#2563EB", "#DC2626", "#7C3AED", "#D97706"];

const tooltipStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  color: "#0f172a",
};

const gridStroke = "#e2e8f0";
const axisStroke = "#64748b";

export function ReportLineChart({
  data,
  dataKey = "revenue",
  xKey = "date",
  height = 260,
}: {
  data: { date: string; revenue: number }[];
  dataKey?: string;
  xKey?: string;
  height?: number;
}) {
  if (data.length === 0) return <ChartEmpty />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: axisStroke }} />
        <YAxis tick={{ fontSize: 11, fill: axisStroke }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey={dataKey} stroke="#D4AF37" strokeWidth={2} dot={{ fill: "#059669", r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ReportBarChart({
  data,
  dataKey,
  nameKey = "name",
  height = 260,
  layout = "horizontal",
  formatter,
}: {
  data: Record<string, string | number>[];
  dataKey: string;
  nameKey?: string;
  height?: number;
  layout?: "horizontal" | "vertical";
  formatter?: (v: number) => string;
}) {
  if (data.length === 0) return <ChartEmpty />;
  const fmt = formatter ?? ((v: number) => formatCurrency(v));

  if (layout === "vertical") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis type="number" tick={{ fontSize: 11, fill: axisStroke }} />
          <YAxis dataKey={nameKey} type="category" width={100} tick={{ fontSize: 10, fill: axisStroke }} />
          <Tooltip formatter={(v: number) => fmt(v)} contentStyle={tooltipStyle} />
          <Bar dataKey={dataKey} fill="#059669" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey={nameKey} tick={{ fontSize: 11, fill: axisStroke }} />
        <YAxis tick={{ fontSize: 11, fill: axisStroke }} />
        <Tooltip formatter={(v: number) => fmt(v)} contentStyle={tooltipStyle} />
        <Bar dataKey={dataKey} fill="#D4AF37" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ReportPieChart({
  data,
  height = 260,
  innerRadius = 0,
}: {
  data: { name: string; value: number }[];
  height?: number;
  innerRadius?: number;
}) {
  const filtered = data.filter((d) => d.value > 0);
  if (filtered.length === 0) return <ChartEmpty />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={filtered}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={90}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {filtered.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={tooltipStyle} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ReportGroupedBarChart({
  data,
  keys,
  labels,
  height = 280,
}: {
  data: Record<string, string | number>[];
  keys: string[];
  labels: string[];
  height?: number;
}) {
  if (data.length === 0) return <ChartEmpty />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: axisStroke }} />
        <YAxis tick={{ fontSize: 11, fill: axisStroke }} />
        <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={tooltipStyle} />
        <Legend />
        {keys.map((key, i) => (
          <Bar key={key} dataKey={key} name={labels[i]} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function ChartEmpty() {
  return (
    <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
      No chart data for this period
    </div>
  );
}
