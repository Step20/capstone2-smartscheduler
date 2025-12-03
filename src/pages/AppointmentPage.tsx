import React, { useMemo, useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import useAuth from "../utils/useAuth";
import { getChatResponse } from "../gemini/gemini";

type Service = {
  id: string;
  name: string;
  durationMins: number;
  price?: string | number;
  description?: string;
  color?: string;
};

const mockServices: Service[] = [
  {
    id: "s1",
    name: "Physiotherapy",
    durationMins: 30,
    price: "$60",
    description: "Pain relief & mobility",
    color: "bg-blue-600",
  },
  {
    id: "s2",
    name: "Vital checks",
    durationMins: 20,
    price: "$30",
    description: "BP, pulse, temp",
    color: "bg-green-600",
  },
  {
    id: "s3",
    name: "Insulin Shots",
    durationMins: 10,
    price: "$15",
    description: "Medication administration",
    color: "bg-yellow-500",
  },
  {
    id: "s4",
    name: "ECG Monitoring",
    durationMins: 45,
    price: "$90",
    description: "Heart activity check",
    color: "bg-indigo-500",
  },
  {
    id: "s5",
    name: "Consultation",
    durationMins: 25,
    price: "$50",
    description: "New client consult",
    color: "bg-purple-600",
  },
];

export default function AppointmentPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const uid = useAuth();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs().startOf("day"));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [services, setServices] = useState<Service[]>(mockServices);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [enhancedDescription, setEnhancedDescription] = useState("");

  // Fetch services from Firestore
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
          // ensure price is formatted as string
          price: d.data().price
            ? typeof d.data().price === "number"
              ? `$${d.data().price}`
              : d.data().price
            : undefined,
        }));

        // combine with mock services (avoid duplicates)
        const combined = [
          ...firestoreServices,
          ...mockServices.filter(
            (ms) => !firestoreServices.some((fs) => fs.name === ms.name)
          ),
        ];

        setServices(combined);
      },
      (err) => {
        console.error("services snapshot error:", err);
        setServices(mockServices);
      }
    );

    return () => unsub();
  }, [uid]);

  // produce simple available times for a date (mock)
  const availableTimes = useMemo(() => {
    // for demo, produce times 8:00,9:00,...17:00 and random availability
    const times: string[] = [];
    for (let h = 8; h <= 17; h++) {
      const mm = Math.random() > 0.25 ? "00" : "30"; // some half-hour slots
      times.push(`${String(h).padStart(2, "0")}:${mm}`);
    }
    return times;
  }, [selectedDate]);

  function openScheduleForService(s: Service) {
    setSelectedService(s);
    setStep(2);
    setSelectedDate(dayjs().startOf("day"));
    setSelectedTime(null);
    setEnhancedDescription("");
  }

  async function generateEnhancedDescription() {
    if (!selectedService || !notes) return;

    setGeneratingDescription(true);
    try {
      const prompt = `You are a professional healthcare assistant. Enhance this appointment note by adding relevant clinical details and best practices. Keep it concise (1-2 sentences).

Service: ${selectedService.name}
Client note: ${notes}

Provide an enhanced, professional note:`;

      const enhanced = await getChatResponse(prompt);
      setEnhancedDescription(enhanced);
    } catch (err) {
      console.error("Failed to generate description:", err);
      setEnhancedDescription(notes);
    } finally {
      setGeneratingDescription(false);
    }
  }

  async function confirmAppointment() {
    if (!uid) {
      console.error("not authenticated");
      return;
    }
    if (!selectedService || !selectedTime || !clientName || !clientEmail)
      return;

    // build ISO start from selectedDate + selectedTime (HH:mm)
    const [hh, mm] = selectedTime.split(":").map((v) => Number(v));
    const startIso = selectedDate.hour(hh).minute(mm).second(0).toISOString();

    try {
      // use enhanced description if available, otherwise use notes
      const finalDescription = enhancedDescription || notes;

      await addDoc(collection(db, "appointments"), {
        ownerId: uid,
        customerName: clientName,
        customerEmail: clientEmail,
        service: selectedService.name,
        serviceId: selectedService.id,
        start: startIso,
        notes: finalDescription,
        description: finalDescription, // store the enhanced description
        status: "confirmed",
        createdAt: serverTimestamp(),
      });

      setConfirmed(true);
      setStep(3);
    } catch (err) {
      console.error("failed to save appointment", err);
    }
  }

  function resetAndBackToList() {
    setStep(1);
    setSelectedService(null);
    setSelectedTime(null);
    setClientName("");
    setClientEmail("");
    setNotes("");
    setConfirmed(false);
    setEnhancedDescription("");
  }

  // calendar helpers
  const startOfMonth = currentMonth.startOf("month");
  const firstDayOffset = startOfMonth.day(); // 0..6
  const daysInMonth = currentMonth.daysInMonth();
  const monthGrid = Array.from(
    { length: firstDayOffset + daysInMonth },
    (_, i) => {
      const dayIndex = i - firstDayOffset + 1;
      return dayIndex > 0 ? startOfMonth.date(dayIndex) : null;
    }
  );

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* <PageHeaderComponent title="Appointments" /> */}

      <div className="flex-1 overflow-hidden p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full p-6 flex flex-col">
          {/* header inside card: logo left, business name right */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-100">
                S
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  Schedulr Clinic
                </div>
                <div className="text-xs text-slate-500">
                  Appointments & bookings
                </div>
              </div>
            </div>

            <div className="text-sm text-slate-500">
              Create appointment — follow the steps
            </div>
          </div>

          {/* main content */}
          <div className="flex-1 overflow-hidden">
            {/* Step 1: Services list */}
            {step === 1 && (
              <div className="h-full overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((s) => (
                    <div
                      key={s.id}
                      className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm font-semibold text-slate-800">
                              {s.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {s.description}
                            </div>
                          </div>
                          <div className="text-sm font-bold text-slate-700">
                            {s.price}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                          <div className="inline-flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                s.color || "bg-slate-400"
                              }`}
                            />
                            <span>{s.durationMins} min</span>
                          </div>
                          <div>•</div>
                          <div>
                            {Math.floor(Math.random() * 20) + 1} bookings
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <button
                          onClick={() => openScheduleForService(s)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                        >
                          Add
                        </button>

                        <button
                          onClick={() => {
                            setSelectedService(s);
                            setStep(2);
                          }}
                          className="px-3 py-2 bg-white border border-slate-100 text-sm rounded-lg hover:shadow transition"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Schedule */}
            {step === 2 && selectedService && (
              <div className="h-full overflow-y-auto">
                <div className="grid grid-cols-12 gap-6 h-full">
                  {/* left: calendar + times */}
                  <div className="col-span-12 lg:col-span-5 bg-slate-50 rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-slate-700">
                        Select date
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setCurrentMonth((m) => m.subtract(1, "month"))
                          }
                          className="p-1 hover:bg-slate-100 rounded"
                        >
                          ‹
                        </button>
                        <div className="text-xs font-semibold text-slate-700">
                          {currentMonth.format("MMMM YYYY")}
                        </div>
                        <button
                          onClick={() =>
                            setCurrentMonth((m) => m.add(1, "month"))
                          }
                          className="p-1 hover:bg-slate-100 rounded"
                        >
                          ›
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-xs text-slate-500 mb-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (d) => (
                          <div key={d} className="text-center">
                            {d}
                          </div>
                        )
                      )}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {monthGrid.map((d, i) => {
                        const isToday = d ? d.isSame(dayjs(), "day") : false;
                        const isSelected = d
                          ? d.isSame(selectedDate, "day")
                          : false;
                        return (
                          <button
                            key={i}
                            onClick={() => d && setSelectedDate(d)}
                            disabled={!d}
                            className={`h-10 rounded-md text-xs ${
                              d
                                ? "hover:bg-white cursor-pointer"
                                : "bg-transparent"
                            } ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : isToday
                                ? "border border-slate-200 bg-white"
                                : ""
                            }`}
                          >
                            <div>{d ? d.date() : ""}</div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-medium text-slate-700 mb-2">
                        Available times
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availableTimes.map((t) => {
                          const full = Math.random() > 0.85; // random availability for demo
                          const isSel = selectedTime === t;
                          return (
                            <button
                              key={t}
                              onClick={() => !full && setSelectedTime(t)}
                              disabled={full}
                              className={`px-3 py-2 text-xs rounded-lg ${
                                full
                                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                  : isSel
                                  ? "bg-blue-600 text-white"
                                  : "bg-white border border-slate-100 hover:shadow"
                              }`}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* right: appointment details */}
                  <div className="col-span-12 lg:col-span-7 bg-slate-50 rounded-2xl border border-slate-100 p-4 flex flex-col">
                    <div className="mb-2 text-sm font-semibold text-slate-800">
                      Appointment details
                    </div>

                    <div className="bg-white rounded-lg border border-slate-100 p-4 mb-4">
                      <div className="text-xs text-slate-500">Service</div>
                      <div className="text-sm font-semibold text-slate-900">
                        {selectedService.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {selectedService.description}
                      </div>
                      <div className="mt-3 text-xs text-slate-500">
                        Duration • Price
                      </div>
                      <div className="font-medium text-slate-800">
                        {selectedService.durationMins} mins •{" "}
                        {selectedService.price}
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          Client name
                        </label>
                        <input
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm"
                          placeholder="Full name"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          Email
                        </label>
                        <input
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm"
                          placeholder="you@example.com"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs text-slate-500">
                            Notes
                          </label>
                          <button
                            onClick={generateEnhancedDescription}
                            disabled={!notes || generatingDescription}
                            className="text-xs text-blue-600 hover:text-blue-700 disabled:text-slate-400"
                          >
                            {generatingDescription
                              ? "Enhancing..."
                              : "✨ Enhance with AI"}
                          </button>
                        </div>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm"
                          rows={3}
                          placeholder="Optional notes for the provider"
                        />
                      </div>

                      {enhancedDescription && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                          <div className="text-xs font-semibold text-blue-900 mb-1">
                            AI-Enhanced Note:
                          </div>
                          <div className="text-xs text-blue-800">
                            {enhancedDescription}
                          </div>
                          <button
                            onClick={() => setEnhancedDescription("")}
                            className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-500">
                        {selectedDate && selectedTime ? (
                          <div>
                            {dayjs(selectedDate).format("MMM D, YYYY")} •{" "}
                            {selectedTime}
                          </div>
                        ) : (
                          <div>Select date & time</div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setStep(1);
                            setSelectedService(null);
                          }}
                          className="px-3 py-2 bg-white border border-slate-100 rounded-lg text-sm hover:shadow"
                        >
                          Back
                        </button>

                        <button
                          onClick={confirmAppointment}
                          disabled={
                            !selectedTime || !clientName || !clientEmail
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                            !selectedTime || !clientName || !clientEmail
                              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          Confirm appointment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && selectedService && (
              <div className="h-full flex items-center justify-center">
                <div className="w-full max-w-2xl bg-slate-50 rounded-2xl border border-slate-100 p-8">
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold text-slate-900">
                      Appointment confirmed
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      A confirmation has been created
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-slate-100 p-4 mb-4">
                    <div className="text-xs text-slate-500">Service</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {selectedService.name}
                    </div>

                    <div className="mt-3 text-xs text-slate-500">When</div>
                    <div className="font-medium text-slate-800">
                      {dayjs(selectedDate).format("MMM D, YYYY")} •{" "}
                      {selectedTime}
                    </div>

                    <div className="mt-3 text-xs text-slate-500">Client</div>
                    <div className="font-medium text-slate-800">
                      {clientName} • {clientEmail}
                    </div>

                    {(enhancedDescription || notes) && (
                      <>
                        <div className="mt-3 text-xs text-slate-500">Notes</div>
                        <div className="text-sm text-slate-700">
                          {enhancedDescription || notes}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={resetAndBackToList}
                      className="px-4 py-2 bg-white border border-slate-100 rounded-lg text-sm hover:shadow"
                    >
                      Book another
                    </button>
                    <button
                      onClick={() => setStep(1)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                    >
                      Done
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
