import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { userService } from '@/lib/services/user.service';
import { DoctorSidebar } from '@/components/doctor/sidebar';
import { DoctorSidebarProvider, DoctorContent } from '@/components/doctor/sidebar-provider';

export default async function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const user = await userService.findByClerkId(userId);
  if (!user) redirect('/onboarding');

  if (user.role === 'PATIENT') redirect('/dashboard');
  if (user.role === 'ADMIN') redirect('/admin');

  return (
    <DoctorSidebarProvider>
      <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
        <DoctorSidebar />
        <DoctorContent>
          {children}
        </DoctorContent>
      </div>
    </DoctorSidebarProvider>
  );
}
