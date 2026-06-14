import { UploadRequest } from "./upload.request";

interface Bed {
  id?: number;
  type: string;
  quantity: number;
}

interface RoomImage {
  id: string;
  file?: File;
  url: string;
  objectKey?: string;
  isCover: boolean;
  isNew?: boolean;
}

interface Room {
  id?: number;
  name: string;
  type: string;
  description: string;
  maxGuests: number;
  area: number | null;
  hasPrivateBathroom: boolean;
  beds: Bed[];
  images: RoomImage[];
  isExpanded: boolean;
}

export interface RoomBatchUpdateRequest {
    homestayId: number;
    rooms: RoomUpdateRequest[];
}
export interface RoomImageBatch {
    roomId: number;
    items: UploadRequest[];
}

export interface MultiRoomBatchUploadRequest {
    rooms: RoomImageBatch[];
}
export interface RoomUpdateRequest{

}