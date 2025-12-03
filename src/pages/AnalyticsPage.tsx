// ...existing code...
import React from "react";
import PageHeaderComponent from "../components/PageHeaderComponent";

/** small, lightweight SVG line chart for the big placeholder */
function LineChartSVG({
  width = 800,
  height = 220,
  data = [12, 28, 18, 35, 30, 45, 40, 55, 48, 60],
}: {
  width?: number;
  height?: number;
  data?: number[];
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pad = 12;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  const points = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * innerW;
      const y = pad + innerH - ((v - min) / (max - min || 1)) * innerH; // invert y
      return `${x},${y}`;
    })
    .join(" ");

  const areaPath = `M ${pad + 0},${pad + innerH} L ${points} L ${
    pad + innerW
  },${pad + innerH} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56">
      {/* background grid */}
      <defs>
        <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      <rect x={0} y={0} width={width} height={height} fill="transparent" />

      {/* area */}
      <path d={areaPath} fill="url(#g1)" stroke="none" />

      {/* line */}
      <polyline
        fill="none"
        stroke="#2563EB"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />

      {/* points */}
      {data.map((v, i) => {
        const x = pad + (i / (data.length - 1)) * innerW;
        const y = pad + innerH - ((v - min) / (max - min || 1)) * innerH;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={3.2}
            fill="#fff"
            stroke="#2563EB"
            strokeWidth={2}
          />
        );
      })}
    </svg>
  );
}

/** micro sparkline for small metrics */
function Sparkline({
  data = [4, 8, 6, 10, 9],
  color = "#10B981",
}: {
  data?: number[];
  color?: string;
}) {
  const w = 120;
  const h = 40;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pad = 4;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  const points = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * innerW;
      const y = pad + innerH - ((v - min) / (max - min || 1)) * innerH;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      className="inline-block align-middle"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function AnalyticsPage() {
  // simple mock metrics used in placeholders
  const stats = {
    appointments: 124,
    revenue: 4320,
    utilization: 78,
    newCustomers: 32,
    cancellation: 4.2,
  };

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col overflow-hidden">
      <PageHeaderComponent title="Analytics" />

      <div className="flex-1 overflow-hidden p-6">
        <div className="grid grid-cols-12 gap-6 h-full">
          {/* Big chart (top-left) */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-bold text-slate-900">Overview</div>
              <div className="text-sm text-slate-500">Last 30 days</div>
            </div>

            {/* completed chart placeholder -> replaced with inline SVG line chart */}
            <div className="flex-1 bg-slate-50 rounded-xl border border-slate-100 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-slate-700">
                  Appointments trend
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-3">
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-600" />
                    This period
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-slate-300" />
                    Previous
                  </span>
                </div>
              </div>

              <div className="flex-1">
                <LineChartSVG />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 border border-slate-100 text-center">
                  <div className="text-xs text-slate-500">Appointments</div>
                  <div className="text-lg font-bold text-slate-900">
                    {stats.appointments}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-100 text-center">
                  <div className="text-xs text-slate-500">Revenue</div>
                  <div className="text-lg font-bold text-slate-900">
                    ${stats.revenue.toLocaleString()}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-100 text-center">
                  <div className="text-xs text-slate-500">Avg. Utilization</div>
                  <div className="text-lg font-bold text-slate-900">
                    {stats.utilization}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column stats (top-right) */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="text-base font-bold text-slate-900 mb-3">STATS</div>

            <div className="space-y-4 flex-1">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase mb-1">
                      Total Appointments
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {stats.appointments}
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <Sparkline data={[6, 10, 8, 12, 9, 14]} color="#2563EB" />
                  </div>
                </div>

                <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: "67%" }}
                  />
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase mb-1">
                      New Customers
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {stats.newCustomers}
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <Sparkline data={[2, 4, 3, 5, 4]} color="#10B981" />
                  </div>
                </div>

                <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: "45%" }}
                  />
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase mb-1">
                      Cancellation Rate
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {stats.cancellation}%
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <Sparkline data={[1, 2, 1, 3, 2]} color="#F59E0B" />
                  </div>
                </div>

                <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: "12%" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom left (card) */}
          <div className="col-span-12 md:col-span-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="text-base font-bold text-slate-900 mb-3">
              Top Services
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    Physiotherapy
                  </div>
                  <div className="text-xs text-slate-500">24 bookings</div>
                </div>
                <div className="w-32">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "68%" }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    Consultation
                  </div>
                  <div className="text-xs text-slate-500">18 bookings</div>
                </div>
                <div className="w-32">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: "55%" }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    ECG Monitoring
                  </div>
                  <div className="text-xs text-slate-500">15 bookings</div>
                </div>
                <div className="w-32">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-400 h-2 rounded-full"
                      style={{ width: "45%" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom right (card) */}
          <div className="col-span-12 md:col-span-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="text-base font-bold text-slate-900 mb-3">
              User Behaviour
            </div>

            {/* small chart / metrics placeholder -> replaced with compact chart + metrics */}
            <div className="flex-1 bg-slate-50 rounded-xl border border-slate-100 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-slate-700">
                  Active users
                </div>
                <div className="text-xs text-slate-500">This week</div>
              </div>

              <div className="flex-1 flex items-center gap-4">
                <div className="flex-1">
                  <LineChartSVG
                    width={420}
                    height={140}
                    data={[5, 8, 6, 12, 11, 16, 14]}
                  />
                </div>

                <div className="w-44">
                  <div className="text-xs text-slate-500">Avg. Session</div>
                  <div className="text-lg font-bold text-slate-900">12m</div>

                  <div className="mt-3 text-xs text-slate-500">Return Rate</div>
                  <div className="text-lg font-bold text-slate-900">62%</div>

                  <div className="mt-3 text-xs text-slate-500">Conversion</div>
                  <div className="text-lg font-bold text-slate-900">18%</div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="text-center bg-slate-50 rounded-lg p-2 border border-slate-100">
                <div className="text-xs text-slate-500">Avg. Session</div>
                <div className="text-sm font-bold text-slate-900">12m</div>
              </div>
              <div className="text-center bg-slate-50 rounded-lg p-2 border border-slate-100">
                <div className="text-xs text-slate-500">Return Rate</div>
                <div className="text-sm font-bold text-slate-900">62%</div>
              </div>
              <div className="text-center bg-slate-50 rounded-lg p-2 border border-slate-100">
                <div className="text-xs text-slate-500">Conversion</div>
                <div className="text-sm font-bold text-slate-900">18%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// ...existing code...
