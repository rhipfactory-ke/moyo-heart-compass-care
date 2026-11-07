import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DIASTOLIC_TARGET, SYSTOLIC_TARGET } from "@/lib/bp";

export interface BpChartReading {
  measured_at: string | null;
  systolic: number;
  diastolic: number;
  pulse?: number | null;
}

export function BpChart({
  readings,
  height = 220,
}: {
  readings: BpChartReading[];
  height?: number;
}) {
  const data = [...readings]
    .sort((a, b) => (a.measured_at ?? "").localeCompare(b.measured_at ?? ""))
    .map((r, i) => {
      const d = r.measured_at ? new Date(r.measured_at) : new Date();
      return {
        date: isNaN(d.getTime())
          ? `Pt ${i + 1}`
          : d.toLocaleDateString(undefined, { day: "numeric", month: "short" }),
        systolic: r.systolic,
        diastolic: r.diastolic,
        pulse: r.pulse ?? undefined,
      };
    });

  if (data.length === 0) {
    return (
      <div className="grid place-items-center rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-muted-foreground">
        <div>
          <p className="font-semibold text-slate-600">No blood pressure readings logged yet</p>
          <p className="mt-1 text-xs text-slate-400">
            Use Snap BP Photo, Bluetooth, or Manual Entry below to log your first reading.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-[#7A0000]">
            <span className="h-2 w-2 rounded-full bg-[#7A0000]" />
            Systolic
          </span>
          <span className="flex items-center gap-1.5 font-medium text-[#2C3E50]">
            <span className="h-2 w-2 rounded-full bg-[#2C3E50]" />
            Diastolic
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-3 rounded-sm bg-emerald-100" />
            Target Range*
          </span>
        </div>
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#64748B" }}
              axisLine={{ stroke: "#E2E8F0" }}
              tickLine={false}
            />
            <YAxis
              domain={[60, 190]}
              tick={{ fontSize: 10, fill: "#64748B" }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceArea y1={70} y2={130} fill="#10B981" fillOpacity={0.07} />
            <ReferenceLine
              y={SYSTOLIC_TARGET}
              stroke="#B71C1C"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            <ReferenceLine
              y={DIASTOLIC_TARGET}
              stroke="#D97706"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                backgroundColor: "#FFFFFF",
                fontSize: "12px",
              }}
              formatter={(val: number, name: string) => [
                `${val} mmHg`,
                name === "systolic" ? "Systolic" : "Diastolic",
              ]}
            />
            <Line
              type="monotone"
              dataKey="systolic"
              stroke="#7A0000"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: "#7A0000", strokeWidth: 1.5, stroke: "#FFF" }}
              activeDot={{ r: 5, fill: "#B71C1C" }}
            />
            <Line
              type="monotone"
              dataKey="diastolic"
              stroke="#2C3E50"
              strokeWidth={2}
              dot={{ r: 3, fill: "#2C3E50", strokeWidth: 1.5, stroke: "#FFF" }}
              activeDot={{ r: 4.5, fill: "#2C3E50" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-[10px] text-muted-foreground">
        *Target threshold lines: {SYSTOLIC_TARGET}/{DIASTOLIC_TARGET} mmHg.
      </p>
    </div>
  );
}

export default BpChart;
