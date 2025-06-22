'use client';
import { useState } from "react";
import { useAuth } from "../utils/auth";
import { useRouter } from "next/navigation";
import { TextInput, PasswordInput, Button, Paper, Title, Text, Select, NumberInput } from "@mantine/core";

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "Manager" | "Employee";
  manager_id?: number;
}

export default function RegisterForm() {
  const { register } = useAuth();
  const [form, setForm] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    role: "Employee",
    manager_id: undefined,
  });
  const [err, setErr] = useState("");
  const router = useRouter();

  const handleChange = (field: keyof RegisterData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    
    try {
      const data: Omit<RegisterData, "manager_id"> & { manager_id?: number } = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      };
      
      if (form.role === "Employee") {
        if (!form.manager_id) {
          setErr("Manager ID is required for employees.");
          return;
        }
        data.manager_id = form.manager_id;
      }
      console.log("getting here")
      await register(data);
 
      router.push("/login");
    } catch (err) {
      console.error("Registration error:", err);
      setErr("Registration failed. Please check your details and try again.");
    }
  };

  return (
    <Paper maw={400} mx="auto" p="md" withBorder>
      <Title order={2} mb="md">Register</Title>
      {err && <Text c="red" mb="sm">{err}</Text>}
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Name"
          value={form.name}
          required
          onChange={(e) => handleChange("name", e.target.value)}
          mb="sm"
        />
        <TextInput
          label="Email"
          type="email"
          value={form.email}
          required
          onChange={(e) => handleChange("email", e.target.value)}
          mb="sm"
        />
        <PasswordInput
          label="Password"
          value={form.password}
          required
          onChange={(e) => handleChange("password", e.target.value)}
          mb="sm"
        />
        <Select
          label="Role"
          data={[
            { value: "Employee", label: "Employee" },
            { value: "Manager", label: "Manager" },
          ]}
          value={form.role}
          onChange={(value) => handleChange("role", value as "Manager" | "Employee")}
          mb="sm"
        />
        {form.role === "Employee" && (
          <NumberInput
            label="Manager ID"
            value={form.manager_id || ""}
            onChange={(value) => handleChange("manager_id", Number(value))}
            mb="sm"
            required
            min={1}
          />
        )}
        <Button type="submit" fullWidth mt="md">
          Register
        </Button>
      </form>
    </Paper>
  );
}