import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API_URL = 'http://localhost:3001/api';

const PaymentContext = createContext(null);

export const PaymentProvider = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initiatePayment = async (cardDetails, plan, price) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/payments/initiate`,
        {
          plan,
          price
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Ödeme işlemi başarısız');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/payments/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Ödeme geçmişi alınamadı');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/subscription/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Abonelik durumu alınamadı');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    loading,
    error,
    initiatePayment,
    getPaymentHistory,
    getSubscriptionStatus
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}; 