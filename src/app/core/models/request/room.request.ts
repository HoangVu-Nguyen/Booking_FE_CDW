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
  areaM2: number | null;
  hasPrivateBathroom: boolean;
  beds: Bed[];
  images: RoomImage[];
  isExpanded: boolean;
}
