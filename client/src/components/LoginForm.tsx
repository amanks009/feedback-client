'use client';
import { useState, useEffect } from "react";
import { useAuth } from "../utils/auth";
import { useRouter } from "next/navigation";
import { TextInput, PasswordInput, Button, Paper, Title, Text, Loader } from "@mantine/core";

export default function LoginForm() {
  const { user, login, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      const redirectPath = user.role === "Manager" 
        ? "/manager-dashboard" 
        : "/employee-dashboard";
      router.replace(redirectPath);
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setSubmitting(true);
    try {
      await login(email, password);
      // No need to redirect here - the useEffect will handle it
    } catch (error) {
      setErr("Invalid credentials");
      console.error('Login failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader size="xl" />
      </div>
    );
  }

  return (
    <Paper maw={340} mx="auto" p="md" withBorder>
      <Title order={2} mb="md">Login</Title>
      {err && <Text color="red" mb="sm">{err}</Text>}
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          mb="sm"
        />
        <PasswordInput
          label="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          mb="sm"
        />
        <Button 
          type="submit" 
          fullWidth
          loading={submitting}
          disabled={submitting}
        >
          Login
        </Button>
      </form>
    </Paper>
  );
}