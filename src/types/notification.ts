export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type NotificationCategory = 
  | 'appointment'
  | 'patient'
  | 'doctor'
  | 'service'
  | 'financial'
  | 'user'
  | 'system';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  read: boolean;
  createdAt: Date;
  link?: string;
}

export interface NotificationSettings {
  appointmentReminders: boolean;
  overduePayments: boolean;
  newAppointments: boolean;
  systemAlerts: boolean;
  emailNotifications: boolean;
  soundEnabled: boolean;
}
