'use client';

import { useEffect } from 'react';
import { checkTables, setupTables } from '../lib/supabase/setup-tables';

export function DatabaseInitClient() {
  useEffect(() => {
    const initDb = async () => {
      try {
        const tablesStatus = await checkTables();
        if (!tablesStatus.patientsExists || !tablesStatus.prescriptionsExists) {
          await setupTables();
          console.log('Database tables initialized successfully');
        }
      } catch (error) {
        console.error('Database initialization error:', error);
      }
    };

    initDb();
  }, []);

  return null;
}
