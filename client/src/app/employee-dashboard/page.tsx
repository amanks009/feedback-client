'use client';
import dynamic from 'next/dynamic';
import { LoadingOverlay } from '@mantine/core';
import { useAuth } from '@/utils/auth';

const EmployeeDashboard = dynamic(
  () => import('@/components/EmployeeDashboard'),
  { 
    loading: () => <LoadingOverlay visible />,
    ssr: false 
  }
);

export default function Page() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingOverlay visible />;
  }

  if (!user || user.role !== 'Employee') {
    window.location.href = '/login';
    return null;
  }

  return <EmployeeDashboard />;
}