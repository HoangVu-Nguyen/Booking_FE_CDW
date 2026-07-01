import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-handbook',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './handbook.html'
})
export class Handbook {
  featuredArticle = {
    title: 'Kinh nghiệm du lịch Đà Lạt tự túc từ A-Z năm 2026',
    category: 'Cẩm nang du lịch',
    date: '12 Tháng 5, 2026',
    readTime: '8 phút đọc',
    image: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Tổng hợp chi tiết nhất về kinh nghiệm đi Đà Lạt: ăn gì, ở đâu, chơi gì, các điểm check-in mới nhất không thể bỏ qua trong năm nay.'
  };

  articles = [
    {
      id: 1,
      title: 'Top 10 Homestay có view thung lũng đẹp nhất Sapa',
      category: 'Review Chỗ ở',
      date: '10 Tháng 5, 2026',
      readTime: '5 phút đọc',
      image: 'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      excerpt: 'Nếu bạn đang tìm kiếm một nơi lưu trú ấm cúng với tầm nhìn ôm trọn biển mây Sapa, đừng bỏ qua danh sách này.'
    },
    {
      id: 2,
      title: 'Bí kíp săn vé máy bay giá rẻ cho mùa cao điểm',
      category: 'Mẹo Du Lịch',
      date: '05 Tháng 5, 2026',
      readTime: '6 phút đọc',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      excerpt: 'Làm thế nào để vi vu mùa hè mà không lo cháy túi? Áp dụng ngay những mẹo săn vé máy bay hiệu quả sau đây.'
    },
    {
      id: 3,
      title: 'Khám phá ẩm thực đường phố Hội An qua lăng kính người bản địa',
      category: 'Ẩm thực',
      date: '01 Tháng 5, 2026',
      readTime: '7 phút đọc',
      image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      excerpt: 'Bánh mì Phượng, Cao Lầu, Mì Quảng... Hành trình lấp đầy chiếc bụng đói tại khu phố cổ nhộn nhịp nhất Việt Nam.'
    }
  ];

  categories = [
    { name: 'Tất cả', active: true },
    { name: 'Cẩm nang du lịch', active: false },
    { name: 'Review Chỗ ở', active: false },
    { name: 'Ẩm thực', active: false },
    { name: 'Mẹo Du Lịch', active: false }
  ];
}
