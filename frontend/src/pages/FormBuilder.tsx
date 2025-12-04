import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { formsApi } from '../services/api.service';
import { Form, Question, QuestionType } from '../types/form.types';

const FormBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>({
    title: 'Untitled Form',
    description: '',
    questions: [],
    isAcceptingResponses: true,
  });

  useEffect(() => {
    if (id && id !== 'new') {
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

  const handleSaveForm = async () => {
    try {
      if (id && id !== 'new') {
        await formsApi.updateForm(id, form);
      } else {
        await formsApi.createForm(form);
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving form:', error);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      type: QuestionType.ShortAnswer,
      title: 'New Question',
      required: false,
    };
    setForm({ ...form, questions: [...form.questions, newQuestion] });
  };

  const handleDeleteQuestion = (index: number) => {
    const newQuestions = form.questions.filter((_, i) => i !== index);
    setForm({ ...form, questions: newQuestions });
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...form.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setForm({ ...form, questions: newQuestions });
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...form.questions];
    if (newQuestions[questionIndex].options) {
      newQuestions[questionIndex].options![optionIndex] = value;
      setForm({ ...form, questions: newQuestions });
    }
  };

  const handleAddOption = (questionIndex: number) => {
    const newQuestions = [...form.questions];
    if (!newQuestions[questionIndex].options) {
      newQuestions[questionIndex].options = [];
    }
    newQuestions[questionIndex].options!.push('Option');
    setForm({ ...form, questions: newQuestions });
  };

  const handleDeleteOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...form.questions];
    newQuestions[questionIndex].options = newQuestions[questionIndex].options!.filter(
      (_, i) => i !== optionIndex
    );
    setForm({ ...form, questions: newQuestions });
  };

  const questionTypeNeedsOptions = (type: QuestionType) => {
    return [QuestionType.MultipleChoice, QuestionType.Checkboxes, QuestionType.Dropdown].includes(
      type
    );
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/')}>
          Back
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          label="Form Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          variant="outlined"
          margin="normal"
        />
        <TextField
          fullWidth
          label="Form Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          variant="outlined"
          margin="normal"
          multiline
          rows={2}
        />
      </Paper>

      {form.questions.map((question, index) => (
        <Paper key={index} sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box flex={1}>
              <TextField
                fullWidth
                label="Question Title"
                value={question.title}
                onChange={(e) => handleQuestionChange(index, 'title', e.target.value)}
                variant="outlined"
                margin="normal"
              />
              <TextField
                fullWidth
                label="Question Description"
                value={question.description || ''}
                onChange={(e) => handleQuestionChange(index, 'description', e.target.value)}
                variant="outlined"
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Question Type</InputLabel>
                <Select
                  value={question.type}
                  onChange={(e) =>
                    handleQuestionChange(index, 'type', Number(e.target.value))
                  }
                  label="Question Type"
                >
                  <MenuItem value={QuestionType.ShortAnswer}>Short Answer</MenuItem>
                  <MenuItem value={QuestionType.Paragraph}>Paragraph</MenuItem>
                  <MenuItem value={QuestionType.MultipleChoice}>Multiple Choice</MenuItem>
                  <MenuItem value={QuestionType.Checkboxes}>Checkboxes</MenuItem>
                  <MenuItem value={QuestionType.Dropdown}>Dropdown</MenuItem>
                  <MenuItem value={QuestionType.LinearScale}>Linear Scale</MenuItem>
                  <MenuItem value={QuestionType.Date}>Date</MenuItem>
                  <MenuItem value={QuestionType.Time}>Time</MenuItem>
                </Select>
              </FormControl>

              {questionTypeNeedsOptions(question.type) && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Options:
                  </Typography>
                  {question.options?.map((option, optionIndex) => (
                    <Box key={optionIndex} display="flex" alignItems="center" mb={1}>
                      <TextField
                        fullWidth
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, optionIndex, e.target.value)
                        }
                        variant="outlined"
                        size="small"
                      />
                      <IconButton
                        onClick={() => handleDeleteOption(index, optionIndex)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => handleAddOption(index)}
                  >
                    Add Option
                  </Button>
                </Box>
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    checked={question.required}
                    onChange={(e) => handleQuestionChange(index, 'required', e.target.checked)}
                  />
                }
                label="Required"
              />
            </Box>
            <IconButton onClick={() => handleDeleteQuestion(index)} color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Paper>
      ))}

      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddQuestion}>
          Add Question
        </Button>
        <Button variant="contained" color="primary" onClick={handleSaveForm}>
          Save Form
        </Button>
      </Box>
    </Container>
  );
};

export default FormBuilder;
