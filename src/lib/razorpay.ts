
export const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

interface RazorpayOptions {
  amount: number;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  handler: (response: any) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export const openRazorpay = async (options: RazorpayOptions) => {
  const res = await loadRazorpay();

  if (!res) {
    alert('Razorpay SDK failed to load. Are you online?');
    return;
  }

  const rzpOptions = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder', // Use provided key or placeholder for dev
    amount: options.amount,
    currency: 'INR',
    name: options.name,
    description: options.description,
    image: '/favicon.ico',
    handler: options.handler,
    prefill: options.prefill,
    theme: {
      color: '#004D40', // Brand Green
    },
    modal: options.modal
  };

  const paymentObject = new (window as any).Razorpay(rzpOptions);
  paymentObject.open();
};
