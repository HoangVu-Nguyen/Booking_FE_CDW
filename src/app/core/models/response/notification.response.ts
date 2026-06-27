export interface Notification {
    id: number;
    type: 'SUCCESS' | 'WARNING' | 'INFO' | 'PROMO' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'BOOKING_REQUEST' | 'SYSTEM';
    title: string;
    message: string;
    isRead: boolean;
    timeAgo: string;
    metadata: any;
}