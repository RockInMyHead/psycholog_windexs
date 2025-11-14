// Yookassa Payment Integration Service
// Test credentials for development

interface YookassaConfig {
  shopId: string;
  secretKey: string;
  returnUrl: string;
  testMode: boolean;
}

const YOOKASSA_CONFIG: YookassaConfig = {
  shopId: '123456', // Test shop ID
  secretKey: 'test_secret_key', // Test secret key
  returnUrl: `${window.location.origin}/subscription?payment=success`,
  testMode: true,
};

export interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  userId: string;
  plan: 'premium';
}

export interface YookassaPaymentResponse {
  id: string;
  status: 'pending' | 'succeeded' | 'canceled';
  confirmation: {
    type: 'redirect';
    confirmation_url: string;
  };
}

class PaymentService {
  private config: YookassaConfig;

  constructor() {
    this.config = YOOKASSA_CONFIG;
  }

  async createPayment(paymentData: PaymentData): Promise<YookassaPaymentResponse> {
    try {
      // In a real implementation, this would make an API call to Yookassa
      // For demo purposes, we'll simulate a successful payment creation

      const paymentId = `payment_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      // Simulate API response
      const response: YookassaPaymentResponse = {
        id: paymentId,
        status: 'pending',
        confirmation: {
          type: 'redirect',
          confirmation_url: `${this.config.returnUrl}&payment_id=${paymentId}&user_id=${paymentData.userId}`,
        },
      };

      console.log('Yookassa payment created (simulated):', response);

      return response;
    } catch (error) {
      console.error('Payment creation error:', error);
      throw new Error('Не удалось создать платеж');
    }
  }

  async processPaymentSuccess(paymentId: string, userId: string): Promise<boolean> {
    try {
      // In a real implementation, you would verify the payment with Yookassa API
      // For demo purposes, we'll simulate successful payment processing

      console.log('Processing payment success:', { paymentId, userId });

      // Here you would typically:
      // 1. Verify payment status with Yookassa
      // 2. Create subscription in database
      // 3. Send confirmation email

      // For demo, we'll just return success
      return true;
    } catch (error) {
      console.error('Payment processing error:', error);
      return false;
    }
  }

  getPaymentUrl(paymentId: string): string {
    // In test mode, redirect to success page immediately
    return `${this.config.returnUrl}&payment_id=${paymentId}&status=success`;
  }

  // Test payment methods for demo
  getTestPaymentMethods() {
    return [
      {
        name: 'Тестовая карта',
        description: 'Номер: 5555 5555 5555 4444, CVC: 123, Срок: 12/30',
        action: 'test_card',
      },
      {
        name: 'Мгновенная оплата',
        description: 'Симуляция успешного платежа',
        action: 'instant_success',
      },
      {
        name: 'Тест отмены',
        description: 'Симуляция отмены платежа',
        action: 'test_cancel',
      },
    ];
  }

  async simulatePayment(action: string, userId: string): Promise<{ success: boolean; paymentId?: string }> {
    const paymentId = `payment_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    switch (action) {
      case 'instant_success':
        console.log('Simulating instant payment success');
        return { success: true, paymentId };

      case 'test_cancel':
        console.log('Simulating payment cancellation');
        return { success: false };

      case 'test_card':
      default:
        console.log('Simulating bank card payment');
        return { success: true, paymentId };
    }
  }
}

export const paymentService = new PaymentService();
