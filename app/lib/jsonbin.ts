// Server-side JSONBin helper
const BIN_ID = "6901972eae596e708f34bee9"
const API_BASE = "https://api.jsonbin.io/v3/b"

function getMasterKey(): string {
  return (
    process.env.JSONBIN_MASTER_KEY ||
    "$2a$10$mE5/U7tLVTXmEb6ZPIi11.se02ohDUJQEdRbAx8Ih.UciT.Bswbzy"
  )
}

export async function fetchSharedPatients(): Promise<any[]> {
  const url = `${API_BASE}/${BIN_ID}/latest`
  const res = await fetch(url, {
    headers: {
      "X-Master-Key": getMasterKey(),
    },
    cache: "no-store",
  })

  if (!res.ok) {
    // If bin not found or empty, return empty list gracefully
    return []
  }

  const json = await res.json().catch(() => ({ record: [] }))
  const record = json?.record

  if (Array.isArray(record)) return record
  if (record && Array.isArray(record.patients)) return record.patients
  return []
}

export async function saveSharedPatients(patients: any[]): Promise<void> {
  const url = `${API_BASE}/${BIN_ID}`
  const body = JSON.stringify({ patients, updatedAt: new Date().toISOString() })

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