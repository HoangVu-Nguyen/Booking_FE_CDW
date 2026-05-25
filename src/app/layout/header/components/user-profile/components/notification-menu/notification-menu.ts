import { Component, Input, Output, EventEmitter, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../../../core/services/notification/notification.service';
import { Notification } from '../../../../../../core/models/response/notification.response';
export type NotifFilter = 'ALL' | 'UNREAD' | 'BOOKING' | 'SYSTEM';

@Component({
  selector: 'app-notification-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-menu.html'
})
export class NotificationMenu implements OnInit {
  @Input() isOpen = false;
  @Output() toggle = new EventEmitter<void>();

  private notifService = inject(NotificationService);

  activeFilter = signal<NotifFilter>('ALL');
  notifications = signal<Notification[]>([]);

  // 1. Bind unreadCount trực tiếp từ Service
  unreadCount = this.notifService.unreadCount;

  // 2. Logic lọc thông minh dùng computed signal
  filteredNotifs = computed(() => {
    const filter = this.activeFilter();
    const list = this.notifications();

    switch (filter) {
      case 'UNREAD': return list.filter(n => !n.isRead);
      case 'BOOKING': return list.filter(n => n.metadata?.category === 'BOOKING');
      case 'SYSTEM': return list.filter(n => n.metadata?.category === 'SYSTEM');
      default: return list;
    }
  });

  ngOnInit() {
    this.loadData();
    this.notifService.newNotification$.pipe(
      
    ).subscribe(newNotif => {
      console.log('Có thông báo mới:', newNotif);
      // Logic chỉ chạy khi menu này đang tồn tại
      this.notifications.update(list => [newNotif, ...list]);
    });
  }


loadData() {
  this.notifService.getNotifications().subscribe(res => {
    this.notifications.set(res.data.content);
  });
}

setFilter(filter: NotifFilter) {
  this.activeFilter.set(filter);
}

onMarkAsRead(id: number) {
  this.notifService.markAsRead(id).subscribe(() => {
    // Cập nhật local state thay vì load lại cả danh sách để tránh nháy màn hình
    this.notifications.update(list =>
      list.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  });
}

markAllAsRead() {
  this.notifService.markAllAsRead().subscribe(() => {
    this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
  });
}

}