import { AdminShell } from '@/components/shell';
import { AuthGate } from '@/components/auth-gate';
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <AdminShell>{children}</AdminShell>
    </AuthGate>
  );
}
