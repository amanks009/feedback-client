'use client';
import { useEffect, useState, useRef } from "react";
import api from "../utils/api";
import { Paper, Title, Button, Loader, Group, Text, Badge, Flex, Box } from "@mantine/core";
import { useAuth } from "../utils/auth";
import { usePDF } from 'react-to-pdf';
import { IconDownload, IconLogout, IconCheck } from "@tabler/icons-react";

export default function EmployeeDashboard() {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const { toPDF, targetRef } = usePDF({filename: 'feedback-report.pdf'});

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const res = await api.get("/employee-dashboard");
        setTimeline(res.data.timeline);
      } catch (error) {
        console.error('Error fetching timeline:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, []);

  const acknowledge = async (id: number) => {
    try {
      await api.post(`/acknowledge/${id}`);
      setTimeline(timeline =>
        timeline.map(fb =>
          fb.id === id ? { ...fb, acknowledged: true } : fb
        )
      );
    } catch (error) {
      console.error('Acknowledge error:', error);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Loader size="xl" />
      </Flex>
    );
  }

  return (
    <Box maw={800} mx="auto" p="md">
      <Group justify="space-between" mb="xl">
        <Title order={2} c="dimmed">Your Feedback History</Title>
        <Group>
          <Button 
            variant="light" 
            leftSection={<IconDownload size={16} />}
            onClick={() => toPDF()}
          >
            Export PDF
          </Button>
          {/* <Button 
            variant="outline" 
            leftSection={<IconLogout size={16} />}
            onClick={logout}
          >
            Logout
          </Button> */}
        </Group>
      </Group>
      
      <Box ref={targetRef}>
        {timeline.length === 0 ? (
          <Paper p="xl" withBorder shadow="xs">
            <Text c="dimmed" ta="center">No feedback received yet</Text>
          </Paper>
        ) : (
          timeline.map(fb => (
            <Paper key={fb.id} p="lg" mb="md" withBorder shadow="xs" radius="md">
              <Flex justify="space-between" align="center" mb="sm">
                <Badge 
                  color={
                    fb.sentiment === 'Positive' ? 'teal' : 
                    fb.sentiment === 'Negative' ? 'red' : 'blue'
                  }
                  variant="light"
                >
                  {fb.sentiment}
                </Badge>
                <Text size="sm" c="dimmed">
                  {new Date(fb.createdAt).toLocaleString()}
                </Text>
              </Flex>

              <Box mb="sm">
                <Text fw={500} size="sm" c="dimmed">Strengths</Text>
                <Text>{fb.strengths}</Text>
              </Box>

              <Box mb="sm">
                <Text fw={500} size="sm" c="dimmed">Areas to Improve</Text>
                <Text>{fb.areasToImprove}</Text>
              </Box>

              <Flex justify="space-between" align="center" mt="md">
                <Text fw={500} size="sm">
                  Status: {fb.acknowledged ? (
                    <Badge color="green" variant="light" ml="sm">
                      <Flex align="center" gap={4}>
                        <IconCheck size={14} /> Acknowledged
                      </Flex>
                    </Badge>
                  ) : (
                    <Badge color="orange" variant="light" ml="sm">
                      Pending
                    </Badge>
                  )}
                </Text>
                {!fb.acknowledged && (
                  <Button 
                    size="xs" 
                    variant="light"
                    onClick={() => acknowledge(fb.id)}
                  >
                    Mark as Reviewed
                  </Button>
                )}
              </Flex>
            </Paper>
          ))
        )}
      </Box>
    </Box>
  );
}