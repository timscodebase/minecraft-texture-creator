'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function HandleProtocol() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const url = searchParams.get('url');
    if (url) {
      // Handle the protocol URL: web+mtc://texture-data
      console.log('Protocol URL:', url);
      // Parse texture data and redirect to main app
      window.location.href = '/';
    }
  }, [searchParams]);

  return (
    <div className='flex items-center justify-center min-h-screen bg-[#170a01] text-white'>
      <p>Loading texture...</p>
    </div>
  );
}