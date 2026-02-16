import config from './index';

export interface Question {
  number: number;
  text: string;
}

export interface UserProfile {
  name: string;
  phoneNumber: string;
  email: string;
  preferredChannels: ('whatsapp' | 'sms' | 'email')[];
}

export const morningQuestions: Question[] = [
  {
    number: 1,
    text: "What's one thing you love about her today?",
  },
  {
    number: 2,
    text: 'What are you grateful for this morning?',
  },
  {
    number: 3,
    text: 'What do you want to encourage her about today?',
  },
];

export const myProfile: UserProfile = {
  name: 'Me',
  phoneNumber: process.env.MY_PHONE_NUMBER || '',
  email: process.env.EMAIL_FROM || '',
  preferredChannels: config.channels.my,
};

export const girlfriendProfile: UserProfile = {
  name: 'Girlfriend',
  phoneNumber: process.env.GIRLFRIEND_PHONE_NUMBER || '',
  email: process.env.GIRLFRIEND_EMAIL || '',
  preferredChannels: config.channels.girlfriend,
};
