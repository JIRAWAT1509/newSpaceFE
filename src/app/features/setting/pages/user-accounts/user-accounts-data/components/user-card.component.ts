// user-card.component.ts - Individual user card in grid
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '@core/models/user.model';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 relative border border-gray-200"
      [class.ring-2]="user.IsSelected"
      [class.ring-blue-500]="user.IsSelected"
    >
      <!-- Checkbox for Selection -->
      <div class="absolute top-3 left-3">
        <input
          type="checkbox"
          [checked]="user.IsSelected"
          (change)="onSelect()"
          class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
        />
      </div>

      <!-- Avatar -->
      <div class="flex justify-center mb-3 pt-2">
        <div class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          <img
            *ngIf="user.PATH_IMG"
            [src]="user.PATH_IMG"
            [alt]="user.USER_NAME"
            class="w-full h-full object-cover"
          />
          <svg
            *ngIf="!user.PATH_IMG"
            class="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      </div>

      <!-- User Info -->
      <div class="text-center mb-3">
        <h3 class="text-lg font-bold text-gray-900 truncate" [title]="user.USER_ID">
          {{ user.USER_ID }}
        </h3>
        <p class="text-sm text-gray-600 truncate" [title]="user.DEPARTMENT">
          {{ user.DEPARTMENT }}
        </p>
      </div>

      <!-- Details -->
      <div class="space-y-2 mb-4">
        <div class="flex items-center justify-between text-xs">
          <span class="text-gray-500">Role:</span>
          <span class="font-medium text-gray-700">{{ user.USER_GROUP }}</span>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-gray-500">Sessions:</span>
          <span class="font-medium text-gray-700">{{ user.EXP_WITHIN_DAY }}</span>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-gray-500">Status:</span>
          <span
            class="px-2 py-0.5 rounded-full text-xs font-semibold"
            [class.bg-green-100]="user.INACTIVE === 'N'"
            [class.text-green-800]="user.INACTIVE === 'N'"
            [class.bg-red-100]="user.INACTIVE === 'Y'"
            [class.text-red-800]="user.INACTIVE === 'Y'"
          >
            {{ user.INACTIVE === 'N' ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 border-t border-gray-200 pt-3">
        <button
          (click)="onEdit()"
          class="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
        <button
          (click)="onDelete()"
          class="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
          title="Delete"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  `
})
export class UserCardComponent {
  @Input() user!: User;
  @Output() edit = new EventEmitter<User>();
  @Output() delete = new EventEmitter<User>();
  @Output() select = new EventEmitter<User>();

  onEdit(): void {
    this.edit.emit(this.user);
  }

  onDelete(): void {
    this.delete.emit(this.user);
  }

  onSelect(): void {
    this.select.emit(this.user);
  }
}
