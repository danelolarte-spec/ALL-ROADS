import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { AuthGuard } from '@/components/auth-guard';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 overflow-auto p-6 bg-gray-50">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
