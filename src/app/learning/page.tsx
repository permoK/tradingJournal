'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Learning() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to strategies page
    router.replace('/strategies');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-slate-700 font-medium">Redirecting to Strategies...</div>
    </div>
  );
}
