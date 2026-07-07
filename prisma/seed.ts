import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  await prisma.doctor.createMany({
    data: [
      {
        name: "Dr. Amanda Foster",
        specialty: "CARDIOLOGY",
        experience: 15,
        consultationFee: 1500,
        hospital: "Apollo Hospital",
        imageUrl: "/avatars/doctor-4.jpg",
      },

      {
        name: "Dr. Lisa Park",
        specialty: "DERMATOLOGY",
        experience: 10,
        consultationFee: 1200,
        hospital: "SkinCare Clinic",
        imageUrl: "/avatars/doctor-6.jpg",
      },

      {
        name: "Dr. James Morrison",
        specialty: "NEUROLOGY",
        experience: 12,
        consultationFee: 1800,
        hospital: "Fortis Healthcare",
        imageUrl: "/avatars/doctor-5.jpg",
      },
    ],
  })

  console.log("Doctors seeded")
}

main()
  .catch((e) => {
    console.log(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })