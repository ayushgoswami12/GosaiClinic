// Server-side JSONBin helper
const BIN_ID = "6901972eae596e708f34bee9"
const API_BASE = "https://api.jsonbin.io/v3/b"

function getMasterKey(): string {
  return (
    process.env.JSONBIN_MASTER_KEY ||
    "$2a$10$mE5/U7tLVTXmEb6ZPIi11.se02ohDUJQEdRbAx8Ih.UciT.Bswbzy"
  )
}

type SharedData = {
  patients: any[]
  prescriptions: any[]
  updatedAt?: string
}

export async function fetchSharedData(): Promise<SharedData> {
  const url = `${API_BASE}/${BIN_ID}/latest`
  const res = await fetch(url, {
    headers: {
      "X-Master-Key": getMasterKey(),
    },
    cache: "no-store",
  })

  if (!res.ok) {
    // If bin not found or empty, return empty object gracefully
    return { patients: [], prescriptions: [] }
  }

  const json = await res.json().catch(() => ({ record: [] }))
  const record = json?.record

  // Backward compatibility: if record is an array, treat it as patients-only
  if (Array.isArray(record)) return { patients: record, prescriptions: [] }
  return {
    patients: Array.isArray(record?.patients) ? record.patients : [],
    prescriptions: Array.isArray(record?.prescriptions) ? record.prescriptions : [],
    updatedAt: record?.updatedAt,
  }
}

export async function saveSharedData(data: SharedData): Promise<void> {
  const url = `${API_BASE}/${BIN_ID}`
  const body = JSON.stringify({ ...data, updatedAt: new Date().toISOString() })

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": getMasterKey(),
    },
    body,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`JSONBin save failed: ${res.status} ${text}`)
  }
}

// Convenience helpers (kept for compatibility in routes)
export async function fetchSharedPatients(): Promise<any[]> {
  const data = await fetchSharedData()
  return data.patients
}

export async function saveSharedPatients(patients: any[]): Promise<void> {
  const data = await fetchSharedData()
  await saveSharedData({ ...data, patients })
}

export async function fetchSharedPrescriptions(): Promise<any[]> {
  const data = await fetchSharedData()
  return data.prescriptions
}

export async function saveSharedPrescriptions(prescriptions: any[]): Promise<void> {
  const data = await fetchSharedData()
  await saveSharedData({ ...data, prescriptions })
}