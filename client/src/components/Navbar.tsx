'use client';
import { useAuth } from "../utils/auth";
import Link from "next/link";
import { Group, Button, Text, Box, Flex, rem } from "@mantine/core";
import { IconDashboard, IconHome, IconLogin, IconUserPlus, IconLogout } from "@tabler/icons-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  
  // Reusable link style object
  const linkStyle = {
    textDecoration: 'none',
    color: 'white',
    fontWeight: 500,
    fontSize: 'var(--mantine-font-size-sm)',
    padding: `${rem(8)} ${rem(16)}`,
    borderRadius: 'var(--mantine-radius-sm)',
    transition: 'all 100ms ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.15)'
    }
  };

  return (
    <Box 
      px="md" 
      py="sm"
      bg="blue.8"
      style={{ 
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}
    >
      <Flex justify="space-between" align="center" mih={60}>
        <Group gap="xl">
          <Link href="/" style={linkStyle}>
            <Flex align="center" gap={8}>
              <IconHome size={18} color="white" />
              <Text c="white">Home</Text>
            </Flex>
          </Link>
          
          {user && user.role === "Manager" && (
            <Link href="/manager-dashboard" style={linkStyle}>
              <Flex align="center" gap={8}>
                <IconDashboard size={18} color="white" />
                <Text c="white">Manager Dashboard</Text>
              </Flex>
            </Link>
          )}
          
          {user && user.role === "Employee" && (
            <Link href="/employee-dashboard" style={linkStyle}>
              <Flex align="center" gap={8}>
                <IconDashboard size={18} color="white" />
                <Text c="white">Employee Dashboard</Text>
              </Flex>
            </Link>
          )}
        </Group>

        <Group gap="lg">
          {user ? (
            <>
              <Text fw={500} size="sm" c="gray.2" truncate style={{ maxWidth: rem(200) }}>
                {user.email}
              </Text>
              <Button 
                variant="white"
                color="blue.8"
                size="sm" 
                onClick={logout}
                leftSection={<IconLogout size={16} />}
                radius="sm"
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" style={linkStyle}>
                <Flex align="center" gap={8}>
                  <IconLogin size={18} color="white" />
                  <Text c="white">Login</Text>
                </Flex>
              </Link>
              
              <Link href="/register" passHref legacyBehavior>
                <Button 
                  component="a"
                  variant="white"
                  color="blue.8"
                  size="sm" 
                  leftSection={<IconUserPlus size={16} />}
                  radius="sm"
                >
                  Register
                </Button>
              </Link>
            </>
          )}
        </Group>
      </Flex>
    </Box>
  );
}