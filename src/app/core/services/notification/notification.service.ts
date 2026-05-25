import { Injectable, signal } from "@angular/core";
import { ApiService } from "../api/api.service";
import { ApiResponse } from "../../models/response/api.response";
import { Observable, Subject, tap } from 'rxjs';
import { PageResponse } from "../../models/response/page.response";
import { Notification } from "../../models/response/notification.response";
import { SocketPayload } from "../../enum/socket-payload";
import { WebsocketService } from "../realtime/websocket.service";

@Injectable({ providedIn: 'root' })
export class NotificationService {
    // 1. Signal để UI Header cập nhật số unread ngay lập tức
    unreadCount = signal<number>(0);

    // 2. Kênh phát tin: Dùng Subject để Component lắng nghe thông báo mới từ Socket
    private newNotificationSource = new Subject<Notification>();
    newNotification$ = this.newNotificationSource.asObservable();

    constructor(private apiService: ApiService, private websocket: WebsocketService) {
        this.fetchUnreadCount();
        this.websocket.globalNotification$.subscribe(payload => {

            this.dispatch(payload);
        });
    }


    // --- CÁC HÀM API ---
    getNotifications(filter: string = 'ALL', page: number = 0): Observable<ApiResponse<PageResponse<Notification>>> {
        return this.apiService.get<ApiResponse<PageResponse<Notification>>>(`/api/v1/notifications?filter=${filter}&page=${page}`);
    }

    fetchUnreadCount(): void {
        this.apiService.get<ApiResponse<number>>(`/api/v1/notifications/unread-count`)
            .subscribe(response => this.unreadCount.set(response.data));
    }

    markAsRead(id: number): Observable<ApiResponse<void>> {
        return this.apiService.patch<ApiResponse<void>>(`/api/v1/notifications/${id}/read`, {}).pipe(
            tap(() => this.fetchUnreadCount())
        );
    }

    markAllAsRead(): Observable<ApiResponse<void>> {
        return this.apiService.patch<ApiResponse<void>>(`/api/v1/notifications/read-all`, {}).pipe(
            tap(() => this.fetchUnreadCount())
        );
    }


    private dispatch(payload: SocketPayload<any>) {
        console.log('Nhận payload từ WebSocket:', payload);
        // Dùng switch-case hoặc map để xử lý từng loại
        switch (payload.data.type) {
            case 'WALLET_UPDATE':
                // this.handleWallet(payload.data);
                break;
            case 'BOOKING_CONFIRMED':
                this.handleBooking(payload.data);
                break;
            case 'NEW_MESSAGE':
                // this.handleChat(payload.data);
                break;
            default:
                console.warn('Loại thông báo lạ:', payload.type);
        }

        // Cuối cùng là cập nhật badge và thông báo chung
        this.unreadCount.update(c => c + 1);
    }
    private handleBooking(payload: any) {

        // 2. Push vào Subject để component cập nhật UI
        this.newNotificationSource.next(payload);

        // 3. Có thể kích hoạt Toast ở đây luôn nếu muốn
        // this.toastService.show(...);

    }
}