// role-drawer.component.ts - Modal กลางหน้าจอ สร้าง/แก้ไข Role (แบบ Copy from Role)
import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Dialog } from 'primeng/dialog';
import { Role } from '@core/models/permission.model';
import { RoleService, CreateRolePayload, UpdateRolePayload } from '@core/services/role.service';

@Component({
  selector: 'app-role-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Button, InputText, Dialog],
  templateUrl: './role-drawer.component.html',
  styleUrl: './role-drawer.component.css',
})
export class RoleDrawerComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() role: Role | null = null;
  @Input() roles: Role[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Role>();

  form: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      isActive: [true],
    });
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.mode === 'edit' && this.role) {
      this.form.patchValue({
        name: this.role.GROUP_NAME,
        isActive: this.role.ACTIVE === 'Y',
      });
    } else {
      this.form.reset({ name: '', isActive: true });
    }
    this.errorMessage = '';
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) return;
    this.isSubmitting = true;
    this.errorMessage = '';

    const raw = this.form.getRawValue();

    if (this.mode === 'create') {
      const payload: CreateRolePayload = {
        name: raw.name.trim(),
        isActive: raw.isActive,
      };
      this.roleService.createRole(payload).subscribe({
        next: (role) => {
          this.isSubmitting = false;
          this.saved.emit(role);
          this.onClose();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err?.message || 'สร้าง role ไม่สำเร็จ';
        },
      });
    } else if (this.role) {
      const payload: UpdateRolePayload = {
        name: raw.name.trim(),
        isActive: raw.isActive,
      };
      this.roleService.updateRole(this.role.USER_GROUP, payload).subscribe({
        next: (role) => {
          this.isSubmitting = false;
          this.saved.emit(role);
          this.onClose();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err?.message || 'อัปเดต role ไม่สำเร็จ';
        },
      });
    }
  }
}
