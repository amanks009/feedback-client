'use client';
import { useEffect, useState } from "react";
import api from "../utils/api";
import FeedbackForm from "./FeedbackForm";
import { 
  Table, Button, Title, Paper, Text, LoadingOverlay, 
  Group, ActionIcon, Badge, Flex, Box, ScrollArea,
  Stack, Divider, Modal, useMantineTheme
} from "@mantine/core";
import { IconEdit, IconTrash, IconPlus, IconUser, IconChartBar, IconLogout } from "@tabler/icons-react";
import { EmployeeWithFeedback, Feedback } from "../types/feedback";
import { useAuth } from "../utils/auth";
import { useDisclosure } from "@mantine/hooks";
import { useModals } from '@mantine/modals';

export default function ManagerDashboard() {
  const [team, setTeam] = useState<EmployeeWithFeedback[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithFeedback | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const { logout } = useAuth();
  const theme = useMantineTheme();
  const modals = useModals();

  useEffect(() => {
    const fetchTeam = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/dashboard");
        setTeam(response.data.team);
      } catch (err) {
        setError("Failed to load team data");
        console.error("Error fetching team:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeam();
  }, [refresh]);

  const handleSelectEmployee = async (emp: EmployeeWithFeedback) => {
    setSelectedEmployee(emp);
    setFeedbackLoading(true);
    setError(null);
    try {
      const response = await api.get(`/feedback/${emp.employee.id}`);
      setFeedbacks(response.data);
    } catch (err) {
      setError("Failed to load feedback");
      console.error("Error fetching feedback:", err);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleOpenFeedbackModal = (emp: EmployeeWithFeedback) => {
    setSelectedEmployee(emp);
    setEditingFeedback(null);
    open();
  };

  const handleEditFeedback = (feedback: Feedback) => {
    setEditingFeedback(feedback);
    open();
  };

  const handleDeleteFeedback = async (feedbackId: number) => {
    modals.openConfirmModal({
      title: 'Delete feedback',
      children: <Text size="sm">Are you sure you want to delete this feedback?</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await api.delete(`/feedback/${feedbackId}`);
          if (selectedEmployee) {
            const response = await api.get(`/feedback/${selectedEmployee.employee.id}`);
            setFeedbacks(response.data);
          }
          setRefresh(r => r + 1);
        } catch (err) {
          setError("Failed to delete feedback");
          console.error("Error deleting feedback:", err);
        }
      },
    });
    
  };

  const handleFeedbackSuccess = () => {
    setRefresh(r => r + 1);
    close();
    setEditingFeedback(null);
    if (selectedEmployee) {
      handleSelectEmployee(selectedEmployee);
    }
  };

  const SentimentBadge = ({ sentiment }: { sentiment: string }) => {
    const colorMap = {
      POSITIVE: 'teal',
      NEUTRAL: 'yellow',
      NEGATIVE: 'red'
    };
    
    return (
      <Badge 
        color={colorMap[sentiment as keyof typeof colorMap] || 'gray'} 
        variant="light"
        radius="sm"
      >
        {sentiment.toLowerCase()}
      </Badge>
    );
  };

  return (
    <Box maw={1200} mx="auto" p="md">
      <Flex justify="space-between" align="center" mb="xl">
        <Flex align="center" gap="sm">
          <IconChartBar size={24} color={theme.colors.blue[6]} />
          <Title order={2}>Team Performance Dashboard</Title>
        </Flex>
        {/* <Button 
          variant="outline" 
          leftSection={<IconLogout size={16} />}
          onClick={logout}
        >
          Logout */}
        {/* </Button> */}
      </Flex>

      <Modal 
        opened={opened} 
        onClose={close}
        title={
          <Text fw={600}>
            {editingFeedback ? 'Edit Feedback' : 'Give Feedback'} 
            {selectedEmployee && ` for ${selectedEmployee.employee.name}`}
          </Text>
        }
        size="lg"
      >
        {selectedEmployee && (
          <FeedbackForm
            employeeId={selectedEmployee.employee.id}
            employeeName={selectedEmployee.employee.name}
            opened={opened}
            onClose={close}
            onSuccess={handleFeedbackSuccess}
            editingFeedback={editingFeedback}
          />
        )}
      </Modal>

      <Flex gap="xl" style={{ position: 'relative' }}>
        <LoadingOverlay visible={loading} />
        
        <Box style={{ flex: 2 }}>
          <Paper withBorder shadow="sm" p="md" mb="md">
            <Flex justify="space-between" align="center" mb="md">
              <Title order={4} c="dimmed">Team Members</Title>
              <Text size="sm" c="dimmed">{team.length} employees</Text>
            </Flex>
            
            <ScrollArea h={600}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Employee</Table.Th>
                    <Table.Th>Feedback</Table.Th>
                    <Table.Th>Sentiment</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {team.map((emp) => (
                    <Table.Tr key={emp.employee.id}>
                      <Table.Td>
                        <Flex align="center" gap="sm">
                          <IconUser size={18} color={theme.colors.blue[6]} />
                          <Box>
                            <Text fw={500}>{emp.employee.name}</Text>
                            <Text size="sm" c="dimmed">{emp.employee.email}</Text>
                          </Box>
                        </Flex>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="outline" color="blue">
                          {emp.feedback_count} feedbacks
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Flex gap="xs">
                          <Badge color="teal" variant="light">+{emp.sentiments.POSITIVE}</Badge>
                          <Badge color="yellow" variant="light">~{emp.sentiments.NEUTRAL}</Badge>
                          <Badge color="red" variant="light">-{emp.sentiments.NEGATIVE}</Badge>
                        </Flex>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" wrap="nowrap">
                          <Button 
                            size="xs" 
                            variant="subtle"
                            onClick={() => handleSelectEmployee(emp)}
                          >
                            View
                          </Button>
                          <Button 
                            size="xs" 
                            leftSection={<IconPlus size={14} />}
                            onClick={() => handleOpenFeedbackModal(emp)}
                          >
                            Add
                          </Button>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Paper>
        </Box>

        {selectedEmployee && (
          <Box style={{ flex: 3 }}>
            <Paper withBorder shadow="sm" p="md" h="100%">
              <Flex justify="space-between" align="center" mb="md">
                <Title order={4}>
                  <Flex align="center" gap="sm">
                    <IconUser size={20} />
                    <span>Feedback for {selectedEmployee.employee.name}</span>
                  </Flex>
                </Title>
                <Badge color="blue" variant="light">
                  {feedbacks.length} items
                </Badge>
              </Flex>

              <LoadingOverlay visible={feedbackLoading} />
              
              {feedbacks.length > 0 ? (
                <ScrollArea h={600}>
                  <Stack gap="sm">
                    {feedbacks.map(fb => (
                      <Paper key={fb.id} p="md" withBorder shadow="xs">
                        <Flex justify="space-between" align="flex-start" mb="xs">
                          <Group gap="xs">
                            <SentimentBadge sentiment={fb.sentiment} />
                            <Text size="sm" c="dimmed">
                              {new Date(fb.createdAt).toLocaleDateString()}
                            </Text>
                          </Group>
                          <Group gap={4}>
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              color="blue"
                              onClick={() => handleEditFeedback(fb)}
                              title="Edit feedback"
                            >
                              <IconEdit size={14} />
                            </ActionIcon>
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              color="red"
                              onClick={() => handleDeleteFeedback(fb.id)}
                              title="Delete feedback"
                            >
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Group>
                        </Flex>
                        
                        <Box mb="sm">
                          <Text size="sm" fw={600} c="blue">Strengths</Text>
                          <Text size="sm">{fb.strengths}</Text>
                        </Box>
                        
                        <Box mb="sm">
                          <Text size="sm" fw={600} c="orange">Areas to Improve</Text>
                          <Text size="sm">{fb.areasToImprove}</Text>
                        </Box>
                        
                        <Divider my="xs" />
                        
                        <Text size="sm">
                          <Text span fw={600}>Status:</Text> {fb.acknowledged ? (
                            <Badge color="green" variant="light" ml="sm">Acknowledged</Badge>
                          ) : (
                            <Badge color="gray" variant="light" ml="sm">Pending</Badge>
                          )}
                        </Text>
                      </Paper>
                    ))}
                  </Stack>
                </ScrollArea>
              ) : (
                <Box ta="center" p="xl">
                  <Text c="dimmed">No feedback yet for this employee</Text>
                  <Button 
                    mt="md" 
                    variant="outline"
                    leftSection={<IconPlus size={14} />}
                    onClick={() => handleOpenFeedbackModal(selectedEmployee)}
                  >
                    Add First Feedback
                  </Button>
                </Box>
              )}
            </Paper>
          </Box>
        )}
      </Flex>
    </Box>
  );
}