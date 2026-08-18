import { Badge } from "@/components/ui/badge";
import type { InvoiceStatus, ProjectStatus } from "@/lib/types";

const styles: Record<string, string> = {
  ongoing: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  unpaid: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  paid: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
};

export function StatusBadge({ status }: { status: ProjectStatus | InvoiceStatus }) {
  return (
    <Badge variant="secondary" className={styles[status]}>
      {status}
    </Badge>
  );
}
