import axios from 'axios';
import { Form, FormResponse } from '../types/form.types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const formsApi = {
  getAllForms: () => api.get<Form[]>('/forms'),
  getForm: (id: string) => api.get<Form>(`/forms/${id}`),
  createForm: (form: Form) => api.post<Form>('/forms', form),
  updateForm: (id: string, form: Form) => api.put(`/forms/${id}`, form),
  deleteForm: (id: string) => api.delete(`/forms/${id}`),
};

export const responsesApi = {
  getAllResponses: () => api.get<FormResponse[]>('/responses'),
  getResponse: (id: string) => api.get<FormResponse>(`/responses/${id}`),
  getResponsesByFormId: (formId: string) => api.get<FormResponse[]>(`/responses/form/${formId}`),
  createResponse: (response: FormResponse) => api.post<FormResponse>('/responses', response),
  deleteResponse: (id: string) => api.delete(`/responses/${id}`),
};
