import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { formsApi, responsesApi } from '../services/api.service';
import { Form, FormResponse, QuestionType } from '../types/form.types';

const FormPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    if (id) {
      loadForm(id);
    }
  }, [id]);

  const loadForm = async (formId: string) => {
    try {
      const response = await formsApi.getForm(formId);
      setForm(response.data);
    } catch (error) {
      console.error('Error loading form:', error);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    const currentAnswers = answers[questionId] || [];
    if (checked) {
      setAnswers({ ...answers, [questionId]: [...currentAnswers, option] });
    } else {
      setAnswers({
        ...answers,
        [questionId]: currentAnswers.filter((a: string) => a !== option),
      });
    }
  };

  const handleSubmit = async () => {
    if (!form || !id) return;

    const formResponse: FormResponse = {
      formId: id,
      answers: Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
      })),
    };

    try {
      await responsesApi.createResponse(formResponse);
      alert('Form submitted successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form');
    }
  };

  if (!form) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/')}>
          Back
        </Button>
      </Box>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {form.title}
        </Typography>
        {form.description && (
          <Typography variant="body1" color="textSecondary" paragraph>
            {form.description}
          </Typography>
        )}
      </Paper>

      {form.questions.map((question, index) => (
        <Paper key={index} sx={{ p: 3, mb: 3 }}>
          <FormControl fullWidth>
            <FormLabel>
              <Typography variant="h6" component="div" gutterBottom>
                {question.title}
                {question.required && <span style={{ color: 'red' }}> *</span>}
              </Typography>
              {question.description && (
                <Typography variant="body2" color="textSecondary" paragraph>
                  {question.description}
                </Typography>
              )}
            </FormLabel>

            {question.type === QuestionType.ShortAnswer && (
              <TextField
                fullWidth
                variant="outlined"
                value={answers[question.id!] || ''}
                onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
                required={question.required}
              />
            )}

            {question.type === QuestionType.Paragraph && (
              <TextField
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                value={answers[question.id!] || ''}
                onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
                required={question.required}
              />
            )}

            {question.type === QuestionType.MultipleChoice && (
              <RadioGroup
                value={answers[question.id!] || ''}
                onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
              >
                {question.options?.map((option, optionIndex) => (
                  <FormControlLabel
                    key={optionIndex}
                    value={option}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            )}

            {question.type === QuestionType.Checkboxes && (
              <Box>
                {question.options?.map((option, optionIndex) => (
                  <FormControlLabel
                    key={optionIndex}
                    control={
                      <Checkbox
                        checked={(answers[question.id!] || []).includes(option)}
                        onChange={(e) =>
                          handleCheckboxChange(question.id!, option, e.target.checked)
                        }
                      />
                    }
                    label={option}
                  />
                ))}
              </Box>
            )}

            {question.type === QuestionType.Dropdown && (
              <Select
                fullWidth
                value={answers[question.id!] || ''}
                onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
                required={question.required}
              >
                {question.options?.map((option, optionIndex) => (
                  <MenuItem key={optionIndex} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            )}

            {question.type === QuestionType.Date && (
              <TextField
                fullWidth
                type="date"
                variant="outlined"
                value={answers[question.id!] || ''}
                onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
                required={question.required}
                InputLabelProps={{ shrink: true }}
              />
            )}

            {question.type === QuestionType.Time && (
              <TextField
                fullWidth
                type="time"
                variant="outlined"
                value={answers[question.id!] || ''}
                onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
                required={question.required}
                InputLabelProps={{ shrink: true }}
              />
            )}
          </FormControl>
        </Paper>
      ))}

      <Box display="flex" justifyContent="flex-end" mt={3}>
        <Button variant="contained" color="primary" size="large" onClick={handleSubmit}>
          Submit
        </Button>
      </Box>
    </Container>
  );
};

export default FormPreview;
