export interface NotificationBody {
  title: string;
  body: string;
}

// export interface SendMessageDto {
//   to: string | null; // null for broadcast
//   notification: NotificationBody;
// }

export interface SendMessageDto {
  to?: string; 
  notification?: {
    title: string;
    body: string;
  };
}
