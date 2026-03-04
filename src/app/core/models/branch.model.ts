// src/app/core/models/branch.model.ts

export interface Branch {
  id: string;               
  code: string;
  name: string;
  nameTh: string;
  nameEn: string;
  address: string;
  addressTh: string;
  addressEn: string;
  createdAt: Date;
  updatedAt: Date;
}
