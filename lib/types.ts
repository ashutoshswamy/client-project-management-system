export type ProjectStatus = "ongoing" | "completed";
export type InvoiceStatus = "unpaid" | "paid";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  notes: string;
  createdAt: number;
}

export type ClientInput = Omit<Client, "id" | "createdAt">;

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description: string;
  budget: number;
  status: ProjectStatus;
  startDate: string;
  dueDate: string;
  members: string[];
  createdAt: number;
}

export type ProjectInput = Omit<Project, "id" | "createdAt">;

export interface InvoiceItem {
  description: string;
  qty: number;
  rate: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  projectId: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  taxPercent: number;
  notes: string;
  status: InvoiceStatus;
  createdAt: number;
}

export type InvoiceInput = Omit<Invoice, "id" | "createdAt">;

export function invoiceTotal(invoice: Pick<Invoice, "items" | "taxPercent">) {
  const subtotal = invoice.items.reduce((sum, i) => sum + i.qty * i.rate, 0);
  const tax = subtotal * (invoice.taxPercent / 100);
  return { subtotal, tax, total: subtotal + tax };
}

export interface UserProfile {
  displayName: string;
  currency: string;
}
