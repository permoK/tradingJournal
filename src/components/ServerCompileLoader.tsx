'use client';

import { useEffect, useState } from 'react';

export default function ServerCompileLoader() {
  const [isCompiling, setIsCompiling] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [compilationProgress, setCompilationProgress] = useState(0);

  // Detect compilation through various methods
  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      return; // Only run in development mode on client
    }

    let socket: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;
    let connectionAttempts = 0;
    const maxConnectionAttempts = 5;
    let progressInterval: NodeJS.Timeout | null = null;

    // Function to handle page refreshes and navigation
    const handleBeforeUnload = () => {
      setIsCompiling(true);
    };

    // Function to handle tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsCompiling(true);
      }
    };

    // Function to simulate progress during compilation
    const startProgressSimulation = () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }

      setCompilationProgress(0);

      progressInterval = setInterval(() => {
        setCompilationProgress(prev => {
          // Slowly increase progress, but never reach 100% until compilation is done
          if (prev < 90) {
            return prev + Math.random() * 5;
          }
          return prev;
        });
      }, 300);
    };

    // Function to stop progress simulation
    const stopProgressSimulation = () => {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }

      // Complete the progress to 100%
      setCompilationProgress(100);

      // Reset after animation completes
      setTimeout(() => {
        setCompilationProgress(0);
      }, 500);
    };

    // Connect to WebSocket for HMR events
    const connectWebSocket = () => {
      // Close existing socket if it exists
      if (socket) {
        socket.close();
      }

      try {
        // Connect to Next.js development server WebSocket
        socket = new WebSocket(`ws://${window.location.host}/_next/webpack-hmr`);

        socket.addEventListener('open', () => {
          connectionAttempts = 0;
        });

        socket.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data);

            // Check for compilation events
            if (data.action === 'building') {
              setIsCompiling(true);
              startProgressSimulation();
            } else if (data.action === 'built' || data.action === 'sync') {
              stopProgressSimulation();

              // Add a small delay to ensure the page has updated
              setTimeout(() => {
                setIsCompiling(false);
              }, 500);
            }
          } catch (error) {
            // Ignore parsing errors
          }
        });

        socket.addEventListener('close', () => {
          // Try to reconnect if we haven't exceeded max attempts
          if (connectionAttempts < maxConnectionAttempts) {
            connectionAttempts++;

            if (reconnectTimer) {
              clearTimeout(reconnectTimer);
            }

            reconnectTimer = setTimeout(() => {
              connectWebSocket();
            }, 2000); // Reconnect after 2 seconds
          }
        });

        socket.addEventListener('error', () => {
          if (socket) {
            socket.close();
          }
        });
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
      }
    };

    // Listen for the "beforeunload" event
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Listen for the "visibilitychange" event
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial WebSocket connection
    connectWebSocket();

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (socket) {
        socket.close();
      }

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, []);

  // Show loader with a slight delay to avoid flashing for quick compilations
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isCompiling) {
      timer = setTimeout(() => {
        setShowLoader(true);
      }, 300); // Show loader after 300ms of compilation
    } else {
      setShowLoader(false);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [isCompiling]);

  // Add keyboard shortcut to dismiss the loader
  useEffect(() => {
    if (!showLoader) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow ESC key to dismiss the loader
      if (e.key === 'Escape') {
        setShowLoader(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLoader]);

  // If not showing loader, don't render anything
  if (!showLoader) {
    return null;
  }

  // Render the loader when compiling
  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-slate-200 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300 ease-out"
            style={{ width: `${compilationProgress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
