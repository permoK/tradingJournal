'use client';

import { useEffect, useState } from 'react';

export default function WebSocketLoader() {
  const [isCompiling, setIsCompiling] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return; // Only run in development mode
    }

    let socket: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;
    let connectionAttempts = 0;
    const maxConnectionAttempts = 5;

    const connectWebSocket = () => {
      // Close existing socket if it exists
      if (socket) {
        socket.close();
      }

      // Connect to Next.js development server WebSocket
      // This is the standard port and path for Next.js HMR WebSocket
      socket = new WebSocket(`ws://${window.location.host}/_next/webpack-hmr`);

      socket.addEventListener('open', () => {
        connectionAttempts = 0;
        console.log('Connected to Next.js HMR WebSocket');
      });

      socket.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Check for compilation events
          if (data.action === 'building') {
            setIsCompiling(true);
          } else if (data.action === 'built' || data.action === 'sync') {
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
    };

    // Initial connection
    connectWebSocket();

    // Cleanup function
    return () => {
      if (socket) {
        socket.close();
      }
      
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
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
