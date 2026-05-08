# Razorpay Payment Gateway Integration Guide

## Overview
This project has been configured to use **Razorpay** as the primary payment gateway for processing online payments. Razorpay supports:
- ✅ Credit/Debit Cards
- ✅ Net Banking
- ✅ UPI (Unified Payments Interface)
- ✅ Wallets
- ✅ EMI Options

## Prerequisites
- Razorpay Account (Free to create at https://razorpay.com)
- Node.js running backend server
- React frontend setup

---

## Step 1: Create Razorpay Account

### 1.1 Sign Up
1. Visit [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Click "Sign Up" and fill in the form
3. Verify your email
4. Complete your account verification

### 1.2 Verify Your Business
- Provide business details
- Upload identity proof
- Wait for approval (usually within 1-2 hours)

---

## Step 2: Get API Credentials

### 2.1 Access API Keys
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Settings** → **API Keys**
3. You'll see two tabs: **Test Mode** and **Live Mode**

### 2.2 For Testing (Development)
- Use **Test Mode** credentials
- Copy the **Key ID** and **Key Secret**
- Test cards are available for testing

### 2.3 For Production
- Switch to **Live Mode**
- Copy the **Key ID** and **Key Secret**
- These will charge real money

---

## Step 3: Configure Environment Variables

### 3.1 Server Configuration

Update **`server/.env`** with your Razorpay credentials:

```env
# Razorpay Credentials
RAZORPAY_KEY_ID=rzp_test_1234567890abcd      # Replace with your Key ID
RAZORPAY_KEY_SECRET=rzp_test_secret_abcd1234 # Replace with your Key Secret

# Other existing credentials
MONGODB_URI=mongodb://localhost:27017/palmberry
JWT_SECRET=palmberry_dev_secret_key_12345678901234567890
PORT=5000
NODE_ENV=development
```

### 3.2 Client Configuration

Update **`client/.env`** with your Razorpay public key:

```env
REACT_APP_RAZORPAY_KEY_ID=rzp_test_1234567890abcd
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WHATSAPP_NUMBER=919876543210
REACT_APP_BRAND_NAME=PalmBerry
```

---

## Step 4: How It Works

### Payment Flow

```
User → Checkout Page → Create Order (Backend)
                          ↓
                    Razorpay Creates Order
                          ↓
              Razorpay Checkout Modal Opens
                          ↓
            User Completes Payment (UPI/Card/etc)
                          ↓
            Razorpay Verifies Signature
                          ↓
          Backend Updates Order Status to "Completed"
                          ↓
              Order Success Page Displayed
```

### API Endpoints

#### 1. Create Razorpay Order
**POST** `/api/payment/razorpay/create-order`

Request Body:
```javascript
{
  "amount": 1500,           // Amount in INR
  "currency": "INR",        // Currency code
  "orderId": "order_id_123", // Your internal order ID
  "receipt": "receipt_123"   // Receipt number (optional)
}
```

Response:
```javascript
{
  "success": true,
  "orderId": "order_1234567890abcd",    // Razorpay Order ID
  "amount": 150000,                     // Amount in paise
  "currency": "INR",
  "key_id": "rzp_test_1234567890abcd"  // Your Key ID
}
```

#### 2. Verify Payment
**POST** `/api/payment/razorpay/verify`

Request Body:
```javascript
{
  "razorpay_order_id": "order_1234567890abcd",
  "razorpay_payment_id": "pay_1234567890abcd",
  "razorpay_signature": "signature_hash_here",
  "orderId": "order_id_123"  // Your internal order ID
}
```

Response:
```javascript
{
  "success": true,
  "message": "Payment verified successfully",
  "order": { /* Updated order object */ }
}
```

#### 3. Get Payment Details
**GET** `/api/payment/razorpay/:paymentId`

Returns detailed payment information from Razorpay.

---

## Step 5: Test the Integration

### 5.1 Test Mode Credentials (For Development)

**Test Cards for Development:**

| Card Type | Card Number | Expiry | CVV |
|-----------|-------------|--------|-----|
| Visa | 4111 1111 1111 1111 | Any future date | Any 3 digits |
| Mastercard | 5555 5555 5555 4444 | Any future date | Any 3 digits |
| Amex | 3782 822463 10005 | Any future date | Any 4 digits |

**Test UPI:**
- Any UPI ID ending with @okhdfcbank will work
- Example: `success@okhdfcbank`

### 5.2 Test Payment Flow

1. Start your backend server:
```bash
cd server
npm install
npm run dev
```

2. Start your frontend:
```bash
cd client
npm install
npm start
```

3. Add a product to cart and go to checkout
4. Fill in the form and click "Pay ₹X.XX"
5. Use test credentials from the table above
6. Complete the payment
7. Check your order status

---

## Step 6: Production Deployment

### 6.1 Switch to Live Credentials

1. Log in to Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Switch to **Live Mode**
4. Copy your **Live Key ID** and **Key Secret**

### 6.2 Update Environment Variables

Update both **server/.env** and **client/.env**:

```env
# Production Credentials
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX
RAZORPAY_KEY_SECRET=rzp_live_secret_XXXXXXXXXXXX
NODE_ENV=production
```

### 6.3 Important Security Notes
- ⚠️ **Never** commit real credentials to git
- ✅ Use `.env` files (already in .gitignore)
- ✅ Use environment variables on hosting platform
- ✅ Rotate keys regularly
- ✅ Monitor payment logs

---

## Step 7: Webhook Setup (Optional)

For real-time payment notifications:

1. Go to **Settings** → **Webhooks** in Razorpay Dashboard
2. Click "Add New Webhook"
3. Enter your webhook URL: `https://yourdomain.com/api/payment/webhook`
4. Select events:
   - `payment.authorized`
   - `payment.failed`
   - `payment.captured`
5. Copy the Webhook Secret
6. Add to `server/.env`:
```env
RAZORPAY_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXX
```

---

## Troubleshooting

### Payment Modal Not Opening
- Check browser console for errors
- Verify `REACT_APP_RAZORPAY_KEY_ID` is set in `.env`
- Ensure Razorpay script is loaded: Check Network tab in DevTools

### Signature Verification Failed
- Verify `RAZORPAY_KEY_SECRET` is correct
- Check that order amount matches (in paise for backend)
- Ensure timestamps are synchronized

### Payment Completed But Order Not Updated
- Check backend logs for errors
- Verify MongoDB connection
- Ensure Order model migration (added razorpay fields)

### Test Mode Errors
- Confirm you're using Test Mode credentials
- Use valid test cards from the table above
- Check that Key ID starts with `rzp_test_`

---

## Useful Links

- 📚 [Razorpay Documentation](https://razorpay.com/docs/)
- 🔧 [Razorpay API Reference](https://razorpay.com/docs/api/)
- 🧪 [Test Data & Cards](https://razorpay.com/docs/payments/payments/test-mode/)
- 📞 [Support & Help](https://razorpay.com/support/)
- 💬 [Razorpay Community](https://github.com/razorpay)

---

## Support & Help

### Razorpay Support
- **Email**: support@razorpay.com
- **Chat**: Available in Dashboard
- **Phone**: Check your account for phone number

### Common Issues Checklist
- ✅ API credentials are correct
- ✅ Environment variables are set
- ✅ Backend server is running
- ✅ Frontend is pointing to correct backend URL
- ✅ CORS is enabled on backend
- ✅ MongoDB is connected

---

## Code Examples

### Creating a Payment (Frontend)

```javascript
// In Checkout.js
const handleCheckout = async (e) => {
  // Create order first
  const orderResponse = await axios.post('/api/orders', orderData);
  
  // Create Razorpay order
  const razorpayResponse = await axios.post(
    '/api/payment/razorpay/create-order', 
    {
      amount: totalAmount,
      orderId: orderResponse.data._id,
      currency: 'INR'
    }
  );

  // Open Razorpay modal
  const options = {
    key: process.env.REACT_APP_RAZORPAY_KEY_ID,
    amount: razorpayResponse.data.amount,
    currency: razorpayResponse.data.currency,
    order_id: razorpayResponse.data.orderId,
    handler: async (response) => {
      // Verify payment
      await axios.post('/api/payment/razorpay/verify', {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        orderId: orderId
      });
    }
  };
  
  const razorpay = new window.Razorpay(options);
  razorpay.open();
};
```

---

## Security Best Practices

1. **Never expose Key Secret** - Only use in backend
2. **Always verify signatures** - Prevent tampering
3. **Use HTTPS** - Encrypt all data in transit
4. **Validate amounts** - Check on backend before processing
5. **Log transactions** - Keep audit trail
6. **Monitor for fraud** - Use Razorpay's fraud detection

---

## Next Steps

1. ✅ Create Razorpay account
2. ✅ Get API credentials
3. ✅ Update environment variables
4. ✅ Test with test credentials
5. ✅ Deploy to production with live credentials
6. ✅ Monitor payment logs

---

**Last Updated:** April 29, 2026
**Status:** Production Ready ✅
