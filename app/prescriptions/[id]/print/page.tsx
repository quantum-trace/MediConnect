import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prescriptionService } from "@/lib/services/prescription.service";
import { userService } from "@/lib/services/user.service";
import { doctorService } from "@/lib/services/doctor.service";
import { formatLongDate } from "@/lib/date-utils";
import { PrintButton } from "@/components/prescriptions/print-button";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PrescriptionPrintPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) notFound();

  const { id } = await params;
  const prescription = await prescriptionService.findById(id);
  if (!prescription) notFound();

  // Access control — only owning patient or doctor
  const [user, doctor] = await Promise.all([
    userService.findByClerkId(userId),
    doctorService.findByClerkId(userId),
  ]);

  const isPatient = user && prescription.patientId === user.id;
  const isDoctor = doctor && prescription.doctorId === doctor.id;
  if (!isPatient && !isDoctor) notFound();

  const appointmentDate = formatLongDate(prescription.appointment.date);
  const issuedDate = formatLongDate(prescription.createdAt);
  const specialtyLabel = prescription.doctor.specialty
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-white text-gray-900 print:bg-white">
      {/* Print action bar — hidden when printing */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-8 py-3 print:hidden">
        <span className="text-sm text-gray-500">
          Prescription &mdash; {prescription.patient.name}
        </span>
        <PrintButton />
      </div>

      {/* A4-style prescription document */}
      <div className="mx-auto max-w-[740px] px-10 py-10 print:px-12 print:py-12">
        {/* Letterhead */}
        <div className="mb-8 border-b-2 border-gray-900 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                {prescription.doctor.name}
              </h1>
              <p className="mt-0.5 text-sm font-medium text-gray-600">{specialtyLabel}</p>
              <p className="text-sm text-gray-500">{prescription.doctor.hospital}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                MediConnect
              </p>
              <p className="mt-1 text-sm text-gray-500">Date: {issuedDate}</p>
              <p className="text-sm text-gray-500">Ref: #{prescription.id.slice(-8).toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Patient Info */}
        <div className="mb-8 grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Patient Name
            </p>
            <p className="mt-0.5 font-semibold text-gray-900">{prescription.patient.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Appointment Date
            </p>
            <p className="mt-0.5 font-semibold text-gray-900">
              {appointmentDate} &mdash; {prescription.appointment.timeSlot}
            </p>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Diagnosis
          </h2>
          <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-800">
            {prescription.diagnosis}
          </p>
        </div>

        {/* Rx Symbol + Medications */}
        {prescription.medications.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-3">
              <span className="font-serif text-3xl font-bold italic text-gray-700">℞</span>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Medications
              </h2>
            </div>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    #
                  </th>
                  <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Medicine
                  </th>
                  <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Dosage
                  </th>
                  <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Frequency
                  </th>
                  <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Duration
                  </th>
                  <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Instructions
                  </th>
                </tr>
              </thead>
              <tbody>
                {prescription.medications.map((med, idx) => (
                  <tr
                    key={med.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-2.5 pr-4 text-gray-400">{idx + 1}</td>
                    <td className="py-2.5 pr-4 font-medium text-gray-900">{med.name}</td>
                    <td className="py-2.5 pr-4 text-gray-700">{med.dosage}</td>
                    <td className="py-2.5 pr-4 text-gray-700">{med.frequency}</td>
                    <td className="py-2.5 pr-4 text-gray-700">{med.duration}</td>
                    <td className="py-2.5 text-gray-500 italic">{med.instructions ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Doctor Notes */}
        {prescription.notes && (
          <div className="mb-6">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Clinical Notes
            </h2>
            <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700">
              {prescription.notes}
            </p>
          </div>
        )}

        {/* Follow-up */}
        {(prescription.followUpDate || prescription.followUpNotes) && (
          <div className="mb-8">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Follow-up
            </h2>
            <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3">
              {prescription.followUpDate && (
                <p className="text-sm font-semibold text-gray-800">
                  {formatLongDate(prescription.followUpDate)}
                </p>
              )}
              {prescription.followUpNotes && (
                <p className="mt-1 text-sm text-gray-600">{prescription.followUpNotes}</p>
              )}
            </div>
          </div>
        )}

        {/* Signature */}
        <div className="mt-12 flex justify-end border-t border-gray-200 pt-6">
          <div className="text-right">
            <div className="mb-2 h-px w-48 bg-gray-400" />
            <p className="text-sm font-semibold text-gray-800">{prescription.doctor.name}</p>
            <p className="text-xs text-gray-500">{specialtyLabel}</p>
            <p className="text-xs text-gray-500">{prescription.doctor.hospital}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
          This prescription was issued digitally via MediConnect &bull; {issuedDate}
        </div>
      </div>
    </div>
  );
}
