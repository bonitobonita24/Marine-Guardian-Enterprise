import { type MobilePlatform, type NotificationChannel } from "../enums.js";

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  channel: NotificationChannel;
  isRead: boolean;
  sentAt: Date | null;
  createdAt: Date;
}

export interface PushToken {
  id: string;
  userId: string;
  token: string;
  platform: MobilePlatform;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  platform: MobilePlatform;
  expiresAt: Date;
  createdAt: Date;
}
