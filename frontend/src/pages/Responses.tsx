import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Button,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { formsApi, responsesApi } from '../services/api.service';
import { Form, FormResponse } from '../types/form.types';

const Responses: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);

  useEffect(() => {
    if (id) {
      loadFormAndResponses(id);
    }
  }, [id]);

  const loadFormAndResponses = async (formId: string) => {
    try {
      const [formResponse, responsesResponse] = await Promise.all([
        formsApi.getForm(formId),
        responsesApi.getResponsesByFormId(formId),
      ]);
      setForm(formResponse.data);
      setResponses(responsesResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const getAnswerValue = (response: FormResponse, questionId: string) => {
    const answer = response.answers.find((a) => a.questionId === questionId);
    if (!answer) return '-';
    if (Array.isArray(answer.value)) {
      return answer.value.join(', ');
    }
    return answer.value?.toString() || '-';
  };

  if (!form) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/')}>
          Back
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Responses for: {form.title}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Total Responses: {responses.length}
        </Typography>
      </Paper>

      {responses.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Submitted At</TableCell>
                {form.questions.map((question) => (
                  <TableCell key={question.id}>{question.title}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {responses.map((response) => (
                <TableRow key={response.id}>
                  <TableCell>
                    {response.submittedAt
                      ? new Date(response.submittedAt).toLocaleString()
                      : '-'}
                  </TableCell>
                  {form.questions.map((question) => (
                    <TableCell key={question.id}>
                      {getAnswerValue(response, question.id!)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No responses yet
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default Responses;
