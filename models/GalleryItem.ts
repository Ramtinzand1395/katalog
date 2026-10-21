export interface GalleryItemInput {
  sourceId: string;
  name: string;
  imageUrl: string;
  images: string[];
  sortOrder: number;
  isVisible: boolean;
}

export interface GalleryItemDocument extends GalleryItemInput {
  updatedAt: Date;
}

export interface PublicGalleryItem {
  sourceId: string;
  name: string;
  imageUrl: string;
}
