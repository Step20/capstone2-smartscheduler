export interface Appointment {
    id: string;
    ownerId: string;
    customerName: string;
    service: string;
    start: string; // ISO string
    end?: string; // ISO string
    notes?: string;
    createdAt?: string;
}