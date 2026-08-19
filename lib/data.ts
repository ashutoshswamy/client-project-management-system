import { auth } from "@/lib/firebase";
import * as actions from "@/lib/actions";
import type { ClientInput, ProjectInput, InvoiceInput, UserProfile } from "@/lib/types";

async function idToken(): Promise<string> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Not authenticated");
  return token;
}

// Clients
export const getClients = async () => actions.getClients(await idToken());
export const addClient = async (data: ClientInput) => actions.addClient(await idToken(), data);
export const updateClient = async (id: string, data: Partial<ClientInput>) =>
  actions.updateClient(await idToken(), id, data);
export const deleteClient = async (id: string) => actions.deleteClient(await idToken(), id);

// Projects
export const getProjects = async () => actions.getProjects(await idToken());
export const addProject = async (data: ProjectInput) => actions.addProject(await idToken(), data);
export const updateProject = async (id: string, data: Partial<ProjectInput>) =>
  actions.updateProject(await idToken(), id, data);
export const deleteProject = async (id: string) => actions.deleteProject(await idToken(), id);

// Invoices
export const getInvoices = async () => actions.getInvoices(await idToken());
export const addInvoice = async (data: InvoiceInput) => actions.addInvoice(await idToken(), data);
export const updateInvoice = async (id: string, data: Partial<InvoiceInput>) =>
  actions.updateInvoice(await idToken(), id, data);
export const deleteInvoice = async (id: string) => actions.deleteInvoice(await idToken(), id);

// User profile
export const getUserProfile = async () => actions.getUserProfile(await idToken());
export const saveUserProfile = async (data: UserProfile) => actions.saveUserProfile(await idToken(), data);
