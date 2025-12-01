// document-type.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { DocumentTypeFormDrawerComponent } from './components/document-type-form-drawer/document-type-form-drawer.component';

interface DocumentType {
  OU_CODE: string;
  DOC_CODE: string;
  DOC_NAME: string;
  CREATE_BY?: string;
  CREATE_DATE?: string;
  UPD_BY?: string;
  UPD_DATE?: string;
  UPD_PGM?: string;
}

@Component({
  selector: 'app-document-type',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Button,
    DocumentTypeFormDrawerComponent
  ],
  templateUrl: './document-type.component.html',
  styleUrl: './document-type.component.css'
})
export class DocumentTypeComponent implements OnInit {
  // Data
  documentTypes = signal<DocumentType[]>([]);
  filteredDocumentTypes = signal<DocumentType[]>([]);

  // Search
  searchQuery = signal<string>('');

  // Form drawer state
  isDrawerOpen = signal<boolean>(false);
  drawerMode = signal<'create' | 'edit'>('create');
  selectedDocumentType = signal<DocumentType | null>(null);

  // Loading state
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadDocumentTypes();
  }

  // ==================== DATA LOADING ====================

  loadDocumentTypes(): void {
    this.isLoading.set(true);

    // Simulate API call with mock data
    setTimeout(() => {
      const mockData: DocumentType[] = [
        {
          OU_CODE: '001',
          DOC_CODE: '0',
          DOC_NAME: 'รหัสลูกค้า',
          CREATE_BY: 'SPACE',
          CREATE_DATE: '/Date(1752584792000)/',
          UPD_BY: 'SPACE',
          UPD_DATE: '/Date(1752584792000)/',
          UPD_PGM: 'F010601'
        },
        {
          OU_CODE: '001',
          DOC_CODE: 'A',
          DOC_NAME: '-',
          CREATE_BY: 'SPACE',
          CREATE_DATE: '/Date(1420045200000)/',
          UPD_BY: undefined,
          UPD_DATE: undefined,
          UPD_PGM: undefined
        },
        {
          OU_CODE: '001',
          DOC_CODE: 'BR',
          DOC_NAME: 'Workorder',
          CREATE_BY: 'SPACE',
          CREATE_DATE: '/Date(1420045200000)/',
          UPD_BY: undefined,
          UPD_DATE: undefined,
          UPD_PGM: undefined
        },
        {
          OU_CODE: '001',
          DOC_CODE: 'CA',
          DOC_NAME: 'ใบค่างาน',
          CREATE_BY: 'SPACE',
          CREATE_DATE: '/Date(1420045200000)/',
          UPD_BY: undefined,
          UPD_DATE: undefined,
          UPD_PGM: undefined
        },
        {
          OU_CODE: '001',
          DOC_CODE: 'CI',
          DOC_NAME: 'ใบยืนยันประจำเดือน',
          CREATE_BY: 'SPACE',
          CREATE_DATE: '/Date(1420045200000)/',
          UPD_BY: undefined,
          UPD_DATE: undefined,
          UPD_PGM: undefined
        },
        {
          OU_CODE: '001',
          DOC_CODE: 'CL',
          DOC_NAME: 'ใบยืนยันประจำเดือน',
          CREATE_BY: 'SPACE',
          CREATE_DATE: '/Date(1420045200000)/',
          UPD_BY: undefined,
          UPD_DATE: undefined,
          UPD_PGM: undefined
        },
        {
          OU_CODE: '001',
          DOC_CODE: 'CN',
          DOC_NAME: 'ใบยืนยันและสรุปเงิน',
          CREATE_BY: 'SPACE',
          CREATE_DATE: '/Date(1420045200000)/',
          UPD_BY: undefined,
          UPD_DATE: undefined,
          UPD_PGM: undefined
        },
        {
          OU_CODE: '001',
          DOC_CODE: 'CO',
          DOC_NAME: 'ซื้อมายกมา',
          CREATE_BY: 'SPACE',
          CREATE_DATE: '/Date(1420045200000)/',
          UPD_BY: undefined,
          UPD_DATE: undefined,
          UPD_PGM: undefined
        },
        {
          OU_CODE: '001',
          DOC_CODE: 'CT',
          DOC_NAME: 'ซื้อนำมา',
          CREATE_BY: 'SPACE',
          CREATE_DATE: '/Date(1420045200000)/',
          UPD_BY: undefined,
          UPD_DATE: undefined,
          UPD_PGM: undefined
        },
        {
          OU_CODE: '001',
          DOC_CODE: 'CV',
          DOC_NAME: 'ใบยืนยันกับกทบ.อสมท.',
          CREATE_BY: 'SPACE',
          CREATE_DATE: '/Date(1420045200000)/',
          UPD_BY: undefined,
          UPD_DATE: undefined,
          UPD_PGM: undefined
        },
        {
          OU_CODE: '001',
          DOC_CODE: 'IV',
          DOC_NAME: 'ใบบันทึก',
          CREATE_BY: 'SPACE',
          CREATE_DATE: '/Date(1420045200000)/',
          UPD_BY: undefined,
          UPD_DATE: undefined,
          UPD_PGM: undefined
        },
        {
          OU_CODE: '001',
          DOC_CODE: 'JO',
          DOC_NAME: 'ใบสวัยงาน',
          CREATE_BY: 'SPACE',
          CREATE_DATE: '/Date(1420045200000)/',
          UPD_BY: undefined,
          UPD_DATE: undefined,
          UPD_PGM: undefined
        },
        {
          OU_CODE: '001',
          DOC_CODE: 'LI',
          DOC_NAME: '-',
          CREATE_BY: 'SPACE',
          CREATE_DATE: '/Date(1420045200000)/',
          UPD_BY: undefined,
          UPD_DATE: undefined,
          UPD_PGM: undefined
        },
        {
          OU_CODE: '001',
          DOC_CODE: 'MS',
          DOC_NAME: 'เอกสารอื่นที่',
          CREATE_BY: 'SPACE',
          CREATE_DATE: '/Date(1420045200000)/',
          UPD_BY: undefined,
          UPD_DATE: undefined,
          UPD_PGM: undefined
        },
        {
          OU_CODE: '001',
          DOC_CODE: 'NN',
          DOC_NAME: 'ใบเช่าเพิ่มตกเคราะห์',
          CREATE_BY: 'SPACE',
          CREATE_DATE: '/Date(1420045200000)/',
          UPD_BY: undefined,
          UPD_DATE: undefined,
          UPD_PGM: undefined
        },
        {
          OU_CODE: '001',
          DOC_CODE: 'NT',
          DOC_NAME: 'ใบเช่าเงินเงิน',
          CREATE_BY: 'SPACE',
          CREATE_DATE: '/Date(1420045200000)/',
          UPD_BY: undefined,
          UPD_DATE: undefined,
          UPD_PGM: undefined
        },
        {
          OU_CODE: '001',
          DOC_CODE: 'QT',
          DOC_NAME: 'ใบเสนอราคา',
          CREATE_BY: 'SPACE',
          CREATE_DATE: '/Date(1420045200000)/',
          UPD_BY: undefined,
          UPD_DATE: undefined,
          UPD_PGM: undefined
        },
        {
          OU_CODE: '001',
          DOC_CODE: 'RE',
          DOC_NAME: 'เอกสารขึ้นบันทึกธอระนาอคลุยต่อ',
          CREATE_BY: 'SPACE',
          CREATE_DATE: '/Date(1420045200000)/',
          UPD_BY: undefined,
          UPD_DATE: undefined,
          UPD_PGM: undefined
        },
        {
          OU_CODE: '001',
          DOC_CODE: 'RS',
          DOC_NAME: 'ซื้อยากรองล่',
          CREATE_BY: 'SPACE',
          CREATE_DATE: '/Date(1420045200000)/',
          UPD_BY: undefined,
          UPD_DATE: undefined,
          UPD_PGM: undefined
        },
        {
          OU_CODE: '001',
          DOC_CODE: 'SA',
          DOC_NAME: 'เอกสารบันทึกยอดขายบัญชี',
          CREATE_BY: 'SPACE',
          CREATE_DATE: '/Date(1420045200000)/',
          UPD_BY: undefined,
          UPD_DATE: undefined,
          UPD_PGM: undefined
        }
      ];

      this.documentTypes.set(mockData);
      this.filteredDocumentTypes.set(mockData);
      this.isLoading.set(false);
    }, 800);
  }

  // ==================== SEARCH ====================

  onSearch(): void {
    const query = this.searchQuery().toLowerCase().trim();

    if (!query) {
      this.filteredDocumentTypes.set(this.documentTypes());
      return;
    }

    const filtered = this.documentTypes().filter(doc =>
      doc.DOC_CODE.toLowerCase().includes(query) ||
      doc.DOC_NAME.toLowerCase().includes(query)
    );

    this.filteredDocumentTypes.set(filtered);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.filteredDocumentTypes.set(this.documentTypes());
  }

  // ==================== DRAWER ACTIONS ====================

  openCreateDrawer(): void {
    this.drawerMode.set('create');
    this.selectedDocumentType.set(null);
    this.isDrawerOpen.set(true);
  }

  openEditDrawer(documentType: DocumentType): void {
    this.drawerMode.set('edit');
    this.selectedDocumentType.set(documentType);
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
    this.selectedDocumentType.set(null);
  }

  // ==================== CRUD OPERATIONS ====================

  onSave(event: { data: DocumentType; mode: 'create' | 'edit' }): void {
    if (event.mode === 'create') {
      this.createDocumentType(event.data);
    } else {
      this.updateDocumentType(event.data);
    }
  }

  createDocumentType(documentType: DocumentType): void {
    // Check if DOC_CODE already exists
    const exists = this.documentTypes().some(
      doc => doc.DOC_CODE === documentType.DOC_CODE
    );

    if (exists) {
      alert('รหัสเอกสารนี้มีอยู่แล้ว');
      return;
    }

    // Add to list
    const updated = [...this.documentTypes(), documentType];
    this.documentTypes.set(updated);
    this.onSearch(); // Refresh filtered list

    // Show success message
    console.log('สร้างประเภทเอกสารสำเร็จ:', documentType);
  }

  updateDocumentType(documentType: DocumentType): void {
    const updated = this.documentTypes().map(doc =>
      doc.DOC_CODE === documentType.DOC_CODE ? documentType : doc
    );

    this.documentTypes.set(updated);
    this.onSearch(); // Refresh filtered list

    // Show success message
    console.log('แก้ไขประเภทเอกสารสำเร็จ:', documentType);
  }

  deleteDocumentType(documentType: DocumentType): void {
    const confirmed = confirm(
      `คุณต้องการลบประเภทเอกสาร "${documentType.DOC_NAME}" หรือไม่?`
    );

    if (!confirmed) return;

    const updated = this.documentTypes().filter(
      doc => doc.DOC_CODE !== documentType.DOC_CODE
    );

    this.documentTypes.set(updated);
    this.onSearch(); // Refresh filtered list

    // Show success message
    console.log('ลบประเภทเอกสารสำเร็จ:', documentType);
  }

  // ==================== ROW CLICK ====================

  onRowClick(documentType: DocumentType): void {
    this.openEditDrawer(documentType);
  }
}
