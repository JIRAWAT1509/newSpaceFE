// role.service.ts - API สำหรับ role CRUD แก้ endpoint ได้ที่ API_ROLE_BASE
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '@env/environment';
import { Role } from '@core/models/permission.model';

const API_ROLE_BASE = `${environment.apiBaseUrl}/roles`;
const STORAGE_KEY = 'space_role_management_roles';

const DEFAULT_ROLES: Role[] = [
  { USER_GROUP: 'ADMIN', GROUP_NAME: 'Administrator', DESCRIPTION: 'Full system access', ACTIVE: 'Y', memberCount: 2 },
  { USER_GROUP: 'BE', GROUP_NAME: 'Building Engineer', DESCRIPTION: 'Building and facility management', ACTIVE: 'Y', memberCount: 1 },
  { USER_GROUP: 'CS', GROUP_NAME: 'Customer Service', DESCRIPTION: 'Customer support', ACTIVE: 'Y', memberCount: 0 },
  { USER_GROUP: 'VIEWER', GROUP_NAME: 'Viewer', DESCRIPTION: 'Read-only access', ACTIVE: 'Y', memberCount: 1 },
];

function loadRolesFromStorage(): Role[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Role[];
      if (Array.isArray(parsed) && parsed.length >= 0) return parsed;
    }
  } catch (_) {}
  const initial = [...DEFAULT_ROLES];
  saveRolesToStorage(initial);
  return initial;
}

function saveRolesToStorage(roles: Role[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
  } catch (_) {}
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  isActive?: boolean;
  copyFromRoleId?: string;
}

export interface UpdateRolePayload {
  name: string;
  description?: string;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private http = inject(HttpClient);

  getRoles(): Observable<Role[]> {
    // TODO: เปลี่ยนเป็น this.http.get<{ data: Role[] }>(API_ROLE_BASE).pipe(map(r => r.data));
    const roles = loadRolesFromStorage();
    return of(roles).pipe(delay(300));
  }

  createRole(payload: CreateRolePayload): Observable<Role> {
    // TODO: this.http.post<Role>(API_ROLE_BASE, payload);
    const roles = loadRolesFromStorage();
    const id = payload.name.replace(/\s+/g, '_').toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 20) || 'ROLE';
    const exists = roles.some(r => r.USER_GROUP === id);
    const uniqueId = exists ? `${id}_${Date.now().toString(36)}` : id;
    const role: Role = {
      USER_GROUP: uniqueId,
      GROUP_NAME: payload.name,
      DESCRIPTION: payload.description,
      ACTIVE: payload.isActive !== false ? 'Y' : 'N',
      memberCount: 0,
    };
    saveRolesToStorage([...roles, role]);
    return of(role).pipe(delay(400));
  }

  updateRole(id: string, payload: UpdateRolePayload): Observable<Role> {
    // TODO: this.http.put<Role>(`${API_ROLE_BASE}/${id}`, payload);
    const roles = loadRolesFromStorage();
    const idx = roles.findIndex(r => r.USER_GROUP === id);
    if (idx === -1) return of({ USER_GROUP: id, GROUP_NAME: payload.name, DESCRIPTION: payload.description, ACTIVE: payload.isActive !== false ? 'Y' : 'N', memberCount: 0 });
    const prev = roles[idx];
    const updated: Role = {
      ...prev,
      GROUP_NAME: payload.name,
      DESCRIPTION: payload.description,
      ACTIVE: payload.isActive !== false ? 'Y' : 'N',
      memberCount: prev.memberCount ?? 0,
    };
    roles[idx] = updated;
    saveRolesToStorage(roles);
    return of(updated).pipe(delay(400));
  }

  toggleRoleActive(id: string, isActive: boolean): Observable<void> {
    // TODO: this.http.patch<void>(`${API_ROLE_BASE}/${id}/active`, { isActive });
    const roles = loadRolesFromStorage();
    const idx = roles.findIndex(r => r.USER_GROUP === id);
    if (idx === -1) return of(undefined).pipe(delay(300));
    roles[idx] = { ...roles[idx], ACTIVE: isActive ? 'Y' : 'N' };
    saveRolesToStorage(roles);
    return of(undefined).pipe(delay(300));
  }

  deleteRole(id: string): Observable<void> {
    // TODO: this.http.delete<void>(`${API_ROLE_BASE}/${id}`);
    const roles = loadRolesFromStorage().filter(r => r.USER_GROUP !== id);
    saveRolesToStorage(roles);
    return of(undefined).pipe(delay(300));
  }
}
