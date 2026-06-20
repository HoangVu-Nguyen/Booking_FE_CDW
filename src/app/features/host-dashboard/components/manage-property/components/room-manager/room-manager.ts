import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HomestayService } from '../../../../../../core/services/homestay/homestay.service';
import {  RatePlanResponse, RoomDisplayResponse } from '../../../../../../core/models/response/room.response';
import { BedResponse, RoomImageResponse } from '../../../../../../core/models/response/calendar.response';
import { firstValueFrom } from 'rxjs';
import { RoomService } from '../../../../../../core/services/room.service';
import { ImageType } from '../../../../../../core/enum/image-type.enum';
import { BookingMode } from '../../../../../../core/models/response/room.response';


interface Bed {
  id?: number;
  type: string;
  quantity: number;
}

interface RoomImage {
  id: string;
  backendId?: number | null;
  file?: File;
  url: string;
  objectKey?: string | null;
  isCover: boolean;
  isNew: boolean;
  displayOrder?: number;
}

interface Room {
  id?: number;
  name: string;
  type: string;
  description: string;
  maxGuests: number;
  area: number | null;
  hasPrivateBathroom: boolean;
  isExpanded: boolean;
  beds: Bed[];
  images: RoomImage[];
  ratePlans: RatePlanResponse[];
  isInstantBook: boolean;

}


@Component({
  selector: 'app-room-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-manager.html'
})
export class RoomManager implements OnInit {
  private route = inject(ActivatedRoute);
  private roomService = inject(RoomService);
  private homestayService = inject(HomestayService);

  homestayId: string | null = null;

  isSaving = signal(false);
  isDirty = signal(false);
  showSavedToast = signal(false);
  isLoading = signal(false);

  roomTypes = [
    { value: 'BEDROOM', label: 'Phòng ngủ' },
    { value: 'LIVING_ROOM', label: 'Phòng khách' },
    { value: 'COMMON_SPACE', label: 'Không gian chung' },
    { value: 'STUDIO', label: 'Studio' },
    { value: 'ENTIRE_PLACE', label: 'Toàn bộ căn' }
  ];

  bedTypes = [
    { value: 'SINGLE', label: 'Giường đơn', icon: 'single_bed' },
    { value: 'DOUBLE', label: 'Giường đôi', icon: 'bed' },
    { value: 'QUEEN', label: 'Giường Queen', icon: 'king_bed' },
    { value: 'KING', label: 'Giường King', icon: 'king_bed' },
    { value: 'BUNK', label: 'Giường tầng', icon: 'bunk_bed' },
    { value: 'SOFA', label: 'Sofa giường', icon: 'chair' },
    { value: 'FLOOR_MATTRESS', label: 'Nệm sàn', icon: 'airline_seat_individual_suite' }
  ];

  rooms: Room[] = [];

  ngOnInit(): void {
    const paramMap$ = this.route.parent?.paramMap ?? this.route.paramMap;

    paramMap$.subscribe(params => {
      this.homestayId =
        params.get('id') ||
        params.get('homestayId');

      if (this.homestayId) {
        this.loadRooms(this.homestayId);
       
      }
    });
    console.log(this.rooms)
  }

  private loadRooms(id: string): void {
    this.isLoading.set(true);

    this.homestayService.getRoomsByHomestayId(id).subscribe({
      next: res => {
        const data = res.data || [];

        this.rooms = data.map((room, index) => this.mapRoomResponse(room, index));
         console.log(this.rooms)

        this.isLoading.set(false);
        this.isDirty.set(false);
      },
      error: err => {
        console.error('Load rooms failed:', err);
        this.rooms = [];
        this.isLoading.set(false);
      }
    });
  }

  private mapRoomResponse(room: RoomDisplayResponse, index: number): Room {
    const images = this.mapRoomImages(room.images || []);
    console.log(room)

    return {
      id: room.id,
      name: room.name || `Phòng ${index + 1}`,
      type: room.type || 'BEDROOM',
      description: room.description || '',
      maxGuests: Number(room.maxGuests || 1),
      area: room.area ?? room.area ?? null,
      hasPrivateBathroom: Boolean(room.hasPrivateBathroom),
      isExpanded: index === 0,
      beds: this.mapBeds(room.beds || []),
      images,
      ratePlans: room.ratePlans,
      isInstantBook: room.isInstantBook! 
    };
  }

  private mapBeds(beds: BedResponse[]): Bed[] {
    if (!beds.length) {
      return [
        {
          type: 'DOUBLE',
          quantity: 1
        }
      ];
    }

    return beds.map(bed => ({
      id: bed.id,
      type: bed.type,
      quantity: Number(bed.quantity || 1)
    }));
  }

  private mapRoomImages(images: RoomImageResponse[]): RoomImage[] {
    const mappedImages = images
      .map((image, index) => ({
        id: String(image.id ?? crypto.randomUUID()),
        backendId: image.id ?? null,
        url: image.url || image.url || '',
        objectKey: image.url ?? null,
        isCover: Boolean(image.isCover),
        isNew: false,
        displayOrder: image.displayOrder ?? index
      }))
      .filter(image => !!image.url)
      .sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0));

    if (mappedImages.length > 0 && !mappedImages.some(image => image.isCover)) {
      mappedImages[0].isCover = true;
    }

    return mappedImages;
  }

  addRoom(): void {
    const newRoomCount = this.rooms.length + 1;

    this.rooms.forEach(room => {
      room.isExpanded = false;
    });

    this.rooms.push({
      name: `Phòng ngủ ${newRoomCount}`,
      type: 'BEDROOM',
      description: '',
      maxGuests: 2,
      area: null,
      hasPrivateBathroom: false,
      isExpanded: true,
      beds: [
        {
          type: 'DOUBLE',
          quantity: 1
        }
      ],
      images: [],
      ratePlans: [],
      isInstantBook: true
    });

    this.markDirty();
  }

  removeRoom(index: number): void {
    const room = this.rooms[index];

    if (!room) return;

    const ok = confirm(`Bạn có chắc chắn muốn xóa "${room.name || 'phòng này'}" không?`);

    if (!ok) return;

    room.images.forEach(image => {
      if (image.isNew && image.url) {
        URL.revokeObjectURL(image.url);
      }
    });

    this.rooms.splice(index, 1);
    this.markDirty();
  }

  duplicateRoom(room: Room): void {
    const clonedRoom: Room = {
      ...room,
      id: undefined,
      name: `${room.name} - bản sao`,
      isExpanded: true,
      beds: room.beds.map(bed => ({
        type: bed.type,
        quantity: bed.quantity
      })),
      images: room.images
        .filter(image => !image.file)
        .map(image => ({
          ...image,
          id: crypto.randomUUID(),
          backendId: null,
          isCover: image.isCover,
          isNew: false
        }))
    };

    this.rooms.forEach(item => {
      item.isExpanded = false;
    });

    this.rooms.push(clonedRoom);
    this.markDirty();
  }

  toggleRoom(room: Room): void {
    room.isExpanded = !room.isExpanded;
  }

  addBed(room: Room): void {
    room.beds.push({
      type: 'DOUBLE',
      quantity: 1
    });

    this.markDirty();
  }

  removeBed(room: Room, bedIndex: number): void {
    room.beds.splice(bedIndex, 1);
    this.markDirty();
  }

  incrementBed(bed: Bed): void {
    if (bed.quantity < 10) {
      bed.quantity += 1;
      this.markDirty();
    }
  }

  decrementBed(bed: Bed): void {
    if (bed.quantity > 1) {
      bed.quantity -= 1;
      this.markDirty();
    }
  }

  onRoomImagesSelected(event: Event, room: Room): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const selectedFiles = Array.from(input.files);

    const validFiles = selectedFiles.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isUnder10MB = file.size <= 10 * 1024 * 1024;

      return isImage && isUnder10MB;
    });

    const newImages: RoomImage[] = validFiles.map((file, index) => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
      objectKey: null,
      isCover: room.images.length === 0 && index === 0,
      isNew: true
    }));

    room.images = [...room.images, ...newImages];

    if (!room.images.some(image => image.isCover) && room.images.length > 0) {
      room.images[0].isCover = true;
    }

    input.value = '';
    this.markDirty();
  }

  removeRoomImage(room: Room, imageId: string): void {
    const removedImage = room.images.find(image => image.id === imageId);

    if (removedImage?.isNew && removedImage.url) {
      URL.revokeObjectURL(removedImage.url);
    }

    const wasCover = removedImage?.isCover;

    room.images = room.images.filter(image => image.id !== imageId);

    if (wasCover && room.images.length > 0) {
      room.images[0].isCover = true;
    }

    this.markDirty();
  }

  setCoverImage(room: Room, imageId: string): void {
    room.images = room.images.map(image => ({
      ...image,
      isCover: image.id === imageId
    }));

    this.markDirty();
  }

  getRoomCover(room: Room): string | null {
    return room.images.find(image => image.isCover)?.url || room.images[0]?.url || null;
  }

  getRoomTypeLabel(type: string): string {
    return this.roomTypes.find(item => item.value === type)?.label || 'Phòng';
  }

  getBedTypeLabel(type: string): string {
    return this.bedTypes.find(item => item.value === type)?.label || type;
  }

  getBedTypeIcon(type: string): string {
    return this.bedTypes.find(item => item.value === type)?.icon || 'bed';
  }

  getTotalBeds(room: Room): number {
    return room.beds.reduce((total, bed) => total + Number(bed.quantity || 0), 0);
  }

  getTotalGuests(): number {
    return this.rooms.reduce((total, room) => total + Number(room.maxGuests || 0), 0);
  }

  getTotalBedsAllRooms(): number {
    return this.rooms.reduce((total, room) => total + this.getTotalBeds(room), 0);
  }

  getTotalImages(): number {
    return this.rooms.reduce((total, room) => total + room.images.length, 0);
  }

  markDirty(): void {
    this.isDirty.set(true);
  }

  async saveChanges(): Promise<void> {
    // 1. Validate form (Giữ nguyên của ông giáo)
    for (const room of this.rooms) {
      if (!room.name.trim()) {
        alert('Tên phòng không được để trống.');
        room.isExpanded = true;
        return;
      }
      if (room.maxGuests < 1) {
        alert(`Sức chứa của "${room.name}" phải lớn hơn 0.`);
        room.isExpanded = true;
        return;
      }
      if (room.beds.length === 0) {
        alert(`"${room.name}" cần có ít nhất 1 loại giường.`);
        room.isExpanded = true;
        return;
      }
    }

    if (!this.homestayId) {
      alert('Không tìm thấy ID chỗ nghỉ.');
      return;
    }

    this.isSaving.set(true);

    try {
      // ==========================================
      // BƯỚC 1: XIN LINK S3 CHO CÁC ẢNH MỚI
      // ==========================================
      // Lọc ra các phòng có ảnh mới và cấu trúc lại để gọi API xin link
      const roomsWithNewImages = this.rooms
        .filter(room => room.images.some(img => img.isNew))
        .map(room => ({
          roomId: room.id!, // Chú ý: Cần có ID phòng
          items: room.images
            .filter(img => img.isNew && img.file)
            .map((img, index) => ({
              fileName: img.file!.name,
              fileSize: img.file!.size,
              imageType: ImageType.HOMESTAY,
              contentType: img.file!.type,
              isCover: img.isCover,
              sortOrder: index
            }))
        }));

      let presignedUrls: any[] = []; // Chứa danh sách link S3 trả về

      // ==========================================
      // BƯỚC 2: UPLOAD FILE LÊN S3 SONG SONG
      // ==========================================
      if (roomsWithNewImages.length > 0) {
        // Gọi API Backend xin link
        presignedUrls = await firstValueFrom(this.roomService.prepareImageUploads(this.homestayId,{ rooms: roomsWithNewImages }));

        // Tạo các Promise để upload thẳng file lên S3
        const uploadPromises = presignedUrls.map(urlInfo => {
          // Tìm đúng file vật lý trên RAM khớp với roomId và fileName
          const room = this.rooms.find(r => r.id === urlInfo.roomId);
          const imgObj = room?.images.find(img => img.isNew && img.file?.name === urlInfo.fileName);

          if (imgObj && imgObj.file) {
            return firstValueFrom(this.roomService.uploadFileToS3(urlInfo.uploadUrl, imgObj.file));
          }
          return Promise.resolve(); // Bỏ qua nếu không tìm thấy
        });

        // Chờ TẤT CẢ các file được upload xong
        await Promise.all(uploadPromises);
        console.log('Đã upload toàn bộ ảnh mới lên S3 thành công!');
      }

      // ==========================================
      // BƯỚC 3: BUILD PAYLOAD CHỐT SỔ GỬI BE
      // ==========================================
      // Chú ý: Thay vì chia ra existingImages và newImages như nháp cũ, 
      // giờ ta gộp chung vào 1 mảng 'images' duy nhất theo DTO chốt hạ
      const finalPayload = {
        homestayId: Number(this.homestayId),
        rooms: this.rooms.map((room, roomIndex) => {

          const oldImages = room.images
            .filter(img => !img.isNew)
            .map((img, imgIndex) => ({
              id: img.backendId,
              isCover: img.isCover,
              sortOrder: imgIndex
            }));

          const newlyUploadedImages = presignedUrls
            .filter(url => url.roomId === room.id)
            .map((url, imgIndex) => {
              const originalFile = room.images.find(
                img => img.isNew && img.file?.name === url.fileName
              );

              return {
                objectKey: url.objectKey,
                isCover: originalFile?.isCover || false,
                sortOrder: oldImages.length + imgIndex
              };
            });

          return {
            id: room.id,
            name: room.name.trim(),
            type: room.type,
            description: room.description.trim(),
            maxGuests: room.maxGuests,
            area: room.area,
            isInstantBook: room.isInstantBook,
            hasPrivateBathroom: room.hasPrivateBathroom,
            sortOrder: roomIndex,

            beds: room.beds.map(bed => ({
              id: bed.id,
              type: bed.type,
              quantity: bed.quantity
            })),

            ratePlans: room.ratePlans.map(plan => ({
              id: plan.id,
              name: plan.name,
              price: plan.price,
              isNonRefundable: plan.isNonRefundable,
              
            })),

            images: [...oldImages, ...newlyUploadedImages]
          };
        })
      };

      console.log('Payload Chốt Sổ gửi Backend:', finalPayload);

      // ==========================================
      // BƯỚC 4: GỌI API UPDATE ROOM CUỐI CÙNG
      // ==========================================
      await firstValueFrom(this.roomService.updateRooms(this.homestayId,finalPayload));

      // Thành công
      this.isDirty.set(false);
      this.showSuccessToast();

    } catch (error) {
      console.error('Lỗi quá trình lưu phòng và upload ảnh:', error);
      alert('Có lỗi xảy ra khi lưu thay đổi. Vui lòng thử lại.');
    } finally {
      // Luôn tắt trạng thái loading dù thành công hay thất bại
      this.isSaving.set(false);
    }
  }

  buildRoomFormData(): FormData {
    const formData = new FormData();

    const roomsPayload = this.rooms.map((room, roomIndex) => ({
      id: room.id,
      name: room.name.trim(),
      type: room.type,
      description: room.description.trim(),
      maxGuests: room.maxGuests,
      areaM2: room.area,
      hasPrivateBathroom: room.hasPrivateBathroom,
      sortOrder: roomIndex,
      beds: room.beds,
      images: room.images.map((image, imageIndex) => ({
        id: image.isNew ? null : image.backendId,
        objectKey: image.objectKey || null,
        isCover: image.isCover,
        isNew: !!image.isNew,
        sortOrder: imageIndex
      }))
    }));

    formData.append('homestayId', String(this.homestayId));
    formData.append(
      'rooms',
      new Blob([JSON.stringify(roomsPayload)], {
        type: 'application/json'
      })
    );

    this.rooms.forEach((room, roomIndex) => {
      room.images
        .filter(image => image.isNew && image.file)
        .forEach(image => {
          formData.append(`roomImages_${roomIndex}`, image.file as File);
        });
    });

    return formData;
  }

  private showSuccessToast(): void {
    this.showSavedToast.set(true);

    setTimeout(() => {
      this.showSavedToast.set(false);
    }, 2500);
  }
  getLowestPriceFromPlans(ratePlans: RatePlanResponse[]): number | null {
    const prices = ratePlans
      .map(plan => plan.price)
      .filter((price): price is number => price !== null && price! > 0);

    if (prices.length === 0) {
      return null;
    }

    return Math.min(...prices);
  }

  formatPrice(price: number | null): string {
    if (price === null || price === undefined || price <= 0) {
      return '---';
    }

    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  }
  getBookingModeLabel(mode: BookingMode): string {
  switch (mode) {
    case 'INSTANT_BOOKING':
      return 'Mở đặt ngay';
    case 'REQUEST_TO_BOOK':
      return 'Yêu cầu trước khi đặt';
    case 'CLOSED':
      return 'Tạm khóa phòng';
    default:
      return 'Không xác định';
  }
}

getBookingModeDescription(mode: BookingMode): string {
  switch (mode) {
    case 'INSTANT_BOOKING':
      return 'Khách có thể chọn phòng và đặt ngay nếu còn phòng trống.';
    case 'REQUEST_TO_BOOK':
      return 'Khách vẫn thấy phòng, nhưng cần gửi yêu cầu để host xác nhận.';
    case 'CLOSED':
      return 'Phòng bị tạm khóa, khách không thể đặt phòng này.';
    default:
      return '';
  }
}

getInstantBookLabel(room: Room): string {
  return room.isInstantBook ? 'Đặt ngay' : 'Gửi yêu cầu';
}

getInstantBookDescription(room: Room): string {
  return room.isInstantBook
    ? 'Khách có thể đặt phòng ngay nếu còn phòng trống.'
    : 'Khách vẫn thấy phòng nhưng cần gửi yêu cầu để host xác nhận.';
}

getInstantBookIcon(room: Room): string {
  return room.isInstantBook ? 'bolt' : 'mark_email_unread';
}

getInstantBookBadgeClass(room: Room): string {
  return room.isInstantBook
    ? 'bg-green-50 text-green-700 border-green-200'
    : 'bg-[#fff8e8] text-[#8a6400] border-[#e4c47a]';
}

toggleInstantBook(room: Room): void {
  room.isInstantBook = !room.isInstantBook;
  this.markDirty();
}

setBookingMode(room: Room, mode: boolean): void {
  room.isInstantBook = mode;
  this.markDirty();
}
createDefaultRatePlans(room: Room): void {
  room.ratePlans = [
    {
      name: 'Standard',
      price: null,
      isNonRefundable: false,
      benefits: [
        {
          ratePlanId: null,
          amenityId: null,
          name: 'REFUNDABLE_POLICY',
          iconName: 'event_available',
          groupName: 'POLICY',
          displayValue: 'Có thể hoàn hủy theo chính sách'
        },
        {
          ratePlanId: null,
          amenityId: null,
          name: 'SECURE_PAYMENT',
          iconName: 'payments',
          groupName: 'PAYMENT',
          displayValue: 'Thanh toán an toàn'
        }
      ]
    },
    {
      name: 'Luxury',
      price: null,
      isNonRefundable: true,
      benefits: [
        {
          ratePlanId: null,
          amenityId: null,
          name: 'BEST_PRICE',
          iconName: 'sell',
          groupName: 'PRICE',
          displayValue: 'Giá tốt hơn'
        },
        {
          ratePlanId: null,
          amenityId: null,
          name: 'NON_REFUNDABLE',
          iconName: 'lock',
          groupName: 'POLICY',
          displayValue: 'Không hoàn hủy'
        }
      ]
    }
  ];

  this.markDirty();
}

addRatePlan(room: Room): void {
  room.ratePlans.push({
    name: `Gói giá ${room.ratePlans.length + 1}`,
    price: null,
    isNonRefundable: false,
    benefits: []
  });

  this.markDirty();
}

removeRatePlan(room: Room, index: number): void {
  if (room.ratePlans.length <= 1) {
    alert('Phòng cần có ít nhất 1 gói giá.');
    return;
  }

  room.ratePlans.splice(index, 1);
  this.markDirty();
}

}