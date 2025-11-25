'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/providers/AuthProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MavitLogo } from '@/components/ui/MavitLogo';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <div className="mb-4 flex justify-center">
              <MavitLogo size="xl" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Mavit</h1>
            <p className="text-gray-400">Mega App de Produtividade</p>
          </div>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return null;
}