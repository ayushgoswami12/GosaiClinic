'use client';

import { useEffect, useState } from 'react';
import { checkTables, setupTables } from '../lib/supabase/setup-tables';

export function DatabaseInitializerWrapper() {
  const [status, setStatus] = useState<'initializing' | 'success' | 'error'>('initializing');
  const [message, setMessage] = useState('Checking database tables...');

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Check if tables exist
        const tablesStatus = await checkTables();
        
        if (!tablesStatus.patientsExists || !tablesStatus.prescriptionsExists) {
          setMessage('Creating required database tables...');
          
          // Set up tables if they don't exist
          const setupResult = await setupTables();
          
          if (setupResult.success) {
            setStatus('success');
            setMessage('Database initialized successfully');
          } else {
            setStatus('error');
            setMessage(`Database initialization failed: ${setupResult.error}`);
            console.error('Database initialization error:', setupResult.error);
          }
        } else {
          setStatus('success');
          setMessage('Database tables already exist');
        }
      } catch (error) {
        setStatus('error');
        setMessage(`Database initialization error: ${error.message}`);
        console.error('Database initialization error:', error);
      }
    };

    initializeDatabase();
  }, []);

  // This component doesn't render anything visible
  return null;
}