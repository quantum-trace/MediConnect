import { prisma } from "../lib/prisma";

async function main() {
  const options = [
    { key: "APPOINTMENT_REMINDERS", alias: "Appointment Reminders", description: "Get reminded before your appointments", defaultOn: true },
    { key: "STATUS_UPDATES", alias: "Status Updates", description: "When your appointment status changes", defaultOn: true },
    { key: "NEW_PRESCRIPTIONS", alias: "New Prescriptions", description: "When a new prescription is issued", defaultOn: true },
    { key: "HEALTH_TIPS", alias: "Health Tips", description: "Weekly health and wellness tips", defaultOn: true },
    { key: "SYSTEM_ALERTS", alias: "System Alerts", description: "Important platform updates and alerts", defaultOn: true },
  ];

  for (const opt of options) {
    await prisma.notificationOption.upsert({
      where: { key: opt.key },
      update: { alias: opt.alias, description: opt.description, defaultOn: opt.defaultOn },
      create: opt,
    });
  }

  console.log("Notification options seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
