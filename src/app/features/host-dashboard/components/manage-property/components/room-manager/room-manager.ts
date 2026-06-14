import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
// import { HomestayRoomService } from '../../../../../../core/services/homestay/homestay-room.service';


@Component({
  selector: 'app-room-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-manager.html'
})
export class RoomManager implements OnInit {
  private route = inject(ActivatedRoute);
  // private roomService = inject(HomestayRoomService);

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
    this.route.parent?.paramMap.subscribe(params => {
      this.homestayId = params.get('id');

      if (this.homestayId) {
        this.loadRooms(this.homestayId);
      }
    });
  }

  private loadRooms(id: string): void {
    this.isLoading.set(true);

    /**
     * Sau này gọi API thật:
     *
     * this.roomService.getRoomsByHomestayId(id).subscribe({
     *   next: res => {
     *     this.rooms = res.data.map(...);
     *     this.isLoading.set(false);
     *   },
     *   error: err => {
     *     this.isLoading.set(false);
     *   }
     * });
     */

    setTimeout(() => {
      this.rooms = [
        {
          id: 1,
          name: 'Phòng ngủ Master',
          type: 'BEDROOM',
          description: 'Phòng ngủ chính có cửa sổ lớn, ánh sáng tự nhiên và không gian riêng tư.',
          maxGuests: 3,
          areaM2: 28,
          hasPrivateBathroom: true,
          isExpanded: true,
          beds: [
            { type: 'KING', quantity: 1 },
            { type: 'SOFA', quantity: 1 }
          ],
          images: [
            {
              id: crypto.randomUUID(),
              url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop',
              objectKey: 'rooms/demo/master-bedroom.jpg',
              isCover: true,
              isNew: false
            }
          ]
        }
      ];

      this.isLoading.set(false);
      this.isDirty.set(false);
    }, 500);
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
      areaM2: null,
      hasPrivateBathroom: false,
      isExpanded: true,
      beds: [
        {
          type: 'DOUBLE',
          quantity: 1
        }
      ],
      images: []
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

  getTotalBeds(room: Room): number {
    return room.beds.reduce((total, bed) => total + bed.quantity, 0);
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

  saveChanges(): void {
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

    const payload = {
      homestayId: Number(this.homestayId),
      rooms: this.rooms.map((room, roomIndex) => ({
        id: room.id,
        name: room.name.trim(),
        type: room.type,
        description: room.description.trim(),
        maxGuests: room.maxGuests,
        areaM2: room.areaM2,
        hasPrivateBathroom: room.hasPrivateBathroom,
        sortOrder: roomIndex,
        beds: room.beds.map(bed => ({
          id: bed.id,
          type: bed.type,
          quantity: bed.quantity
        })),
        existingImages: room.images
          .filter(image => !image.isNew)
          .map((image, imageIndex) => ({
            id: image.id,
            objectKey: image.objectKey,
            isCover: image.isCover,
            sortOrder: imageIndex
          })),
        newImages: room.images
          .filter(image => image.isNew)
          .map((image, imageIndex) => ({
            fileName: image.file?.name,
            isCover: image.isCover,
            sortOrder: imageIndex
          }))
      }))
    };

    console.log('Payload Update Rooms:', payload);

    /**
     * Nếu backend nhận JSON + upload ảnh riêng:
     * 1. Gửi payload JSON tạo/update room.
     * 2. Upload ảnh mới theo roomId sau.
     *
     * Nếu backend nhận FormData một lần:
     * const formData = this.buildRoomFormData();
     * this.roomService.updateRooms(formData).subscribe(...)
     */

    setTimeout(() => {
      this.isSaving.set(false);
      this.isDirty.set(false);
      this.showSuccessToast();
    }, 1000);
  }

  buildRoomFormData(): FormData {
    const formData = new FormData();

    const roomsPayload = this.rooms.map((room, roomIndex) => ({
      id: room.id,
      name: room.name.trim(),
      type: room.type,
      description: room.description.trim(),
      maxGuests: room.maxGuests,
      areaM2: room.areaM2,
      hasPrivateBathroom: room.hasPrivateBathroom,
      sortOrder: roomIndex,
      beds: room.beds,
      images: room.images.map((image, imageIndex) => ({
        id: image.isNew ? null : image.id,
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
        .forEach((image, imageIndex) => {
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
}