import { BookingContent } from "@/components/booking/booking-content";

interface BookingPageProps {
  searchParams: Promise<{ doctorId?: string }>;
}

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const { doctorId } = await searchParams;
  return <BookingContent doctorId={doctorId ?? null} />;
}
