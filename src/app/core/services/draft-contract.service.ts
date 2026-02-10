// draft-contract.service.ts - Service for managing contract drafts
import { Injectable, signal } from '@angular/core';

export interface DraftContract {
  id: string;
  name: string; // ชื่อแบบร่าง (auto-generated or user-defined)
  createdAt: string;
  updatedAt: string;
  currentTab: number; // Tab ที่กรอกค้างไว้
  completedTabs: number[]; // Tab ที่กรอกเสร็จแล้ว
  formData: {
    generalDetails: any;
    contractDetails: any;
    conditions: any;
    documents: any;
  };
}

const STORAGE_KEY = 'contract_drafts';

@Injectable({
  providedIn: 'root'
})
export class DraftContractService {
  // Signal for reactive updates
  private draftsSignal = signal<DraftContract[]>([]);

  constructor() {
    this.loadDrafts();
  }

  /** โหลด drafts จาก localStorage */
  private loadDrafts(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.draftsSignal.set(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading drafts:', e);
      this.draftsSignal.set([]);
    }
  }

  /** บันทึก drafts ลง localStorage */
  private saveDrafts(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.draftsSignal()));
    } catch (e) {
      console.error('Error saving drafts:', e);
    }
  }

  /** ดึงรายการ drafts ทั้งหมด */
  getDrafts(): DraftContract[] {
    return this.draftsSignal();
  }

  /** ดึง drafts signal สำหรับ reactive updates */
  getDraftsSignal() {
    return this.draftsSignal;
  }

  /** ดึง draft ตาม ID */
  getDraftById(id: string): DraftContract | undefined {
    return this.draftsSignal().find(d => d.id === id);
  }

  /** สร้าง draft ใหม่ */
  createDraft(formData: DraftContract['formData'], currentTab: number = 0, completedTabs: number[] = []): DraftContract {
    const now = new Date().toISOString();
    const draftCount = this.draftsSignal().length + 1;
    
    const draft: DraftContract = {
      id: `draft_${Date.now()}`,
      name: `แบบร่างสัญญา #${draftCount}`,
      createdAt: now,
      updatedAt: now,
      currentTab,
      completedTabs,
      formData
    };

    this.draftsSignal.update(drafts => [draft, ...drafts]);
    this.saveDrafts();

    return draft;
  }

  /** อัปเดต draft ที่มีอยู่ */
  updateDraft(id: string, formData: Partial<DraftContract['formData']>, currentTab?: number, completedTabs?: number[]): DraftContract | null {
    const index = this.draftsSignal().findIndex(d => d.id === id);
    if (index === -1) return null;

    const updated = {
      ...this.draftsSignal()[index],
      updatedAt: new Date().toISOString(),
      formData: {
        ...this.draftsSignal()[index].formData,
        ...formData
      }
    };

    if (currentTab !== undefined) {
      updated.currentTab = currentTab;
    }
    if (completedTabs !== undefined) {
      updated.completedTabs = completedTabs;
    }

    this.draftsSignal.update(drafts => {
      const newDrafts = [...drafts];
      newDrafts[index] = updated;
      return newDrafts;
    });

    this.saveDrafts();
    return updated;
  }

  /** เปลี่ยนชื่อ draft */
  renameDraft(id: string, newName: string): boolean {
    const index = this.draftsSignal().findIndex(d => d.id === id);
    if (index === -1) return false;

    this.draftsSignal.update(drafts => {
      const newDrafts = [...drafts];
      newDrafts[index] = {
        ...newDrafts[index],
        name: newName,
        updatedAt: new Date().toISOString()
      };
      return newDrafts;
    });

    this.saveDrafts();
    return true;
  }

  /** ลบ draft */
  deleteDraft(id: string): boolean {
    const index = this.draftsSignal().findIndex(d => d.id === id);
    if (index === -1) return false;

    this.draftsSignal.update(drafts => drafts.filter(d => d.id !== id));
    this.saveDrafts();
    return true;
  }

  /** ลบ drafts ทั้งหมด */
  clearAllDrafts(): void {
    this.draftsSignal.set([]);
    this.saveDrafts();
  }

  /** นับจำนวน drafts */
  getDraftCount(): number {
    return this.draftsSignal().length;
  }

  /** Format date for display */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
}
