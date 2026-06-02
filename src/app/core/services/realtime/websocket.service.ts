import { Injectable, OnDestroy } from '@angular/core';
import { Client, Message, StompSubscription } from '@stomp/stompjs';
import { OAuthService } from 'angular-oauth2-oidc';
import { Observable, Subject } from 'rxjs';
import { SocketPayload } from '../../enum/socket-payload';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService implements OnDestroy {
  private stompClient!: Client;

  // Trạm trung chuyển dữ liệu bằng RxJS để các component đăng ký tiêu thụ
  private walletNotification$ = new Subject<any>();
  private bookingNotification$ = new Subject<any>();
  private globalNotificationSource = new Subject<SocketPayload<any>>();
  public globalNotification$ = this.globalNotificationSource.asObservable();
  private currentChatSubscription?: StompSubscription;
  private activeChatSource = new Subject<any>();
public inboxNotification$ = new Subject<any>();
  public listenInboxStatus() { return this.inboxNotification$.asObservable(); }
  constructor(private oauthService: OAuthService) {
    this.establishConnection();
  }

  /**
   * Khởi tạo và kích hoạt kết nối WebSocket Native có bảo mật Token
   */
  private establishConnection(): void {
    // ĐỔI SANG WSS NATIVE: Bỏ hoàn toàn SockJS, trỏ đúng endpoint /ws của Backend
    // Lưu ý: Đổi thành 'ws://' nếu môi trường dev của bác chạy HTTP thường
    const brokerUrl = 'wss://localhost:8443/ws';

    this.stompClient = new Client({
      brokerURL: brokerUrl,

      // Đút Token vào Headers để Spring Boot Security / WebSocket Interceptor tự phân tách Principal
      connectHeaders: {
        Authorization: `Bearer ${this.oauthService.getAccessToken()}`
      },

      // Tự động kết nối lại sau mỗi 5 giây nếu Server bảo trì hoặc ngắt kết nối đột ngột
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      // Bắn log ra màn hình console để dev dễ theo dõi luồng tin nhắn
      debug: (str: string) => {
        console.log('[STOMP-NATIVE]:', str);
      },

      // Kích hoạt khi bắt tay kết nối thành công với Spring Boot Broker
      onConnect: () => {
        console.log('✔ CỔNG NATIVE WEBSOCKET KẾT NỐI THÀNH CÔNG!');
        this.subscribeToPrivateChannels();
      },

      // Báo lỗi nếu sai Token, sai cổng hoặc lỗi giao thức STOMP
      onStompError: (frame) => {
        console.error('❌ Lỗi giao thức STOMP từ Server:', frame.headers['message']);
      }
    });

    // Kích hoạt luồng chạy ngầm
    this.stompClient.activate();
  }

  /**
   * Đăng ký lắng nghe các kênh riêng tư (User-specific) từ Backend gửi về
   */
  private subscribeToPrivateChannels(): void {

    // 1. Kênh biến động số dư Ví (Rút tiền, hoàn tiền, giải ngân)
    // Khớp 100% với hằng số SocketDestinations.WALLET_QUEUE (/queue/wallet) ở Backend
    this.stompClient.subscribe('/user/queue/wallet', (message: Message) => {
      if (message.body) {
        try {
          const payload = JSON.parse(message.body);
          console.log('🔔 [REALTIME WALLET]:', payload);
          this.walletNotification$.next(payload); // Phát tín hiệu ra ngoài
        } catch (error) {
          console.error('Lỗi parse gói tin Ví:', error);
        }
      }
    });

    // 2. Kênh thông báo Đặt phòng (Booking)
    // Khớp với SocketDestinations.BOOKING_QUEUE (/queue/booking) ở Backend
    this.stompClient.subscribe('/user/queue/booking', (message: Message) => {
      if (message.body) {
        try {
          const payload = JSON.parse(message.body);
          console.log('🔔 [REALTIME BOOKING]:', payload);
          this.bookingNotification$.next(payload); // Phát tín hiệu ra ngoài
        } catch (error) {
          console.error('Lỗi parse gói tin Booking:', error);
        }
      }
    });
    this.stompClient.subscribe('/user/queue/notifications', (message: Message) => {
      const payload = JSON.parse(message.body);
      this.globalNotificationSource.next(payload);
    });
    // Ném dòng này vào trong hàm subscribeToPrivateChannels() của WebsocketService bên Angular nhé:
this.stompClient.subscribe('/user/queue/inbox', (message: Message) => {
  if (message.body) {
    try {
      const payload = JSON.parse(message.body);
      console.log('📬 [REALTIME INBOX]:', payload);
      
      // Đẩy data ra ngoài qua RxJS Subject để ChatService tiêu thụ
      this.inboxNotification$.next(payload.data ? payload.data : payload);
    } catch (error) {
      console.error('Lỗi parse gói tin Inbox:', error);
    }
  }
});

  }

  /**
   * Cung cấp Observable công khai để Component Ví (HostWallet) lắng nghe (.subscribe)
   */
  public listenWalletStatus(): Observable<any> {
    return this.walletNotification$.asObservable();
  }

  /**
   * Cung cấp Observable công khai để các màn hình Quản lý Đặt phòng lắng nghe
   */
  public listenBookingStatus(): Observable<any> {
    return this.bookingNotification$.asObservable();
  }

  /**
   * Dọn dẹp bộ nhớ, ngắt kết nối an toàn khi tắt app hoặc logout
   */
  ngOnDestroy(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      console.log('[STOMP-NATIVE] Đã ngắt kết nối WebSocket hoàn toàn.');
    }
  }
  public subscribeToChatRoom(conversationId: number): void {
    // 1. Nếu Client chưa connect xong thì không làm gì cả
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('STOMP chưa connect, không thể subscribe phòng chat.');
      return;
    }

    // 2. HỦY KẾT NỐI phòng cũ (nếu đang ở phòng khác) để tránh nhận rác
    if (this.currentChatSubscription) {
      this.currentChatSubscription.unsubscribe();
      console.log('Đã thoát phòng chat cũ.');
    }

    // 3. ĐĂNG KÝ phòng mới
    const topic = `/topic/conversations/${conversationId}`;
    console.log(`Đang vào phòng chat: ${topic}`);

    this.currentChatSubscription = this.stompClient.subscribe(topic, (message: Message) => {
      console.log(`Tin nhắn mới từ phòng ${conversationId}:`, message);
      if (message.body) {
        try {
          console.log(message)
          const payload = JSON.parse(message.body);
          console.log(`💬 [TIN NHẮN MỚI TỪ PHÒNG ${conversationId}]:`, payload);
          
          // Đẩy data ra cho Inbox Component nhận (Thường data nằm trong payload.data nếu bạn bọc ApiResponse ở Backend)
          this.activeChatSource.next(payload.data ? payload.data : payload); 
        } catch (error) {
          console.error('Lỗi parse gói tin Chat:', error);
        }
      }
    });
  }
  public listenActiveChatMessages(): Observable<any> {
    return this.activeChatSource.asObservable();
  }
  public leaveChatRoom(): void {
    if (this.currentChatSubscription) {
      this.currentChatSubscription.unsubscribe();
      this.currentChatSubscription = undefined;
      console.log('Đã thoát phòng chat.');
    }
  }
}