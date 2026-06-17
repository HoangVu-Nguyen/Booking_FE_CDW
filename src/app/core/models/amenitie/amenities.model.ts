export interface AmenityItem {
  id: number;
  name: string;
  icon: string;
  category: string;
  popular?: boolean;
}

export interface AmenityCategory {
  key: string;
  title: string;
  description: string;
  icon: string;
}

export interface AmenityPreset {
  key: string;
  title: string;
  description: string;
  icon: string;
  amenityIds: number[];
}