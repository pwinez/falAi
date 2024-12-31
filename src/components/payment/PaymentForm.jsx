import React, { useState } from 'react';
import { usePayment } from '../../contexts/PaymentContext';
import { useNavigate } from 'react-router-dom';

const SUBSCRIPTION_PLANS = {
  premium: {
    name: 'Premium',
    price: 99.99,
    features: [
      'Sınırsız deneme',
      'HD kalitede görüntüler',
      'Öncelikli destek'
    ]
  },
  pro: {
    name: 'Pro',
    price: 199.99,
    features: [
      'Premium özelliklerin tümü',
      '4K kalitede görüntüler',
      '7/24 özel destek',
      'API erişimi'
    ]
  }
};

const PaymentForm = () => {
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { initiatePayment } = usePayment();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await initiatePayment(
        {}, // Test modunda kart bilgilerine gerek yok
        selectedPlan,
        SUBSCRIPTION_PLANS[selectedPlan].price
      );

      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Ödeme işlemi başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Abonelik Planı Seçin
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            (Test Modu: Gerçek ödeme işlemi yapılmayacak)
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
            <div
              key={key}
              className={`border rounded-lg p-6 cursor-pointer ${
                selectedPlan === key
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200'
              }`}
              onClick={() => setSelectedPlan(key)}
            >
              <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                ₺{plan.price.toFixed(2)}/ay
              </p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className="h-5 w-5 text-indigo-500"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="ml-2 text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-white p-8 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Test modu aktif: Gerçek ödeme alınmayacak
                  </p>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'İşleniyor...' : 'Test Ödemesi Yap'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm; 