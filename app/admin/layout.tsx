import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { userService } from '@/lib/services/user.service';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminSidebarProvider, AdminContent } from '@/components/admin/sidebar-provider';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const user = await userService.findByClerkId(userId);
  if (!user) redirect('/onboarding');

  if (user.role === 'DOCTOR') redirect('/doctor');
  if (user.role !== 'ADMIN') redirect('/dashboard');

  return (
    <AdminSidebarProvider>
      <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
        <AdminSidebar />
        <AdminContent>
          {children}
        </AdminContent>
      </div>
    </AdminSidebarProvider>
  );
}
