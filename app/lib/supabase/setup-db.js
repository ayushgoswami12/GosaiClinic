// This script helps set up the required database tables in Supabase
import { createClient } from './client';
import { setupTables } from './setup-tables';

// Helper function to set up RLS policies
async function setupRLSPolicies(supabase) {
  try {
    // Enable RLS on tables
    await supabase.rpc('enable_rls_on_patients').catch(e => console.warn('RLS enable error:', e));
    await supabase.rpc('enable_rls_on_prescriptions').catch(e => console.warn('RLS enable error:', e));
    
    // Create policies for shared_clinic_data
    const sharedPolicySQL = `
      CREATE POLICY IF NOT EXISTS "Shared clinic data access" ON patients
        FOR ALL USING (user_id = 'shared_clinic_data');
      CREATE POLICY IF NOT EXISTS "Shared clinic data access" ON prescriptions
        FOR ALL USING (user_id = 'shared_clinic_data');
    `;
    
    await supabase.rpc('exec_sql', { sql: sharedPolicySQL }).catch(e => console.warn('Policy creation error:', e));
    
    return true;
  } catch (error) {
    console.warn('RLS policy setup error:', error);
    return false;
  }
}

export async function setupDatabase() {
  try {
    console.log('Starting database setup...');
    const supabase = createClient();
    
    // Check if tables exist by attempting to query them
    const { error: patientsQueryError } = await supabase
      .from('patients')
      .select('id')
      .limit(1);
    
    const { error: prescriptionsQueryError } = await supabase
      .from('prescriptions')
      .select('id')
      .limit(1);
    
    // If either table doesn't exist, run the full setup
    if ((patientsQueryError && patientsQueryError.message.includes('does not exist')) || 
        (prescriptionsQueryError && prescriptionsQueryError.message.includes('does not exist'))) {
      console.log('Tables missing, running full setup...');
      
      // Use the setupTables function from setup-tables.js
      const setupResult = await setupTables();
      
      if (!setupResult.success) {
        console.error('Error setting up tables:', setupResult.error);
        return setupResult;
      }
      
      console.log('Tables created successfully');
    } else {
      console.log('Tables already exist, skipping creation');
    }
    
    // Set up RLS policies if needed
    await setupRLSPolicies(supabase);
    
    console.log('Database setup completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Database setup failed:', error);
    return { success: false, error };
  }
}

// Function to create stored procedures in Supabase
export async function createStoredProcedures() {
  try {
    const supabase = createClient();
    
    // Create stored procedure for patients table
    const createPatientsTableSQL = `
    CREATE OR REPLACE FUNCTION create_patients_table()
    RETURNS void AS $$
    BEGIN
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
      
      -- Enable RLS
      ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
      
      -- Create policies
      CREATE POLICY "Public access to patients" ON public.patients
        FOR ALL USING (true);
      
      CREATE POLICY "Public user can manage patients" ON public.patients
        FOR ALL USING (user_id = 'public_user');
        
      -- Create index
      CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
    END;
    $$ LANGUAGE plpgsql;
    `;
    
    // Create stored procedure for prescriptions table
    const createPrescriptionsTableSQL = `
    CREATE OR REPLACE FUNCTION create_prescriptions_table()
    RETURNS void AS $$
    BEGIN
      CREATE TABLE IF NOT EXISTS public.prescriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL,
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
      
      -- Enable RLS
      ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
      
      -- Create policies
      CREATE POLICY "Public access to prescriptions" ON public.prescriptions
        FOR ALL USING (true);
      
      CREATE POLICY "Public user can manage prescriptions" ON public.prescriptions
        FOR ALL USING (user_id = 'public_user');
        
      CREATE POLICY "Public user can delete prescriptions" ON public.prescriptions
        FOR DELETE USING (true);
        
      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON public.prescriptions(patient_id);
      CREATE INDEX IF NOT EXISTS idx_prescriptions_user_id ON public.prescriptions(user_id);
      
      -- Add foreign key if patients table exists
      BEGIN
        ALTER TABLE public.prescriptions 
        ADD CONSTRAINT fk_prescriptions_patient_id 
        FOREIGN KEY (patient_id) 
        REFERENCES public.patients(id) 
        ON DELETE CASCADE;
      EXCEPTION
        WHEN undefined_table THEN
          RAISE NOTICE 'patients table does not exist yet, skipping foreign key';
      END;
    END;
    $$ LANGUAGE plpgsql;
    `;
    
    // Execute the SQL to create the stored procedures
    const { error: createPatientsTableError } = await supabase.rpc('exec_sql', { 
      sql: createPatientsTableSQL 
    });
    
    if (createPatientsTableError) {
      console.error('Error creating patients table procedure:', createPatientsTableError);
      return { success: false, error: createPatientsTableError };
    }
    
    const { error: createPrescriptionsTableError } = await supabase.rpc('exec_sql', { 
      sql: createPrescriptionsTableSQL 
    });
    
    if (createPrescriptionsTableError) {
      console.error('Error creating prescriptions table procedure:', createPrescriptionsTableError);
      return { success: false, error: createPrescriptionsTableError };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error creating stored procedures:', error);
    return { success: false, error };
  }
}

// Function to verify if tables exist
export async function verifyTables() {
  try {
    const supabase = createClient();
    
    // Check patients table
    const { data: patientsData, error: patientsError } = await supabase
      .from('patients')
      .select('id')
      .limit(1);
      
    // Check prescriptions table
    const { data: prescriptionsData, error: prescriptionsError } = await supabase
      .from('prescriptions')
      .select('id')
      .limit(1);
      
    return {
      patientsTableExists: !patientsError,
      prescriptionsTableExists: !prescriptionsError,
      patientsError,
      prescriptionsError
    };
  } catch (error) {
    console.error('Error verifying tables:', error);
    return {
      patientsTableExists: false,
      prescriptionsTableExists: false,
      error
    };
  }
}