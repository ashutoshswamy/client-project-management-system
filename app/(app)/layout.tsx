import { AuthGuard } from "@/components/auth-guard";
import { AppNav } from "@/components/app-nav";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <AuthGuard>
      <AppNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 print:max-w-none print:p-0">
        {children}
      </main>
    </AuthGuard>
  );
}
