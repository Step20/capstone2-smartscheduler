import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import PageHeaderComponent from "../components/PageHeaderComponent";

type Person = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  lastAppointment?: string;
  appointmentsCount?: number;
  favoriteService?: string;
};

const mockPeople: Person[] = [
  {
    id: "p1",
    name: "Jean Myers",
    email: "jean.myers@example.com",
    avatar: "",
    lastAppointment: dayjs().subtract(2, "day").toISOString(),
    appointmentsCount: 5,
    favoriteService: "Physiotherapy",
  },
  {
    id: "p2",
    name: "Ellis Perry",
    email: "ellis.perry@example.com",
    avatar: "",
    lastAppointment: dayjs().subtract(5, "day").toISOString(),
    appointmentsCount: 3,
    favoriteService: "ECG Monitoring",
  },
  {
    id: "p3",
    name: "Ross Geller",
    email: "ross.geller@example.com",
    avatar: "",
    lastAppointment: dayjs().subtract(8, "day").toISOString(),
    appointmentsCount: 8,
    favoriteService: "Insulin Shots",
  },
  {
    id: "p4",
    name: "Stacy Moore",
    email: "stacy.moore@example.com",
    avatar: "",
    lastAppointment: dayjs().subtract(10, "day").toISOString(),
    appointmentsCount: 2,
    favoriteService: "Vital checks",
  },
  {
    id: "p5",
    name: "Jason Morgan",
    email: "jason.morgan@example.com",
    avatar: "",
    lastAppointment: dayjs().subtract(14, "day").toISOString(),
    appointmentsCount: 4,
    favoriteService: "Physiotherapy",
  },
];

export default function PeoplePage() {
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<"all" | "service" | "range">("all");

  const segments = [
    { id: "all", label: "All people" },
    { id: "service", label: "Same service" },
    { id: "range", label: "Within date range" },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mockPeople.filter((p) => {
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.favoriteService && p.favoriteService.toLowerCase().includes(q))
      );
    });
  }, [query]);

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col overflow-hidden">
      <PageHeaderComponent title="People" />

      <div className="flex-1 overflow-hidden p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full p-6 flex flex-col">
          {/* top controls */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="text-2xl font-bold text-slate-900">
                All people's view
              </div>
              <div className="text-sm text-slate-500 mt-1">
                {filtered.length} people
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center bg-slate-50 rounded-md border border-slate-100 px-3 py-1 text-sm">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search people or service..."
                  className="bg-transparent outline-none px-2 text-sm w-44"
                />
              </div>

              <button className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow hover:bg-blue-700 transition">
                + Add New
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col gap-6">
            {/* main grid: left segments & right list */}
            <div className="flex-1 grid grid-cols-12 gap-6 h-full">
              {/* segments column */}
              <aside className="col-span-12 lg:col-span-3 bg-slate-50 rounded-2xl border border-slate-100 p-4">
                <div className="text-sm font-semibold text-slate-700 mb-3">
                  Segments
                </div>

                <div className="space-y-2">
                  {segments.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSegment(s.id as any)}
                      className={`cursor-pointer w-full text-left px-3 py-2 rounded-lg transition ${
                        segment === s.id
                          ? "bg-white font-semibold text-blue-600 shadow-sm border border-slate-100"
                          : "hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <div className="mt-6 text-xs text-slate-500">
                  Filter examples:
                  <ul className="list-disc ml-4 mt-2 text-slate-500">
                    <li>All people</li>
                    <li>People who booked same service</li>
                    <li>Appointments within date range</li>
                  </ul>
                </div>
              </aside>

              {/* people list */}
              <div className="col-span-12 lg:col-span-9 bg-slate-50 rounded-2xl border border-slate-100 p-4 overflow-hidden">
                <div className="h-full overflow-y-auto pr-2 space-y-4">
                  {filtered.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500">
                      No people found.
                    </div>
                  ) : (
                    filtered.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-100 hover:shadow transition"
                      >
                        <div className="flex items-center space-x-4 min-w-0">
                          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-sm flex-shrink-0">
                            {p.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </div>

                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-800 truncate">
                              {p.name}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {p.email || "—"}
                            </div>

                            <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                              <div>
                                <span className="font-medium text-slate-700 mr-1">
                                  Last:
                                </span>
                                {p.lastAppointment
                                  ? dayjs(p.lastAppointment).format(
                                      "MMM D, YYYY"
                                    )
                                  : "—"}
                              </div>
                              <div>
                                <span className="font-medium text-slate-700 mr-1">
                                  Visits:
                                </span>
                                {p.appointmentsCount ?? 0}
                              </div>
                              <div className="truncate">
                                <span className="font-medium text-slate-700 mr-1">
                                  Service:
                                </span>
                                <span className="text-slate-500">
                                  {p.favoriteService ?? "—"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition">
                            View
                          </button>
                          <button className="px-3 py-2 bg-slate-50 text-slate-700 rounded-lg text-sm hover:bg-slate-100 transition">
                            Edit
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
