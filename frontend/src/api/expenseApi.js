import axiosInstance from './axiosInstance';

export const getExpenses = async (params = {}) => {
  const response = await axiosInstance.get('/expenses', { params });
  return response.data;
};

export const getExpenseById = async (id) => {
  const response = await axiosInstance.get(`/expenses/${id}`);
  return response.data;
};

export const createExpense = async (expenseData) => {
  const response = await axiosInstance.post('/expenses', expenseData);
  return response.data;
};

export const updateExpense = async (id, expenseData) => {
  const response = await axiosInstance.put(`/expenses/${id}`, expenseData);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await axiosInstance.delete(`/expenses/${id}`);
  return response.data;
};

export const getSummary = async () => {
  const response = await axiosInstance.get('/expenses/summary');
  return response.data;
};

export const getMonthlySummary = async () => {
  const response = await axiosInstance.get('/expenses/summary/monthly');
  return response.data;
};