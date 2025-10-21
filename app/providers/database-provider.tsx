'use client';

import { ReactNode, useEffect, useState } from 'react';
import { checkTables, setupTables } from '../lib/supabase/setup-tables';

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Check if tables exist
        const tablesStatus = await checkTables();
        
        if (!tablesStatus.patientsExists || !tablesStatus.prescriptionsExists) {
          // Set up tables if they don't exist
          await setupTables();
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Database initialization error:', error);
        // Continue showing the app even if there's an error
        setIsInitialized(true);
      }
    };

    initializeDatabase();
  }, []);

  // Return children regardless of initialization status
  // This prevents blocking the UI while tables are being checked/created
  return <>{children}</>;
}