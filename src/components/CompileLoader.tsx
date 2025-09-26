'use client';

import { useEffect, useState } from 'react';

export default function CompileLoader() {
  const [isCompiling, setIsCompiling] = useState(false);

  useEffect(() => {
    // Function to handle the "before-unload" event
    const handleBeforeUnload = () => {
      setIsCompiling(true);
    };

    // Function to handle the "visibilitychange" event
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsCompiling(true);
      }
    };

    // Function to handle the Next.js hot module replacement events
    const handleHotUpdate = () => {
      if (process.env.NODE_ENV === 'development') {
        setIsCompiling(true);
        
        // Reset after a delay to handle false positives
        const timeout = setTimeout(() => {
          setIsCompiling(false);
        }, 5000);
        
        return () => clearTimeout(timeout);
      }
    };

    // Listen for the "beforeunload" event
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Listen for the "visibilitychange" event
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Check if we're in development mode and if the module has hot reloading
    if (process.env.NODE_ENV === 'development' && typeof module !== 'undefined' && (module as any).hot) {
      (module as any).hot.addStatusHandler((status: string) => {
        if (status === 'check' || status === 'prepare') {
          setIsCompiling(true);
        } else if (status === 'idle') {
          setIsCompiling(false);
        }
      });
    }

    // Clean up event listeners
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // If not compiling, don't render anything
  if (!isCompiling) {
    return null;
  }

  // Render the loader when compiling
  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold text-slate-800">Compiling...</h2>
        <p className="text-slate-600 mt-2">The server is updating your changes</p>
      </div>
    </div>
  );
}
