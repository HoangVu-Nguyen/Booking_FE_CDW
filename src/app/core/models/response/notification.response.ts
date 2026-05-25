export interface Notification {
    id: number;
    type: 'SUCCESS' | 'WARNING' | 'INFO' | 'PROMO';
    title: string;
    message: string;
    isRead: boolean;
    timeAgo: string;
    metadata: any;
}