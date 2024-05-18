/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.json());

// Initialize Firebase Admin
const serviceAccount = require('./firebase-adminsdk.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Twilio configuration
const accountSid = 'YOUR_TWILIO_ACCOUNT_SID';
const authToken = 'YOUR_TWILIO_AUTH_TOKEN';
const client = new twilio(accountSid, authToken);
const twilioNumber = 'YOUR_TWILIO_PHONE_NUMBER';
const recipientNumber = 'FORKLIFT_DRIVER_PHONE_NUMBER';

app.post('/notify', async (req, res) => {
  const { message } = req.body;

  try {
    // Send notification via Firebase Cloud Messaging
    const payload = {
      notification: {
        title: 'Forklift Assistance Needed',
        body: message,
      },
    };
    const response = await admin.messaging().sendToTopic('forklift-drivers', payload);
    console.log('Successfully sent message:', response);

    // Send SMS via Twilio
    const smsResponse = await client.messages.create({
      body: message,
      from: twilioNumber,
      to: recipientNumber,
    });
    console.log('SMS sent:', smsResponse.sid);

    res.status(200).send({ success: true });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
