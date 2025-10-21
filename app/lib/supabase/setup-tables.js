// Direct SQL execution script to create required tables in Supabase
import { createClient } from './client';

// Function to check if tables exist (removed duplicate)
// This function is defined again at the bottom of the file

// SQL script to create tables
const createTablesSQL = `
-- Required for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  blood_type TEXT,
  allergies TEXT,
  medical_history TEXT,
  date_of_visit DATE,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  doctor_name TEXT,
  medications JSONB DEFAULT '[]'::jsonb,
  diagnosis TEXT,
  investigation TEXT,
  fee TEXT,
  notes TEXT,
  prescription_date DATE,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patients table
CREATE POLICY IF NOT EXISTS "Public access to patients" ON public.patients
  FOR ALL USING (true);

-- Allow all operations for public_user
CREATE POLICY IF NOT EXISTS "Public user can manage patients" ON public.patients
  FOR ALL USING (user_id = 'public_user');

-- RLS Policies for prescriptions table
CREATE POLICY IF NOT EXISTS "Public access to prescriptions" ON public.prescriptions
  FOR ALL USING (true);

-- Allow all operations for public_user
CREATE POLICY IF NOT EXISTS "Public user can manage prescriptions" ON public.prescriptions
  FOR ALL USING (user_id = 'public_user');

-- Delete policy for prescriptions
CREATE POLICY IF NOT EXISTS "Public user can delete prescriptions" ON public.prescriptions
  FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_user_id ON public.prescriptions(user_id);
`;

// Function to execute the SQL directly
export async function setupTables() {
  try {
    console.log('Setting up database tables...');
    const supabase = createClient();
    
    // First try using the SQL API
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: createTablesSQL });
      if (!error) {
        console.log('Database tables setup completed successfully using RPC');
        return { success: true };
      }
    } catch (rpcError) {
      console.warn('RPC method failed, trying REST API:', rpcError);
    }
    
    // Fallback to REST API
    try {
      const response = await fetch(`${supabase.supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'apikey': supabase.supabaseKey,
          'X-Client-Info': 'supabase-js/2.0.0',
        },
        body: JSON.stringify({
          query: createTablesSQL
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      
      console.log('Database tables setup completed successfully using REST API');
      return { success: true };
    } catch (restError) {
      console.error('REST API method failed:', restError);
      
      // Last resort: try creating tables one by one using Supabase client
      try {
        // Create patients table
        await supabase.from('patients').select('id').limit(1).catch(async () => {
          await supabase.rpc('create_patients_table').catch(e => console.error('Failed to create patients table:', e));
        });
        
        // Create prescriptions table
        await supabase.from('prescriptions').select('id').limit(1).catch(async () => {
          await supabase.rpc('create_prescriptions_table').catch(e => console.error('Failed to create prescriptions table:', e));
        });
        
        return { success: true };
      } catch (finalError) {
        throw finalError;
      }
    }
  } catch (error) {
    console.error('Database tables setup failed:', error);
    return { success: false, error: error.toString() };
  }
}

// Function to check if tables exist
export async function checkTables() {
  const supabase = createClient();
  
  try {
    // Check if patients table exists
    const { data: patientsData, error: patientsError } = await supabase
      .from('patients')
      .select('count(*)', { count: 'exact', head: true });
      
    // Check if prescriptions table exists
    const { data: prescriptionsData, error: prescriptionsError } = await supabase
      .from('prescriptions')
      .select('count(*)', { count: 'exact', head: true });
    
    return {
      patientsExists: !patientsError,
      prescriptionsExists: !prescriptionsError,
      patientsError: patientsError?.message,
      prescriptionsError: prescriptionsError?.message
    };
  } catch (error) {
    console.error('Error checking tables:', error);
    return {
      patientsExists: false,
      prescriptionsExists: false,
      error: error.message
    };
  }
}