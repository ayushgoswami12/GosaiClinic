// Supabase initialization script
import { setupDatabase } from './setup-db';

// Initialize Supabase on app startup
export async function initializeSupabase() {
  console.log('Initializing Supabase...');
  
  try {
    // Set up database tables and policies
    const result = await setupDatabase();
    
    if (result.success) {
      console.log('Supabase initialization successful');
      return { success: true };
    } else {
      console.error('Supabase initialization failed:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Supabase initialization error:', error);
    return { success: false, error: error.toString() };
  }
}

// Export a function to be called during app startup
export default initializeSupabase;
