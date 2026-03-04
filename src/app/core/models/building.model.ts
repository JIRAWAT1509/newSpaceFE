// src/app/core/models/building.model.ts

export interface Building {
  id: string;
  branchId: string;
  code: string;
  name: string;
  nameTh: string;
  nameEn: string;
  address?: string;
  addressTh?: string;
  addressEn?: string;
  // optional/extra fields
  isActive?: boolean;
  contactPerson?: string;
  contactPhone?: string;
  optionalInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}
