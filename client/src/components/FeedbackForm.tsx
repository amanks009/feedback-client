import { useEffect, useState } from "react";
import { Modal, TextInput, Textarea, Button, Select, Stack, Text } from "@mantine/core";
import api from "../utils/api";
import { Feedback } from "../types/feedback";

interface FeedbackFormProps {
  employeeId: number;
  employeeName: string;
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingFeedback?: Feedback | null;
}

export default function FeedbackForm({ 
  employeeId, 
  employeeName, 
  opened, 
  onClose, 
  onSuccess,
  editingFeedback 
}: FeedbackFormProps) {
  const [strengths, setStrengths] = useState("");
  const [areasToImprove, setAreasToImprove] = useState("");
  const [sentiment, setSentiment] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!editingFeedback;

  // Reset form when modal opens/closes or when switching between edit/create modes
  useEffect(() => {
    if (opened) {
      if (editingFeedback) {
        // Pre-populate form with existing feedback data
        setStrengths(editingFeedback.strengths);
        setAreasToImprove(editingFeedback.areasToImprove);
        setSentiment(editingFeedback.sentiment);
      } else {
        // Reset form for new feedback
        setStrengths("");
        setAreasToImprove("");
        setSentiment(null);
      }
      setError(null);
    }
  }, [opened, editingFeedback]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!strengths.trim() || !areasToImprove.trim() || !sentiment) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const feedbackData = {
        employee_id: employeeId, // Changed from employeeId to employee_id
        strengths: strengths.trim(),
        areasToImprove: areasToImprove.trim(),
        sentiment
      };

      if (isEditing) {
        // Update existing feedback
        await api.put(`/feedback/${editingFeedback.id}`, feedbackData);
      } else {
        // Create new feedback
        await api.post("/feedback", feedbackData);
      }

      onSuccess();
    } catch (err: any) {
      console.error("Error submitting feedback:", err);
      setError(
        err.response?.data?.message || 
        `Failed to ${isEditing ? 'update' : 'submit'} feedback`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={`${isEditing ? 'Edit' : 'Give'} Feedback - ${employeeName}`}
      size="md"
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {error && (
            <Text c="red" size="sm">
              {error}
            </Text>
          )}

          <Textarea
            label="Strengths"
            placeholder="What are this employee's key strengths?"
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            required
            minRows={3}
            maxRows={6}
            disabled={loading}
          />

          <Textarea
            label="Areas to Improve"
            placeholder="What areas could this employee work on?"
            value={areasToImprove}
            onChange={(e) => setAreasToImprove(e.target.value)}
            required
            minRows={3}
            maxRows={6}
            disabled={loading}
          />

          <Select
            label="Overall Sentiment"
            placeholder="Select overall sentiment"
            value={sentiment}
            onChange={setSentiment}
            data={[
              { value: 'POSITIVE', label: 'Positive' },
              { value: 'NEUTRAL', label: 'Neutral' },
              { value: 'NEGATIVE', label: 'Negative' }
            ]}
            required
            disabled={loading}
          />

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={loading}
            >
              {isEditing ? 'Update Feedback' : 'Submit Feedback'}
            </Button>
          </div>
        </Stack>
      </form>
    </Modal>
  );
}