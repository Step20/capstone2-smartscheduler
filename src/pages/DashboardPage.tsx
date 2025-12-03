import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import PageHeaderComponent from "../components/PageHeaderComponent";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  orderBy,
  updateDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import useAuth from "../utils/useAuth";
import { mockAppointments } from "../constants/mockApointment";

export default function DashboardPage() {
  const navigate = useNavigate();
  const uid = useAuth();

  // add currentMonth state for calendar navigation
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  // appointments from Firestore for current user
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (!uid) {
      setAppointments([]);
      return;
    }

    const q = query(
      collection(db, "appointments"),
      where("ownerId", "==", uid),
      orderBy("start", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAppointments([...appointments, ...data, ...mockAppointments]);
    });
    return () => unsub();
  }, [uid]);

  // helper to add appointment to Firestore
  async function addAppointment(appt: {
    customerName: string;
    service: string;
    start: string | Date;
    notes?: string;
  }) {
    if (!uid) throw new Error("no user");
    await addDoc(collection(db, "appointments"), {
      ...appt,
      ownerId: uid,
      createdAt: serverTimestamp(),
      start:
        typeof appt.start === "string"
          ? appt.start
          : (appt.start as Date).toISOString(),
    });
  }

  const sorted = [...appointments, ...mockAppointments].sort(
    (a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf()
  );
  const upcoming = sorted.filter((a) => dayjs(a.start).isAfter(dayjs()));

  const stats = [
    { label: "Total Appointments", value: "124" },
    { label: "Completed", value: "98" },
    { label: "Pending", value: "26" },
  ];

  // build month grid for calendar display
  const startOfMonth = currentMonth.startOf("month");
  const firstDayOffset = startOfMonth.day(); // 0..6 (Sun..Sat)
  const daysInMonth = currentMonth.daysInMonth();
  const totalCells = Math.ceil((firstDayOffset + daysInMonth) / 7) * 7; // full week rows
  const monthGrid = Array.from({ length: totalCells }, (_, i) => {
    const dayIndex = i - firstDayOffset + 1;
    if (dayIndex > 0 && dayIndex <= daysInMonth) {
      return startOfMonth.date(dayIndex);
    }
    return null;
  });

  // helper to check if a given day has any appointment
  function dayHasAppointment(d: dayjs.Dayjs | null) {
    if (!d) return false;
    return appointments.some((a) => dayjs(a.start).isSame(d, "day"));
  }

  // build upcoming list from Firestore appointments when available, fallback to mockUpcoming
  const mockUpcoming = [
    {
      id: "u1",
      customerName: "Sarah Connor",
      service: "Full Body Massage",
      start: dayjs().add(1, "day").hour(9).minute(30).toISOString(),
    },
    {
      id: "u2",
      customerName: "John Doe",
      service: "Haircut - Classic",
      start: dayjs().add(1, "day").hour(11).minute(0).toISOString(),
    },
    {
      id: "u3",
      customerName: "Maria Lopez",
      service: "Dental Check-up",
      start: dayjs().add(2, "day").hour(14).minute(15).toISOString(),
    },
    {
      id: "u4",
      customerName: "David Kim",
      service: "Therapy Session",
      start: dayjs().add(3, "day").hour(10).minute(0).toISOString(),
    },
    {
      id: "u5",
      customerName: "Aisha Khan",
      service: "Consultation - New Client",
      start: dayjs().add(4, "day").hour(16).minute(30).toISOString(),
    },
  ];

  // prefer Firestore appointments (appointments state), fallback to mockUpcoming
  // const nextThree = (appointments.length ? appointments : mockUpcoming)
  //   .filter((a) => dayjs(a.start).isAfter(dayjs()))
  //   .slice(0, 3);

  const nextThree = appointments.slice(0, 3);
  const UpcomingAppointmentItem = ({ a }) => (
    <div className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer border-b border-slate-100 last:border-b-0">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs flex-shrink-0">
        {a.customerName[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-800 text-xs">
          {a.customerName}
        </div>
        <div className="text-xs text-slate-500">{a.service}</div>
      </div>
      <div className="text-xs text-slate-400 flex-shrink-0">
        {dayjs(a.start).format("h:mm A")}
      </div>
    </div>
  );

  const mockServices = [
    { id: "s1", name: "Physiotherapy", count: 24, percent: 68, active: true },
    { id: "s2", name: "Vital checks", count: 12, percent: 34, active: true },
    { id: "s3", name: "Insulin Shots", count: 9, percent: 20, active: false },
    { id: "s4", name: "ECG Monitoring", count: 15, percent: 45, active: true },
    { id: "s5", name: "Consultation", count: 18, percent: 55, active: true },
  ];

  const [services, setServices] = useState<any[]>(mockServices);

  // listen for services in Firestore for this user (real-time)
  useEffect(() => {
    if (!uid) {
      setServices(mockServices);
      return;
    }

    const q = query(collection(db, "services"), where("ownerId", "==", uid));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const firestoreServices = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));

        // replace state entirely (not append) with Firestore data + mock
        setServices((prev) =>
          [...prev, ...firestoreServices].filter(
            (svc, index, arr) => index === arr.findIndex((s) => s.id === svc.id)
          )
        );
      },
      (err) => {
        console.error("services snapshot error:", err);
        setServices(mockServices);
      }
    );

    return () => unsub();
  }, [uid]);

  // New service modal state (existing)
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState<number | "">("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceActive, setNewServiceActive] = useState(true);

  // Edit service modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editService, setEditService] = useState<any | null>(null);

  function addNewService() {
    if (!newServiceName.trim()) return;

    const payload = {
      name: newServiceName.trim(),
      count: 0,
      percent: 0,
      active: newServiceActive,
      description: newServiceDesc,
      durationMins:
        typeof newServiceDuration === "number" ? newServiceDuration : 0,
      price: newServicePrice || null,
      ownerId: uid || null,
      createdAt: serverTimestamp(),
    };

    (async () => {
      try {
        if (uid) {
          // Firestore handles state updates via onSnapshot — DO NOT manually update state
          await addDoc(collection(db, "services"), payload);
        } else {
          // For local-only mode, manually add
          const id = `s${Date.now()}`;
          setServices((prev) => [{ id, ...payload }, ...prev]);
        }
      } catch (err) {
        console.error("Failed to add service:", err);
      } finally {
        setNewServiceName("");
        setNewServiceDesc("");
        setNewServiceDuration("");
        setNewServicePrice("");
        setNewServiceActive(true);
        setShowServiceModal(false);
      }
    })();
  }

  function openEditModal(s: any) {
    setEditService({
      ...s,
      durationMins: (s as any).durationMins ?? 0,
      price: (s as any).price ?? "",
      description: (s as any).description ?? "",
    });
    setShowEditModal(true);
  }

  function saveEditedService() {
    if (!editService || !editService.name?.trim()) return;

    (async () => {
      try {
        // if this service exists in Firestore (id doesn't start with local 's'), update it
        if (uid && editService.id && !String(editService.id).startsWith("s")) {
          const ref = doc(db, "services", editService.id);
          const payload = {
            name: editService.name,
            description: editService.description || "",
            durationMins: Number(editService.durationMins || 0),
            price: editService.price || null,
            active: !!editService.active,
            updatedAt: serverTimestamp(),
          };
          await updateDoc(ref, payload);
          // services state will be updated via onSnapshot listener
        } else {
          // local update for mock/local items
          setServices((prev) =>
            prev.map((ps) =>
              ps.id === editService.id ? { ...ps, ...editService } : ps
            )
          );
        }
      } catch (err) {
        console.error("Failed to save edited service:", err);
      } finally {
        setShowEditModal(false);
        setEditService(null);
      }
    })();
  }

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col overflow-hidden">
      <PageHeaderComponent title="Dashboard" />

      {/* Content Grid */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="grid grid-cols-12 grid-rows-2 gap-6 h-full">
          {/* Top Row: Calendar */}
          <div className="col-span-8 row-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-2 border-b border-slate-200 pb-2">
              <div className="text-base font-bold text-slate-900 ">
                CALENDAR
              </div>

              {/* Month and Year Header */}
              <div className="flex items-center justify-between ">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentMonth((m) => m.subtract(1, "month"))
                    }
                    className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    ‹
                  </button>

                  <div className="text-sm font-semibold text-slate-700">
                    {currentMonth.format("MMMM YYYY")}
                  </div>

                  <button
                    onClick={() => setCurrentMonth((m) => m.add(1, "month"))}
                    className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-auto bg-slate-50 p-4 rounded-xl scrollbar-hide">
              <div className="grid grid-cols-7 gap-2 mb-3">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-semibold text-slate-600 py-1"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              <div className="grid grid-cols-7 gap-2 h-full">
                {monthGrid.map((d, i) => {
                  const isValidDay = !!d;
                  const isToday = d ? d.isSame(dayjs(), "day") : false;
                  const hasAppointment = dayHasAppointment(d);
                  return (
                    <div
                      key={`month-${currentMonth.format("YYYY-MM")}-${i}`}
                      onClick={() => isValidDay && navigate(`/${uid}/schedule`)}
                      className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                        isValidDay
                          ? `${
                              isToday
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-slate-900 hover:bg-blue-50 cursor-pointer border border-slate-100"
                            }`
                          : "bg-slate-50 text-slate-400"
                      }`}
                    >
                      <div>{isValidDay ? d!.date() : ""}</div>
                      {hasAppointment && isValidDay && (
                        <span
                          className={`w-1 h-1 rounded-full ${
                            isToday ? "bg-white" : "bg-blue-600"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Row: Stats (now includes progress block) */}
          <div className="col-span-4 row-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="text-base font-bold text-slate-900 mb-2 tracking-wide">
              STATS
            </div>

            {/* small stat tiles with inline progress bars */}
            <div className="grid grid-cols-1 gap-4 overflow-y-auto flex-1">
              {stats.map((stat, idx) => {
                const progressItems = [
                  { percent: 67, color: "bg-blue-600", note: "Today" },
                  { percent: 85, color: "bg-green-600", note: "Weekly" },
                  { percent: 78, color: "bg-yellow-500", note: "Utilization" },
                ];
                const p = progressItems[idx] ?? {
                  percent: 50,
                  color: "bg-blue-600",
                  note: "",
                };

                return (
                  <div
                    key={idx}
                    className="bg-slate-50 rounded-xl p-3 border border-slate-100 hover:shadow transition-all flex flex-col"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          {stat.label}
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-slate-900 leading-none">
                          {stat.value}
                        </div>
                      </div>

                      <div className="ml-2 text-slate-400 text-sm">
                        {/* reserved for icon or spark */}
                      </div>
                    </div>

                    {/* progress bar under each stat */}
                    <div className="mt-1.5">
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`${p.color} h-2 rounded-full transition-all`}
                          style={{ width: `${p.percent}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                        <div>{p.note}</div>
                        <div className="font-semibold text-slate-700">
                          {p.percent}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Row: Upcoming */}
          <div className="col-span-6 row-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="text-base font-bold text-slate-900 mb-4 tracking-wide">
              UPCOMING
            </div>

            <div className="flex-1 overflow-y-auto">
              {nextThree.length === 0 ? (
                <div className="text-xs text-slate-400 p-4 text-center h-full flex items-center justify-center">
                  No upcoming appointments.
                </div>
              ) : (
                <div className="space-y-2">
                  {nextThree.map((a) => (
                    <div
                      onClick={() => navigate(`/${uid}/schedule`)}
                      key={a.id}
                      className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 hover:bg-slate-100 transition cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                          {a.customerName[0]}
                        </div>

                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-slate-800">
                            {a.customerName}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {a.service}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-slate-600">
                        {dayjs(a.start).format("h:mm A")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-center mt-4 pt-4 border-t border-slate-200">
              <button
                onClick={() => navigate(`/${uid}/schedule`)}
                className="text-xs cursor-pointer font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                View All Upcoming →
              </button>
            </div>
          </div>

          {/* Bottom Row: Management -> SERVICES MANAGEMENT */}
          <div className="col-span-6 row-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="flex justify-between items-start">
              <div className="text-sm font-bold text-slate-900 mb-4 tracking-wide">
                SERVICES MANAGEMENT
              </div>
              <button
                onClick={() => setShowServiceModal(true)}
                className="items-start px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition"
              >
                + New Service
              </button>
            </div>
            <div className="text-xs text-slate-500 mb-3">
              Manage available service types shown when creating an appointment.
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-100"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-700 font-semibold text-sm border border-slate-100">
                      {s.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">
                        {s.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {s.count} bookings
                      </div>

                      <div className="mt-2 w-44">
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className={`${
                              s.percent > 70 ? "bg-blue-600" : "bg-blue-400"
                            } h-2 rounded-full`}
                            style={{ width: `${s.percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                        s.active
                          ? "bg-blue-50 text-blue-600"
                          : "bg-slate-50 text-slate-700"
                      }`}
                      aria-pressed={s.active}
                    >
                      {s.active ? "Active" : "Inactive"}
                    </button>
                    <button
                      onClick={() => openEditModal(s)}
                      className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-sm text-slate-700 hover:shadow transition"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {showServiceModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-semibold text-slate-900">
                      New Service
                    </div>
                    <button
                      onClick={() => setShowServiceModal(false)}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        Service title
                      </label>
                      <input
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm"
                        placeholder="e.g. Deep Tissue Massage"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        Description
                      </label>
                      <input
                        value={newServiceDesc}
                        onChange={(e) => setNewServiceDesc(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm"
                        placeholder="Short service description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          Duration (mins)
                        </label>
                        <input
                          type="number"
                          value={newServiceDuration as any}
                          onChange={(e) =>
                            setNewServiceDuration(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm"
                          placeholder="30"
                          min={1}
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          Price
                        </label>
                        <input
                          value={newServicePrice}
                          onChange={(e) => setNewServicePrice(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm"
                          placeholder="$50"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={newServiceActive}
                        onChange={() => setNewServiceActive((s) => !s)}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      Active
                    </label>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-3">
                    <button
                      onClick={() => setShowServiceModal(false)}
                      className="px-4 py-2 bg-white border border-slate-100 rounded-lg text-sm hover:shadow"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addNewService}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                    >
                      Save service
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showEditModal && editService && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-semibold text-slate-900">
                      Edit Service
                    </div>
                    <button
                      onClick={() => {
                        setShowEditModal(false);
                        setEditService(null);
                      }}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        Service title
                      </label>
                      <input
                        value={editService.name}
                        onChange={(e) =>
                          setEditService((prev: any) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        Description
                      </label>
                      <input
                        value={editService.description}
                        onChange={(e) =>
                          setEditService((prev: any) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          Duration (mins)
                        </label>
                        <input
                          type="number"
                          value={editService.durationMins}
                          onChange={(e) =>
                            setEditService((prev: any) => ({
                              ...prev,
                              durationMins: Number(e.target.value || 0),
                            }))
                          }
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm"
                          min={1}
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          Price
                        </label>
                        <input
                          value={editService.price}
                          onChange={(e) =>
                            setEditService((prev: any) => ({
                              ...prev,
                              price: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!editService.active}
                        onChange={() =>
                          setEditService((prev: any) => ({
                            ...prev,
                            active: !prev.active,
                          }))
                        }
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      Active
                    </label>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-3">
                    <button
                      onClick={() => {
                        setShowEditModal(false);
                        setEditService(null);
                      }}
                      className="px-4 py-2 bg-white border border-slate-100 rounded-lg text-sm hover:shadow"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEditedService}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                    >
                      Save changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
