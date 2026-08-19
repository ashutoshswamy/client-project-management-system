"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getClients, deleteClient } from "@/lib/data";
import type { Client } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClientFormDialog } from "@/components/client-form-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);

  const refresh = () => getClients().then(setClients);

  useEffect(() => {
    refresh();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this client? This does not delete their projects/invoices.")) return;
    await deleteClient(id);
    await refresh();
    toast.success("Client deleted");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clients</h1>
          <p className="text-sm text-muted-foreground">Manage your client records.</p>
        </div>
        <ClientFormDialog trigger={<Button>Add client</Button>} onSaved={refresh} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <Link href={`/clients/${c.id}`} className="font-medium hover:underline">
                  {c.name}
                </Link>
              </TableCell>
              <TableCell>{c.company || "—"}</TableCell>
              <TableCell>{c.email || "—"}</TableCell>
              <TableCell>{c.phone || "—"}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      ⋯
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <ClientFormDialog
                      client={c}
                      trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>
                      }
                      onSaved={refresh}
                    />
                    <DropdownMenuItem variant="destructive" onSelect={() => handleDelete(c.id)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {clients.length === 0 && (
        <p className="text-sm text-muted-foreground">No clients yet. Add your first client above.</p>
      )}
    </div>
  );
}
