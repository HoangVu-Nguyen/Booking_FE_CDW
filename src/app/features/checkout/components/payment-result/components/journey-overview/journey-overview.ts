import { Component, input } from '@angular/core';

@Component({
  selector: 'app-journey-overview',
  imports: [],
  templateUrl: './journey-overview.html',
  styleUrl: './journey-overview.css',
})
export class JourneyOverview {
  roomName = input<string>('Suite Hướng Núi'); // Giá trị mặc định nếu ko truyền
  guests = input<string>('2 Adults, 1 Child');
  toursList = input<any[]>([]); // Khai báo chính xác toursList dạng mảng để hết lỗi NG8002
}
