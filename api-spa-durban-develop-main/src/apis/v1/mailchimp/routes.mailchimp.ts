// routes/mailchimpWebhook.js
import express from 'express';
const router = express.Router();

router.post('/webhook', express.json({ type: '*/*' }), (req, res) => {
  const event = req.body;

  // console.log('📬 Mailchimp Webhook Received:', event);

  // Example: handle subscribe event
  if (event.type === 'subscribe') {
    const { email } = event.data;
    // console.log(`User subscribed: ${email}`);
    // Save or update in DB
  }

  res.status(200).send('Webhook received');
});

export default router;
