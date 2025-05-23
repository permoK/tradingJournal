'use client';

import { useEffect, useState, useRef } from 'react';

export default function ServerCompileLoader() {
  const [isCompiling, setIsCompiling] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [compilationProgress, setCompilationProgress] = useState(0);
  const loaderShownTimeRef = useRef<number | null>(null);

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

      // Start with a small initial progress
      setCompilationProgress(5);

      // Define progress stages for a more realistic simulation
      const stages = [
        { target: 30, speed: 200, increment: 1 },   // Initial quick progress
        { target: 60, speed: 300, increment: 0.8 }, // Medium progress
        { target: 85, speed: 500, increment: 0.5 }, // Slower progress
        { target: 95, speed: 800, increment: 0.2 }  // Very slow at the end
      ];

      let currentStage = 0;

      progressInterval = setInterval(() => {
        setCompilationProgress(prev => {
          const stage = stages[currentStage];

          // Move to next stage if we've reached the target
          if (prev >= stage.target && currentStage < stages.length - 1) {
            currentStage++;
            // Adjust interval speed for the new stage
            if (progressInterval) {
              clearInterval(progressInterval);
              progressInterval = setInterval(() => {
                setCompilationProgress(p => Math.min(p + stages[currentStage].increment, stages[currentStage].target));
              }, stages[currentStage].speed);
            }
          }

          // Slowly increase progress, but never exceed the current stage target
          return Math.min(prev + stage.increment, stage.target);
        });
      }, stages[0].speed);
    };

    // Function to stop progress simulation
    const stopProgressSimulation = () => {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }

      // Animate to 100% with a smooth transition
      setCompilationProgress(100);

      // Reset after animation completes and loader is hidden
      setTimeout(() => {
        setCompilationProgress(0);
      }, 2000);
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

  // Show loader with a longer delay to avoid flashing for quick compilations
  // and ensure a minimum display time once shown
  useEffect(() => {
    let showTimer: NodeJS.Timeout;
    let hideTimer: NodeJS.Timeout;

    const SHOW_DELAY = 1200; // Delay before showing loader (1.2 seconds)
    const MIN_DISPLAY_TIME = 1500; // Minimum time to display loader once shown (1.5 seconds)

    if (isCompiling) {
      // Use a longer delay to prevent showing the loader for fast compilations
      showTimer = setTimeout(() => {
        setShowLoader(true);
        // Record the time when the loader was shown
        loaderShownTimeRef.current = Date.now();
      }, SHOW_DELAY);
    } else {
      // When compilation is done, check if we need to keep the loader visible
      // to meet the minimum display time
      if (showLoader && loaderShownTimeRef.current) {
        const elapsedTime = Date.now() - loaderShownTimeRef.current;

        if (elapsedTime < MIN_DISPLAY_TIME) {
          // If the loader hasn't been shown for the minimum time,
          // wait before hiding it
          hideTimer = setTimeout(() => {
            setShowLoader(false);
            loaderShownTimeRef.current = null;
          }, MIN_DISPLAY_TIME - elapsedTime);
        } else {
          // If it's been shown long enough, hide it immediately
          setShowLoader(false);
          loaderShownTimeRef.current = null;
        }
      } else {
        // If the loader wasn't shown yet, just reset
        setShowLoader(false);
        loaderShownTimeRef.current = null;
      }
    }

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [isCompiling, showLoader]);

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
            style={{
              width: `${compilationProgress}%`,
              transition: 'width 0.5s ease-out'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
