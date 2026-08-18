import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  Client,
  ClientInput,
  Project,
  ProjectInput,
  Invoice,
  InvoiceInput,
  UserProfile,
} from "@/lib/types";

function toMillis(value: unknown): number {
  return value instanceof Timestamp ? value.toMillis() : Date.now();
}

function subscribe<T extends { id: string; createdAt: number }>(
  name: string,
  onData: (rows: T[]) => void
) {
  const q = query(collection(db, name), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      return { ...data, id: d.id, createdAt: toMillis(data.createdAt) } as T;
    });
    onData(rows);
  });
}

// Clients
export const subscribeClients = (cb: (rows: Client[]) => void) =>
  subscribe<Client>("clients", cb);
export const addClient = (data: ClientInput) =>
  addDoc(collection(db, "clients"), { ...data, createdAt: serverTimestamp() });
export const updateClient = (id: string, data: Partial<ClientInput>) =>
  updateDoc(doc(db, "clients", id), data);
export const deleteClient = (id: string) => deleteDoc(doc(db, "clients", id));

// Projects
export const subscribeProjects = (cb: (rows: Project[]) => void) =>
  subscribe<Project>("projects", cb);
export const addProject = (data: ProjectInput) =>
  addDoc(collection(db, "projects"), { ...data, createdAt: serverTimestamp() });
export const updateProject = (id: string, data: Partial<ProjectInput>) =>
  updateDoc(doc(db, "projects", id), data);
export const deleteProject = (id: string) => deleteDoc(doc(db, "projects", id));

// Invoices
export const subscribeInvoices = (cb: (rows: Invoice[]) => void) =>
  subscribe<Invoice>("invoices", cb);
export const addInvoice = (data: InvoiceInput) =>
  addDoc(collection(db, "invoices"), { ...data, createdAt: serverTimestamp() });
export const updateInvoice = (id: string, data: Partial<InvoiceInput>) =>
  updateDoc(doc(db, "invoices", id), data);
export const deleteInvoice = (id: string) => deleteDoc(doc(db, "invoices", id));

// User profile
export const subscribeUserProfile = (uid: string, cb: (profile: UserProfile | null) => void) =>
  onSnapshot(doc(db, "users", uid), (snap) => cb((snap.data() as UserProfile) ?? null));
export const saveUserProfile = (uid: string, data: UserProfile) =>
  setDoc(doc(db, "users", uid), data, { merge: true });
