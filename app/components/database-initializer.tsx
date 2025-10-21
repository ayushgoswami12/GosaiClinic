⨯ ./app/layout.tsx
Error:   × `ssr: false` is not allowed with `next/dynamic` in Server Components. Please move it into a client component.
    ╭─[C:\GosaiClinic\New\app\layout.tsx:12:1]
  9 │     import dynamic from "next/dynamic"
 10 │
 11 │     // Import the DatabaseInitializer with dynamic import to ensure it only runs on client
 12 │ ╭─▶ const DatabaseInitializer = dynamic(
 13 │ │     () => import("@/app/components/database-initializer").then(mod => ({ default: mod.DatabaseInitializer })),
 14 │ │     { ssr: false }
 15 │ ╰─▶ )
 16 │
 17 │     const inter = Inter({ subsets: ["latin"] })
    ╰────

Import trace for requested module:
./app/layout.tsx
 ⨯ ./app/layout.tsx
Error:   × `ssr: false` is not allowed with `next/dynamic` in Server Components. Please move it into a client component.
    ╭─[C:\GosaiClinic\New\app\layout.tsx:12:1]
  9 │     import dynamic from "next/dynamic"
 10 │
 11 │     // Import the DatabaseInitializer with dynamic import to ensure it only runs on client
 12 │ ╭─▶ const DatabaseInitializer = dynamic(
 13 │ │     () => import("@/app/components/database-initializer").then(mod => ({ default: mod.DatabaseInitializer })),
 14 │ │     { ssr: false }
 15 │ ╰─▶ )
 16 │
 17 │     const inter = Inter({ subsets: ["latin"] })
    ╰────

Import trace for requested module:
./app/layout.tsx
 ⨯ ./app/layout.tsx
Error:   × `ssr: false` is not allowed with `next/dynamic` in Server Components. Please move it into a client component.
    ╭─[C:\GosaiClinic\New\app\layout.tsx:12:1]
  9 │     import dynamic from "next/dynamic"
 10 │
 11 │     // Import the DatabaseInitializer with dynamic import to ensure it only runs on client
 12 │ ╭─▶ const DatabaseInitializer = dynamic(
 13 │ │     () => import("@/app/components/database-initializer").then(mod => ({ default: mod.DatabaseInitializer })),
 14 │ │     { ssr: false }
 15 │ ╰─▶ )
 16 │
 17 │     const inter = Inter({ subsets: ["latin"] })
    ╰────

Import trace for requested module:
./app/layout.tsx
 ⚠ Duplicate page detected. app\api\patients\route.js and app\api\patients\route.ts resolve to
 /api/patients
 ⚠ Duplicate page detected. app\api\patients\[id]\route.js and app\api\patients\[id]\route.ts resolve to /api/patients/[id]
 ○ Compiling /patients ...
 ⨯ ./app/layout.tsx
Error:   × `ssr: false` is not allowed with `next/dynamic` in Server Components. Please move it into a client component.
    ╭─[C:\GosaiClinic\New\app\layout.tsx:12:1]
  9 │     import dynamic from "next/dynamic"
 10 │
 11 │     // Import the DatabaseInitializer with dynamic import to ensure it only runs on client
 12 │ ╭─▶ const DatabaseInitializer = dynamic(
 13 │ │     () => import("@/app/components/database-initializer").then(mod => ({ default: mod.DatabaseInitializer })),
 14 │ │     { ssr: false }
 15 │ ╰─▶ )
 16 │
 17 │     const inter = Inter({ subsets: ["latin"] })
    ╰────

Import trace for requested module:
./app/layout.tsx
 GET /patients/register 500 in 8202ms
 GET /patients/register 500 in 3609ms
 ⨯ ./app/layout.tsx
Error:   × `ssr: false` is not allowed with `next/dynamic` in Server Components. Please move it into a client component.
    ╭─[C:\GosaiClinic\New\app\layout.tsx:12:1]
  9 │     import dynamic from "next/dynamic"
 10 │
 11 │     // Import the DatabaseInitializer with dynamic import to ensure it only runs on client
 12 │ ╭─▶ const DatabaseInitializer = dynamic(
 13 │ │     () => import("@/app/components/database-initializer").then(mod => ({ default: mod.DatabaseInitializer })),
 14 │ │     { ssr: false }
 15 │ ╰─▶ )
 16 │
 17 │     const inter = Inter({ subsets: ["latin"] })
    ╰────

Import trace for requested module:
./app/layout.tsx
 ⨯ ./app/layout.tsx
Error:   × `ssr: false` is not allowed with `next/dynamic` in Server Components. Please move it into a client component.
    ╭─[C:\GosaiClinic\New\app\layout.tsx:12:1]
  9 │     import dynamic from "next/dynamic"
 10 │
 11 │     // Import the DatabaseInitializer with dynamic import to ensure it only runs on client
 12 │ ╭─▶ const DatabaseInitializer = dynamic(
 13 │ │     () => import("@/app/components/database-initializer").then(mod => ({ default: mod.DatabaseInitializer })),
 14 │ │     { ssr: false }
 15 │ ╰─▶ )
 16 │
 17 │     const inter = Inter({ subsets: ["latin"] })
    ╰────

Import trace for requested module:
./app/layout.tsx
 GET /_next/static/webpack/a89ba50de0222cf5.webpack.hot-update.json 500 in 351ms
 GET /favicon.ico 500 in 378ms
 ⚠ Fast Refresh had to perform a full reload. Read more: https://nextjs.org/docs/messages/fast-refresh-reload
 GET /patients/register 500 in 13ms
 GET /favicon.ico 500 in 6ms
'use client';

import { useEffect, useState } from 'react';
import { checkTables, setupTables } from '../lib/supabase/setup-tables';

export function DatabaseInitializer() {
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