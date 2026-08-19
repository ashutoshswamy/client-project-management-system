"use server";

import { sql } from "@/lib/db";
import { verifyIdToken } from "@/lib/firebase-admin";
import type {
  Client,
  ClientInput,
  Project,
  ProjectInput,
  Invoice,
  InvoiceInput,
  UserProfile,
} from "@/lib/types";

// Clients

export async function getClients(idToken: string): Promise<Client[]> {
  await verifyIdToken(idToken);
  const rows = await sql`select * from clients order by created_at desc`;
  return rows.map(clientFromRow);
}

export async function addClient(idToken: string, data: ClientInput) {
  await verifyIdToken(idToken);
  await sql`
    insert into clients (name, email, phone, company, address, notes)
    values (${data.name}, ${data.email}, ${data.phone}, ${data.company}, ${data.address}, ${data.notes})
  `;
}

export async function updateClient(idToken: string, id: string, data: Partial<ClientInput>) {
  await verifyIdToken(idToken);
  const current = (await sql`select * from clients where id = ${id}`)[0];
  if (!current) throw new Error("Client not found");
  const merged = { ...clientFromRow(current), ...data };
  await sql`
    update clients set name = ${merged.name}, email = ${merged.email}, phone = ${merged.phone},
      company = ${merged.company}, address = ${merged.address}, notes = ${merged.notes}
    where id = ${id}
  `;
}

export async function deleteClient(idToken: string, id: string) {
  await verifyIdToken(idToken);
  await sql`delete from clients where id = ${id}`;
}

function clientFromRow(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: row.phone as string,
    company: row.company as string,
    address: row.address as string,
    notes: row.notes as string,
    createdAt: Number(row.created_at),
  };
}

// Projects

export async function getProjects(idToken: string): Promise<Project[]> {
  await verifyIdToken(idToken);
  const rows = await sql`select * from projects order by created_at desc`;
  return rows.map(projectFromRow);
}

export async function addProject(idToken: string, data: ProjectInput) {
  await verifyIdToken(idToken);
  await sql`
    insert into projects (client_id, name, description, budget, status, start_date, due_date, members, commissions)
    values (${data.clientId}, ${data.name}, ${data.description}, ${data.budget}, ${data.status},
      ${data.startDate}, ${data.dueDate}, ${data.members}, ${JSON.stringify(data.commissions)})
  `;
}

export async function updateProject(idToken: string, id: string, data: Partial<ProjectInput>) {
  await verifyIdToken(idToken);
  const current = (await sql`select * from projects where id = ${id}`)[0];
  if (!current) throw new Error("Project not found");
  const merged = { ...projectFromRow(current), ...data };
  await sql`
    update projects set client_id = ${merged.clientId}, name = ${merged.name}, description = ${merged.description},
      budget = ${merged.budget}, status = ${merged.status}, start_date = ${merged.startDate},
      due_date = ${merged.dueDate}, members = ${merged.members}, commissions = ${JSON.stringify(merged.commissions)}
    where id = ${id}
  `;
}

export async function deleteProject(idToken: string, id: string) {
  await verifyIdToken(idToken);
  await sql`delete from projects where id = ${id}`;
}

function projectFromRow(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    name: row.name as string,
    description: row.description as string,
    budget: Number(row.budget),
    status: row.status as Project["status"],
    startDate: row.start_date as string,
    dueDate: row.due_date as string,
    members: (row.members as string[]) ?? [],
    commissions: (row.commissions as Project["commissions"]) ?? [],
    createdAt: Number(row.created_at),
  };
}

// Invoices

export async function getInvoices(idToken: string): Promise<Invoice[]> {
  await verifyIdToken(idToken);
  const rows = await sql`select * from invoices order by created_at desc`;
  return rows.map(invoiceFromRow);
}

export async function addInvoice(idToken: string, data: InvoiceInput): Promise<{ id: string }> {
  await verifyIdToken(idToken);
  const rows = await sql`
    insert into invoices (invoice_number, client_id, project_id, issue_date, due_date, items, tax_percent, notes, status)
    values (${data.invoiceNumber}, ${data.clientId}, ${data.projectId}, ${data.issueDate}, ${data.dueDate},
      ${JSON.stringify(data.items)}, ${data.taxPercent}, ${data.notes}, ${data.status})
    returning id
  `;
  return { id: rows[0].id as string };
}

export async function updateInvoice(idToken: string, id: string, data: Partial<InvoiceInput>) {
  await verifyIdToken(idToken);
  const current = (await sql`select * from invoices where id = ${id}`)[0];
  if (!current) throw new Error("Invoice not found");
  const merged = { ...invoiceFromRow(current), ...data };
  await sql`
    update invoices set invoice_number = ${merged.invoiceNumber}, client_id = ${merged.clientId},
      project_id = ${merged.projectId}, issue_date = ${merged.issueDate}, due_date = ${merged.dueDate},
      items = ${JSON.stringify(merged.items)}, tax_percent = ${merged.taxPercent}, notes = ${merged.notes},
      status = ${merged.status}
    where id = ${id}
  `;
}

export async function deleteInvoice(idToken: string, id: string) {
  await verifyIdToken(idToken);
  await sql`delete from invoices where id = ${id}`;
}

function invoiceFromRow(row: Record<string, unknown>): Invoice {
  return {
    id: row.id as string,
    invoiceNumber: row.invoice_number as string,
    clientId: row.client_id as string,
    projectId: row.project_id as string,
    issueDate: row.issue_date as string,
    dueDate: row.due_date as string,
    items: row.items as Invoice["items"],
    taxPercent: Number(row.tax_percent),
    notes: row.notes as string,
    status: row.status as Invoice["status"],
    createdAt: Number(row.created_at),
  };
}

// User profile

export async function getUserProfile(idToken: string): Promise<UserProfile | null> {
  const uid = await verifyIdToken(idToken);
  const row = (await sql`select * from user_profiles where uid = ${uid}`)[0];
  if (!row) return null;
  return { displayName: row.display_name as string, currency: row.currency as string };
}

export async function saveUserProfile(idToken: string, data: UserProfile) {
  const uid = await verifyIdToken(idToken);
  await sql`
    insert into user_profiles (uid, display_name, currency)
    values (${uid}, ${data.displayName}, ${data.currency})
    on conflict (uid) do update set display_name = excluded.display_name, currency = excluded.currency
  `;
}
