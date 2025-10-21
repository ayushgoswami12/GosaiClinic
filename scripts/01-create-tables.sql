-- Create users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  phone TEXT,
  address TEXT,
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
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for patients table
CREATE POLICY "Users can view their own patients" ON public.patients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own patients" ON public.patients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patients" ON public.patients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own patients" ON public.patients
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for prescriptions table
CREATE POLICY "Users can view their own prescriptions" ON public.prescriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prescriptions" ON public.prescriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prescriptions" ON public.prescriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prescriptions" ON public.prescriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_patients_user_id ON public.patients(user_id);
CREATE INDEX idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX idx_prescriptions_user_id ON public.prescriptions(user_id);
