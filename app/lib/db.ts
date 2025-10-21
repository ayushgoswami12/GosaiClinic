// This simulates a database - in production, use Supabase, Neon, or similar

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  age: number
  gender: string
  address: string
  medicalHistory: string
  allergies: string
  currentMedications: string
  emergencyContact: string
  emergencyPhone: string
  registeredBy: string
  registeredAt: string
  userId: string // Link patient to the user who registered them
}

interface User {
  id: string
  email: string
  name: string
  role: string
}

// In-memory storage (replace with actual database in production)
let patientsDB: Patient[] = []
const usersDB: User[] = []

export const db = {
  // Patient operations
  patients: {
    create: (patient: Omit<Patient, "id" | "registeredAt">) => {
      const newPatient: Patient = {
        ...patient,
        id: Date.now().toString(),
        registeredAt: new Date().toISOString(),
      }
      patientsDB.push(newPatient)
      return newPatient
    },

    getAll: () => patientsDB,

    getByUserId: (userId: string) => {
      return patientsDB.filter((p) => p.userId === userId)
    },

    getById: (id: string) => {
      return patientsDB.find((p) => p.id === id)
    },

    update: (id: string, updates: Partial<Patient>) => {
      const index = patientsDB.findIndex((p) => p.id === id)
      if (index !== -1) {
        patientsDB[index] = { ...patientsDB[index], ...updates }
        return patientsDB[index]
      }
      return null
    },

    delete: (id: string) => {
      patientsDB = patientsDB.filter((p) => p.id !== id)
    },
  },

  // User operations
  users: {
    create: (user: Omit<User, "id">) => {
      const newUser: User = {
        ...user,
        id: Date.now().toString(),
      }
      usersDB.push(newUser)
      return newUser
    },

    getByEmail: (email: string) => {
      return usersDB.find((u) => u.email === email)
    },

    getById: (id: string) => {
      return usersDB.find((u) => u.id === id)
    },
  },
}
