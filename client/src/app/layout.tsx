import '@mantine/core/styles.css';
import '../app/globals.css';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { AuthProvider } from '../utils/auth';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'Feedback Tool',
  description: 'Internal feedback sharing tool',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MantineProvider>
          <Notifications />
          <ModalsProvider>
            <AuthProvider>
              <Navbar />
              <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
                {children}
              </main>
            </AuthProvider>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
