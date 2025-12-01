// src/app/core/models/building.model.ts

export interface Building {
  id: string;
  code: string;              // "ST03"
  name: string;
  nameTh: string;
  nameEn: string;
  address: string;
  addressTh: string;
  addressEn: string;
  createdAt: Date;
  updatedAt: Date;
}
