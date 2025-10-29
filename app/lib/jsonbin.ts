const BIN_ID = "6901972eae596e708f34bee9"
const API_BASE = "https://api.jsonbin.io/v3/b"
const MAX_RETRIES = 3
const RETRY_DELAY = 1000

function getMasterKey(): string {
  return process.env.JSONBIN_MASTER_KEY || "$2a$10$mE5/U7tLVTXmEb6ZPIi11.se02ohDUJQEdRbAx8Ih.UciT.Bswbzy"
}

type SharedData = {
  patients: any[]
  prescriptions: any[]
  updatedAt?: string
}

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options)
      if (res.ok) return res
      if (res.status >= 500 && i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * (i + 1)))
        continue
      }
      return res
    } catch (error) {
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * (i + 1)))
        continue
      }
      throw error
    }
  }
  throw new Error("Max retries exceeded")
}

export async function fetchSharedData(): Promise<SharedData> {
  const url = `${API_BASE}/${BIN_ID}/latest`

  try {
    const res = await fetchWithRetry(url, {
      headers: {
        "X-Master-Key": getMasterKey(),
      },
      cache: "no-store",
    })

    if (!res.ok) {
      console.warn(`[v0] JSONBin fetch returned status ${res.status}, returning empty data`)
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
  } catch (error) {
    console.error("[v0] Error fetching from JSONBin:", error)
    // Return empty data on error to allow graceful degradation
    return { patients: [], prescriptions: [] }
  }
}

export async function saveSharedData(data: SharedData): Promise<void> {
  const url = `${API_BASE}/${BIN_ID}`
  const body = JSON.stringify({ ...data, updatedAt: new Date().toISOString() })

  try {
    const res = await fetchWithRetry(url, {
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
  } catch (error) {
    console.error("[v0] Error saving to JSONBin:", error)
    throw error
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
