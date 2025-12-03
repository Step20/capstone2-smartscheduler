// src/mock/appointments.ts
import { type Appointment } from "./types";

export const mockAppointments: Appointment[] = [
  {
    id: "1",
    ownerId: "demo",
    customerName: "Jason Morgan",
    service: "Physiotherapy",
    start: "2025-03-26T08:00:00",
    end: "2025-03-26T10:00:00",
    notes: "Follow-up session",
  },
  {
    id: "2",
    ownerId: "demo",
    customerName: "Stacy Moore",
    service: "Vital Checks",
    start: "2025-03-26T11:00:00",
    end: "2025-03-26T12:00:00",
  },
  {
    id: "3",
    ownerId: "demo",
    customerName: "Ross Geller",
    service: "Insulin Shots",
    start: "2025-03-26T13:00:00",
  },
  {
    id: "4",
    ownerId: "demo",
    customerName: "Ellis Perry",
    service: "ECG Monitoring",
    start: "2025-03-26T15:00:00",
  },
  {
    id: "5",
    ownerId: "demo",
    customerName: "Jean Myers",
    service: "Check-up",
    start: "2025-03-27T09:00:00",
  },
];
