import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { mockAppointments } from "../constants/mockApointment";
import PageHeaderComponent from "../components/PageHeaderComponent";
import useAuth from "../utils/useAuth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

dayjs.extend(relativeTime);

function AppointmentRow({ appointment }) {
  const { customerName, service, start, description, notes } = appointment;
  const startTime = dayjs(start).format("h:mm A");
  const endTime = dayjs(start).add(30, "minute").format("h:mm A");
  const [showNote, setShowNote] = useState(false);

  return (
    <div className="relative flex items-center py-4">
      {/* Time column */}
      <div className="w-28 text-right pr-6 flex flex-col items-end">
        <div className="text-sm font-semibold text-slate-800">{startTime}</div>
        <div className="text-xs text-slate-400">{endTime}</div>
      </div>

      {/* Timeline dot (aligned with outer timeline line) */}
      <div className="absolute left-38 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-3 h-3 bg-white rounded-full border-4 border-blue-600 shadow" />
      </div>

      {/* Appointment card */}
      <div className="flex-1 ml-20 bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-between min-h-[72px]">
        <div className="min-w-0">
          <div className="text-[11px] text-slate-500">Patient</div>
          <div className="font-semibold text-slate-800">{customerName}</div>
          <div className="text-[11px] text-slate-400 mt-1">Service</div>
          <div className="text-sm font-medium text-slate-700">{service}</div>
        </div>
        {!showNote ? (
          <div className="min-w-0 ml-10 mb-auto items-start">
            {/* customer description */}
            <div className="text-[11px] text-slate-500">Description</div>
            <div className="text-[10px] text-slate-500/50 line-clamp-3">
              {description}
            </div>
          </div>
        ) : (
          <div className="min-w-0 ml-10 mb-auto items-start">
            {/* customer description */}
            <div className="text-[11px] text-slate-500">Note</div>
            <div className="text-[10px] text-slate-500/50 line-clamp-3">
              {notes}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowNote(!showNote)}
          className="ml-6 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Note
        </button>
      </div>
    </div>
  );
}

export default function SchedulePage() {
  const navigate = useNavigate();
  const uid = useAuth();
  const [activeTab, setActiveTab] = useState<"Upcoming" | "Past">("Upcoming");
  const [firestoreAppointments, setFirestoreAppointments] = useState<any[]>([]);

  // Fetch appointments from Firestore
  useEffect(() => {
    if (!uid) {
      setFirestoreAppointments([]);
      return;
    }

    const q = query(
      collection(db, "appointments"),
      where("ownerId", "==", uid)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setFirestoreAppointments(data);
      },
      (err) => {
        console.error("appointments snapshot error:", err);
      }
    );

    return () => unsub();
  }, [uid]);

  // Combine Firestore appointments with mock appointments
  const sorted = [...firestoreAppointments, ...mockAppointments].sort(
    (a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf()
  );

  const now = dayjs();
  const upcomingAppointments = sorted.filter((a) =>
    dayjs(a.start).isAfter(now)
  );
  const pastAppointments = sorted
    .filter((a) => dayjs(a.start).isBefore(now))
    .reverse();

  const appointmentsToShow =
    activeTab === "Upcoming" ? upcomingAppointments : pastAppointments;

  // group by day
  const groupedAppointments = appointmentsToShow.reduce((acc, appt) => {
    const key = dayjs(appt.start).format("MMM D 'YY");
    if (!acc[key]) acc[key] = [];
    acc[key].push(appt);
    return acc;
  }, {} as Record<string, any[]>);

  const appointmentCount = appointmentsToShow.length;

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col overflow-hidden">
      <PageHeaderComponent title="Schedule" />

      <div className="flex-1 overflow-hidden p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full p-6 flex flex-col">
          {/* Header row inside card */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="text-2xl font-bold text-slate-900">
                All schedule's view
              </div>
              <div className="text-sm text-slate-500 mt-1">
                {appointmentCount} appointments
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-50 font-medium rounded-md border border-slate-100 px-3 py-1">
                <button
                  className={`px-3 py-2 rounded-md text-sm cursor-pointer ${
                    activeTab === "Upcoming"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-600"
                  }`}
                  onClick={() => setActiveTab("Upcoming")}
                >
                  Upcoming Appointments{" "}
                  {upcomingAppointments.length > 0
                    ? `(${upcomingAppointments.length})`
                    : ""}
                </button>
                <button
                  className={`ml-2 px-3 py-2 rounded-md text-sm cursor-pointer ${
                    activeTab === "Past"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-600"
                  }`}
                  onClick={() => setActiveTab("Past")}
                >
                  Past Appointments{" "}
                  {pastAppointments.length > 0
                    ? `(${pastAppointments.length})`
                    : ""}
                </button>
              </div>

              <button
                onClick={() => navigate(`/${uid}/appointment`)}
                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow hover:bg-blue-700 transition"
              >
                + Add New
              </button>
            </div>
          </div>

          {/* Content: timeline area */}
          <div className="flex-1 overflow-hidden">
            <div className="relative h-full rounded-xl border border-slate-100 p-6 bg-slate-50">
              {/* vertical timeline line */}
              <div className="absolute left-44 top-6 bottom-6 w-0.5 bg-slate-200"></div>

              <div className="h-full overflow-y-auto pr-4 space-y-6">
                {Object.keys(groupedAppointments).length === 0 ? (
                  <div className="text-center py-14 text-slate-500">
                    No {activeTab.toLowerCase()} appointments.
                  </div>
                ) : (
                  Object.entries(groupedAppointments).map(([date, list]) => (
                    <div key={date}>
                      <div className="mb-4">
                        <span className="inline-block bg-white px-3 py-1 rounded-full text-xs font-semibold border border-slate-100 shadow-sm">
                          {date}
                          {date === dayjs().format("MMM D 'YY") && (
                            <span className="ml-2 text-blue-600">(Today)</span>
                          )}
                        </span>
                      </div>

                      <div className="space-y-4">
                        {list.map((a) => (
                          <AppointmentRow key={a.id} appointment={a} />
                        ))}
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
  );
}
