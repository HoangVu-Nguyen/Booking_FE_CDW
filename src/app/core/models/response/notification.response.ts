export interface Notification {
    id: number;
    type: 'SUCCESS' | 'WARNING' | 'INFO' | 'PROMO' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'BOOKING_REQUEST';
    title: string;
    message: string;
    isRead: boolean;
    timeAgo: string;
    metadata: any;
}