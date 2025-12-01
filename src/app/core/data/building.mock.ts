// src/app/core/data/building.mock.ts

import { Building } from '../models/building.model';

export const MOCK_BUILDING: Building = {
  id: 'bld-001',
  code: 'ST03',
  name: 'อาคารอิมพีเรียล ทาวเวอร์ 3',
  nameTh: 'อาคารอิมพีเรียล ทาวเวอร์ 3',
  nameEn: 'Imperial Tower 3',
  address: 'xxx, xxxxxxxx, กทม. 12345',
  addressTh: 'xxx, xxxxxxxx, กรุงเทพมหานคร 12345',
  addressEn: 'xxx, xxxxxxxx, Bangkok 12345',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2025-11-21')
};
