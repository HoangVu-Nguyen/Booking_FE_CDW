import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-destinations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './destinations.html'
})
export class Destinations {
  destinations = [
    {
      id: 1,
      name: 'Đà Lạt',
      region: 'Tây Nguyên',
      image: 'https://images.unsplash.com/photo-1559586616-361e18714958?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Thành phố ngàn hoa với khí hậu ôn hòa quanh năm. Thích hợp cho những chuyến nghỉ dưỡng lãng mạn.',
      homestaysCount: 342,
      toursCount: 56
    },
    {
      id: 2,
      name: 'Sapa',
      region: 'Tây Bắc',
      image: 'https://images.unsplash.com/photo-1549488344-c6a4d142104d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Fallback, wait I'll use a better one if possible, this is ok.
      description: 'Khám phá vẻ đẹp hoang sơ của núi rừng Tây Bắc và văn hóa độc đáo của các dân tộc thiểu số.',
      homestaysCount: 215,
      toursCount: 84
    },
    {
      id: 3,
      name: 'Hội An',
      region: 'Miền Trung',
      image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Phố cổ trầm mặc bên dòng sông Hoài. Điểm đến lý tưởng để trải nghiệm văn hóa và ẩm thực miền Trung.',
      homestaysCount: 450,
      toursCount: 120
    },
    {
      id: 4,
      name: 'Ninh Bình',
      region: 'Đồng bằng sông Hồng',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Vịnh Hạ Long trên cạn với phong cảnh sơn thủy hữu tình, hang động kỳ bí và các di tích lịch sử.',
      homestaysCount: 180,
      toursCount: 45
    },
    {
      id: 5,
      name: 'Phú Quốc',
      region: 'Đồng bằng sông Cửu Long',
      image: 'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Đảo ngọc thiên đường với những bãi biển cát trắng trải dài, nước biển trong xanh và hải sản tươi ngon.',
      homestaysCount: 520,
      toursCount: 150
    },
    {
      id: 6,
      name: 'Hà Giang',
      region: 'Đông Bắc',
      image: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Cao nguyên đá hùng vĩ với những cung đường đèo hiểm trở nhưng đẹp mê hồn, mùa hoa tam giác mạch rực rỡ.',
      homestaysCount: 150,
      toursCount: 68
    }
  ];
}
