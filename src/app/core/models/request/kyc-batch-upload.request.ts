import { KycDocumentType } from "../../enum/kyc-document-type.enum";

export interface KycDocumentMeta {
  fileName: string;
  contentType: string;
  fileSize: number;
  documentType: KycDocumentType;
}

export interface KycBatchUploadRequest {
  profileId: number;
  items: KycDocumentMeta[];
}