import axiosInstance from './axiosInstance';

export const setBudget = async (budgetData) => {
  const response = await axiosInstance.post('/budget', budgetData);
  return response.data;
};

export const getBudgetStatus = async (month) => {
  const response = await axiosInstance.get(`/budget/status?month=${month}`);
  return response.data;
};