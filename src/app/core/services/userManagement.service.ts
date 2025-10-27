// user-management.service.ts - Mock service for user account management (CRUD operations)
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { User, UserResponse, UserFormData, DropdownOption } from '@core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private mockUsers: User[] = [
    {
      MyFile: null,
      USER_ID: "BE_GROUP",
      OU_CODE: "001",
      USER_NAME: "BE",
      USER_PASSWORD: "/6QZ7eNU3A0=",
      DEPARTMENT: "Building Engineer",
      INACTIVE: "N",
      USER_LIN: "TH",
      USER_GROUP: "BE",
      UPD_BY: "SPACE",
      UPD_DATE: "\/Date(1750132130000)\/",
      LAST_EXP_DATE: null,
      EXP_WITHIN_YEAR: null,
      EXP_WITHIN_MONTH: null,
      EXP_WITHIN_DAY: 90,
      NEVER_EXPIRE: "N",
      APP_LEVEL: "0",
      EMAIL: null,
      PATH_IMG: null,
      IS_AGREE: null,
      USER_PIN: null,
      MOBILE_IMEI: null,
      MOBILE_DETAIL: null,
      MOBILE_LOGIN: null,
      TOKEN: null,
      LAST_LOG_IN: null,
      DataState: 3,
      ReadOnly: false,
      IsSelected: false
    },
    {
      MyFile: null,
      USER_ID: "CS_GROUP",
      OU_CODE: "001",
      USER_NAME: "CS",
      USER_PASSWORD: "/6QZ7eNU3A0=",
      DEPARTMENT: "Customer Service",
      INACTIVE: "N",
      USER_LIN: "TH",
      USER_GROUP: "CS",
      UPD_BY: "SPACE",
      UPD_DATE: "\/Date(1750132174000)\/",
      LAST_EXP_DATE: null,
      EXP_WITHIN_YEAR: null,
      EXP_WITHIN_MONTH: null,
      EXP_WITHIN_DAY: 90,
      NEVER_EXPIRE: "N",
      APP_LEVEL: "0",
      EMAIL: null,
      PATH_IMG: null,
      IS_AGREE: null,
      USER_PIN: null,
      MOBILE_IMEI: null,
      MOBILE_DETAIL: null,
      MOBILE_LOGIN: null,
      TOKEN: null,
      LAST_LOG_IN: null,
      DataState: 3,
      ReadOnly: false,
      IsSelected: false
    },
    {
      MyFile: null,
      USER_ID: "SPACE",
      OU_CODE: "001",
      USER_NAME: "SPACE",
      USER_PASSWORD: "/6QZ7eNU3A0=",
      DEPARTMENT: "G-ABLE",
      INACTIVE: "N",
      USER_LIN: "th",
      USER_GROUP: "Consult",
      UPD_BY: "SPACE",
      UPD_DATE: "\/Date(1761549270000)\/",
      LAST_EXP_DATE: null,
      EXP_WITHIN_YEAR: null,
      EXP_WITHIN_MONTH: null,
      EXP_WITHIN_DAY: 0,
      NEVER_EXPIRE: "N",
      APP_LEVEL: "3",
      EMAIL: "thananut.c@g-able.com; sayoomporn.t@g-able.com",
      PATH_IMG: "~/ImagesUpload//USER//001//A/PS005483_11.jpeg",
      IS_AGREE: null,
      USER_PIN: null,
      MOBILE_IMEI: null,
      MOBILE_DETAIL: null,
      MOBILE_LOGIN: null,
      TOKEN: null,
      LAST_LOG_IN: "\/Date(1761573075000)\/",
      DataState: 3,
      ReadOnly: false,
      IsSelected: false
    }
  ];

  constructor() {}

  // Get all users with filters
  getUsers(filters?: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Observable<UserResponse> {
    let filteredUsers = [...this.mockUsers];

    // Apply search filter
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.USER_NAME.toLowerCase().includes(searchLower) ||
        user.USER_ID.toLowerCase().includes(searchLower) ||
        user.DEPARTMENT.toLowerCase().includes(searchLower)
      );
    }

    // Apply role filter
    if (filters?.role && filters.role !== 'all') {
      filteredUsers = filteredUsers.filter(user =>
        user.USER_GROUP === filters.role
      );
    }

    // Apply status filter
    if (filters?.status && filters.status !== 'all') {
      const inactiveFlag = filters.status === 'active' ? 'N' : 'Y';
      filteredUsers = filteredUsers.filter(user =>
        user.INACTIVE === inactiveFlag
      );
    }

    // Apply pagination
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Simulate API delay
    return of({
      data: paginatedUsers,
      total: filteredUsers.length
    }).pipe(delay(300));
  }

  // Get user by ID
  getUserById(userId: string): Observable<User | undefined> {
    const user = this.mockUsers.find(u => u.USER_ID === userId);
    return of(user).pipe(delay(200));
  }

  // Create new user
  createUser(userData: UserFormData): Observable<{ success: boolean; message: string }> {
    // Simulate API call
    console.log('Creating user:', userData);
    return of({
      success: true,
      message: 'User created successfully'
    }).pipe(delay(500));
  }

  // Update user
  updateUser(userId: string, userData: UserFormData): Observable<{ success: boolean; message: string }> {
    // Simulate API call
    console.log('Updating user:', userId, userData);
    return of({
      success: true,
      message: 'User updated successfully'
    }).pipe(delay(500));
  }

  // Delete single user
  deleteUser(userId: string): Observable<{ success: boolean; message: string }> {
    // Simulate API call
    console.log('Deleting user:', userId);
    return of({
      success: true,
      message: 'User deleted successfully'
    }).pipe(delay(500));
  }

  // Delete multiple users
  deleteUsers(userIds: string[]): Observable<{ success: boolean; message: string }> {
    // Simulate API call
    console.log('Deleting users:', userIds);
    return of({
      success: true,
      message: `${userIds.length} user(s) deleted successfully`
    }).pipe(delay(500));
  }

  // Get role options for dropdown
  getRoleOptions(): Observable<DropdownOption[]> {
    const roles: DropdownOption[] = [
      { label: 'All Roles', value: 'all' },
      { label: 'Building Engineer (BE)', value: 'BE' },
      { label: 'Customer Service (CS)', value: 'CS' },
      { label: 'Facility (FC)', value: 'FC' },
      { label: 'Consultant', value: 'Consult' },
      { label: 'Marketing', value: 'MARKETING' }
    ];
    return of(roles).pipe(delay(100));
  }

  // Get department options for dropdown
  getDepartmentOptions(): Observable<DropdownOption[]> {
    const departments: DropdownOption[] = [
      { label: 'Building Engineer', value: 'Building Engineer' },
      { label: 'Customer Service', value: 'Customer Service' },
      { label: 'Facility', value: 'Facility' },
      { label: 'Working Solution', value: 'Working Solution' },
      { label: 'Marketing and Sales', value: 'Marketing and Salses' },
      { label: 'G-ABLE', value: 'G-ABLE' },
      { label: 'Accounting', value: 'บัญชี' }
    ];
    return of(departments).pipe(delay(100));
  }
}
