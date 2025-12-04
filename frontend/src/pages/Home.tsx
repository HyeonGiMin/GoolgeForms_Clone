import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Box,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formsApi } from '../services/api.service';
import { Form } from '../types/form.types';

const Home: React.FC = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const response = await formsApi.getAllForms();
      setForms(response.data);
    } catch (error) {
      console.error('Error loading forms:', error);
    }
  };

  const handleCreateForm = () => {
    navigate('/form/new');
  };

  const handleEditForm = (id: string) => {
    navigate(`/form/edit/${id}`);
  };

  const handleDeleteForm = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      try {
        await formsApi.deleteForm(id);
        loadForms();
      } catch (error) {
        console.error('Error deleting form:', error);
      }
    }
  };

  const handleViewResponses = (id: string) => {
    navigate(`/form/${id}/responses`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h3" component="h1">
          Google Forms Clone
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateForm}
        >
          Create Form
        </Button>
      </Box>

      <Grid container spacing={3}>
        {forms.map((form) => (
          <Grid item xs={12} sm={6} md={4} key={form.id}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  {form.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {form.description || 'No description'}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                  Questions: {form.questions.length}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleEditForm(form.id!)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  onClick={() => handleViewResponses(form.id!)}
                >
                  Responses
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteForm(form.id!)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {forms.length === 0 && (
        <Box textAlign="center" mt={8}>
          <Typography variant="h6" color="textSecondary">
            No forms yet. Create your first form!
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Home;
