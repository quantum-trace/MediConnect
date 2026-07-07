import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { userService } from '@/lib/services/user.service';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { SidebarProvider, DashboardContent } from '@/components/dashboard/sidebar-provider';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const user = await userService.findByClerkId(userId);
  if (!user) redirect('/onboarding');

  if (user.role === 'DOCTOR') redirect('/doctor');
  if (user.role === 'ADMIN') redirect('/admin');

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
        <DashboardSidebar />
        <DashboardContent>
          <DashboardHeader />
          <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">{children}</main>
        </DashboardContent>
      </div>
    </SidebarProvider>
  );
}
