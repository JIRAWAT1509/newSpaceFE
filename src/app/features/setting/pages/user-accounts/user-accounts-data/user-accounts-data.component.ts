// user-accounts-data.component.ts - Main user management page
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { debounceTime, Subject } from 'rxjs';

import { User, UserFormData, DropdownOption } from '@core/models/user.model';
import { UserManagementService } from '@core/services/userManagement.service';
import { UserCardComponent } from './components/user-card.component';
import { UserFormDrawerComponent } from './components/user-form-drawer/user-form-drawer.component';

@Component({
  selector: 'app-user-accounts-data',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Select,
    Button,
    UserCardComponent,
    UserFormDrawerComponent,
],
  templateUrl: './user-accounts-data.component.html',
  styleUrl: './user-accounts-data.component.css'
})
export class UserAccountsDataComponent implements OnInit {
  // Data
  users: User[] = [];
  filteredUsers: User[] = [];
  totalUsers: number = 0;

  // Filters
  searchQuery: string = '';
  selectedRole: string = 'all';
  itemsPerPage: number = 12;
  selectedStatus: string = 'all';
  currentPage: number = 1;

  // Dropdown options
  roleOptions: DropdownOption[] = [];
  statusOptions: DropdownOption[] = [
    { label: 'All Status', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];
  itemsPerPageOptions: DropdownOption[] = [
    { label: '12 items', value: '12' },
    { label: '48 items', value: '48' },
    { label: '72 items', value: '72' }
  ];

  // UI State
  isLoading: boolean = false;
  isDrawerOpen: boolean = false;
  drawerMode: 'create' | 'edit' = 'create';
  selectedUser: User | null = null;

  // Delete confirmation
  showDeleteModal: boolean = false;
  deleteModalMessage: string = '';
  userToDelete: User | null = null;

  // Bulk delete
  showBulkDeleteModal: boolean = false;

  // Search debounce
  private searchSubject = new Subject<string>();

  constructor(private userManagementService: UserManagementService) {
    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.loadUsers();
    });
  }

  ngOnInit(): void {
    this.loadRoleOptions();
    this.loadUsers();
  }

  loadRoleOptions(): void {
    this.userManagementService.getRoleOptions().subscribe({
      next: (roles) => {
        this.roleOptions = roles;
      }
    });
  }

  loadUsers(): void {
    this.isLoading = true;

this.userManagementService.getUsers({
  search: this.searchQuery,
  role: this.selectedRole,
  status: this.selectedStatus,
  page: this.currentPage,
  pageSize: this.itemsPerPage
}).subscribe({

      next: (response) => {
        this.users = response.data;
        this.totalUsers = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
      }
    });
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.searchSubject.next(this.searchQuery);
  }

  onRoleChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  // Pagination
  get totalPages(): number {
    return Math.ceil(this.totalUsers / this.itemsPerPage);
  }

  get paginationStart(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get paginationEnd(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalUsers);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  // Selection
  toggleUserSelection(user: User): void {
    user.IsSelected = !user.IsSelected;
  }

  toggleSelectAll(): void {
    const allSelected = this.users.every(u => u.IsSelected);
    this.users.forEach(u => u.IsSelected = !allSelected);
  }

  get hasSelectedUsers(): boolean {
    return this.users.some(u => u.IsSelected);
  }

  get selectedUserCount(): number {
    return this.users.filter(u => u.IsSelected).length;
  }

  get allUsersSelected(): boolean {
    return this.users.length > 0 && this.users.every(u => u.IsSelected);
  }

  get someUsersSelected(): boolean {
    return this.hasSelectedUsers && !this.users.every(u => u.IsSelected);
  }

  // CRUD Operations
  openCreateDrawer(): void {
    this.drawerMode = 'create';
    this.selectedUser = null;
    this.isDrawerOpen = true;
  }

  openEditDrawer(user: User): void {
    this.drawerMode = 'edit';
    this.selectedUser = user;
    this.isDrawerOpen = true;
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
    this.selectedUser = null;
  }

  onSaveUser(formData: UserFormData): void {
    console.log('User saved:', formData);
    this.loadUsers(); // Reload the list
  }

  // Delete single user
  confirmDeleteUser(user: User): void {
    this.userToDelete = user;
    this.deleteModalMessage = `Are you sure you want to delete user "${user.USER_ID}"?`;
    this.showDeleteModal = true;
  }

  deleteUser(): void {
    if (this.userToDelete) {
      this.userManagementService.deleteUser(this.userToDelete.USER_ID).subscribe({
        next: () => {
          this.showDeleteModal = false;
          this.userToDelete = null;
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  // Delete multiple users
  confirmBulkDelete(): void {
    const selectedCount = this.selectedUserCount;
    if (selectedCount > 0) {
      this.deleteModalMessage = `Are you sure you want to delete ${selectedCount} selected user(s)?`;
      this.showBulkDeleteModal = true;
    }
  }

  bulkDeleteUsers(): void {
    const selectedIds = this.users
      .filter(u => u.IsSelected)
      .map(u => u.USER_ID);

    this.userManagementService.deleteUsers(selectedIds).subscribe({
      next: () => {
        this.showBulkDeleteModal = false;
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error deleting users:', error);
      }
    });
  }

  cancelBulkDelete(): void {
    this.showBulkDeleteModal = false;
  }

  // Close modals on Escape key
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isDrawerOpen) {
      this.closeDrawer();
    }
    if (this.showDeleteModal) {
      this.cancelDelete();
    }
    if (this.showBulkDeleteModal) {
      this.cancelBulkDelete();
    }
  }
}
