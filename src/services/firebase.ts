import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAExwYkCqLaQJ_1jhT6ILEqomK63aFSyA",
  authDomain: "inkoria-a4503.firebaseapp.com",
  projectId: "inkoria-a4503",
  storageBucket: "inkoria-a4503.firebasestorage.app",
  messagingSenderId: "822281297785",
  appId: "1:822281297785:web:a239382ef339733f96d9a8"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BKeT-z0GqC4ZtV8XpL2mQ7wR9yU1nJ3kF5hA7cD9fG1jK3lM5oP7qR9sT1uV3wX5yZ7'
      });
      console.log('Notification token:', token);
      return token;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export const showLocalNotification = (title: string, body: string, icon?: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: icon || '/logo.png' });
  }
};