'use client';
import { useAuth } from '../utils/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Title, Center } from '@mantine/core';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === 'MANAGER') router.replace('/manager');
    else if (user?.role === 'EMPLOYEE') router.replace('/employee');
  }, [user, router]);

  return (
    <Center style={{ minHeight: '60vh' }}>
      <Title order={2}>Welcome to the Feedback Tool</Title>
    </Center>
  );
}