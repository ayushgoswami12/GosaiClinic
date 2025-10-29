"use client"

const GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbwRBKjJF6x_MBWRDaOdUp15D4wAkuELUlTTN8Mu9SCmuL1Hg5u8z2klOKsLpW6C7JnBVQ/exec";

export async function fetchAllPatients() {
  try {
    const response = await fetch(GOOGLE_SHEETS_API_URL, {
      mode: 'no-cors'
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch patients");
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching patients from Google Sheets:", error);
    throw new Error("Error communicating with patient database.");
  }
}

export async function addPatient(patientData: any) {
  try {
    const response = await fetch(GOOGLE_SHEETS_API_URL, {
      method: "POST",
      mode: 'no-cors',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patientData),
    });
    
    if (!response.ok) {
      throw new Error("Failed to add patient");
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error adding patient to Google Sheets:", error);
    throw new Error("Error communicating with patient database.");
  }
}
