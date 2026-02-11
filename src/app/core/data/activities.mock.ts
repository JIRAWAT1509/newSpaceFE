// activities.mock.ts - REALISTIC MOCK DATA with Check-Ins

import { DateTime } from 'luxon';

// ==================== TYPES ====================

export type ActivityType = 'personal' | 'assignment';
export type ActivityStatus = 'pending' | 'in-progress' | 'finished' | 'canceled' | 'returned';

// ==================== LOCATION & CHECK-IN ====================

export interface ActivityLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
  isDefault?: boolean;
}

export interface CheckInRecord {
  id: string;
  userId: string;
  userName: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  date: string;
  address?: string;
  distanceFromLocation?: number;
}

// ==================== ACTIVITY ====================

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ActivityStatus;
  color?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string[];
  assignedToRoles?: string[];
  finishRequirement?: ActivityRequirement;
  location?: ActivityLocation;
  checkIns: CheckInRecord[];
  finishedAt?: string;
  canceledAt?: string;
  cancelReason?: string;
  returnReason?: string;
  files: ActivityFile[];
  comments: ActivityComment[];
}

export interface ActivityRequirement {
  type: 'none' | 'text' | 'file' | 'both';
  description?: string;
}

export interface ActivityFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface ActivityComment {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
}

// ==================== TEAM ACTIVITY FEED ====================

export interface TeamActivityFeedItem {
  id: string;
  activityId: string;
  activityTitle: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: 'created' | 'updated' | 'finished' | 'canceled' | 'returned' | 'checked-in';
  description: string;
  timestamp: string;
}

// ==================== MOCK LOCATIONS ====================

export const MOCK_DEFAULT_LOCATIONS: ActivityLocation[] = [
  {
    id: 'loc-default-1',
    name: 'Head Office',
    address: '123 Business District, Bangkok 10500',
    lat: 13.7367,
    lng: 100.5606,
    isDefault: true
  },
  {
    id: 'loc-default-2',
    name: 'Sales Office Silom',
    address: '456 Silom Road, Bangkok 10500',
    lat: 13.7278,
    lng: 100.5341,
    isDefault: true
  },
  {
    id: 'loc-default-3',
    name: 'Warehouse Lat Krabang',
    address: '789 Lat Krabang, Bangkok 10520',
    lat: 13.7294,
    lng: 100.7502,
    isDefault: true
  },
  {
    id: 'loc-default-4',
    name: 'Training Center',
    address: '321 Sukhumvit Road, Bangkok 10110',
    lat: 13.7240,
    lng: 100.5510,
    isDefault: true
  },
  {
    id: 'loc-default-5',
    name: 'Central World',
    address: 'Ratchadamri Road, Bangkok 10330',
    lat: 13.7469,
    lng: 100.5398,
    isDefault: true
  },
  {
    id: 'loc-default-6',
    name: 'Siam Paragon',
    address: '991 Rama I Road, Bangkok 10330',
    lat: 13.7465,
    lng: 100.5347,
    isDefault: true
  }
];

// ==================== MOCK ACTIVITIES (30 Activities) ====================

export const MOCK_ACTIVITIES: Activity[] = [
  // ===== TODAY'S ACTIVITIES =====

  // 1. Multi-day assignment with check-ins (Day 3 of 3)
  {
    id: 'act-001',
    type: 'assignment',
    title: 'Client Meeting - ABC Corp Roadshow',
    description: '3-day roadshow visiting ABC Corp offices across Bangkok',
    startDate: DateTime.now().minus({ days: 2 }).set({ hour: 9, minute: 0 }).toISO()!,
    endDate: DateTime.now().set({ hour: 17, minute: 0 }).toISO()!,
    status: 'in-progress',
    color: '#3b82f6',
    createdBy: 'user-001',
    createdByName: 'John Manager',
    createdAt: DateTime.now().minus({ days: 5 }).toISO()!,
    updatedAt: DateTime.now().minus({ hours: 2 }).toISO()!,
    assignedTo: ['user-002', 'user-003'],
    finishRequirement: { type: 'text', description: 'Summarize meeting outcomes' },
    location: MOCK_DEFAULT_LOCATIONS[4], // Central World
    checkIns: [
      {
        id: 'checkin-001',
        userId: 'user-002',
        userName: 'Sales Rep A',
        latitude: 13.7470,
        longitude: 100.5399,
        timestamp: DateTime.now().minus({ days: 2 }).set({ hour: 9, minute: 5 }).toISO()!,
        date: DateTime.now().minus({ days: 2 }).toFormat('yyyy-MM-dd'),
        address: 'Central World, Pathum Wan, Bangkok',
        distanceFromLocation: 15
      },
      {
        id: 'checkin-002',
        userId: 'user-002',
        userName: 'Sales Rep A',
        latitude: 13.7468,
        longitude: 100.5397,
        timestamp: DateTime.now().minus({ days: 1 }).set({ hour: 9, minute: 10 }).toISO()!,
        date: DateTime.now().minus({ days: 1 }).toFormat('yyyy-MM-dd'),
        address: 'Central World, Pathum Wan, Bangkok',
        distanceFromLocation: 8
      }
    ],
    files: [],
    comments: []
  },

  // 2. Today's product demo - already checked in
  {
    id: 'act-002',
    type: 'assignment',
    title: 'Product Demo at Siam Paragon',
    description: 'Showcase new product line to potential clients',
    startDate: DateTime.now().set({ hour: 10, minute: 0 }).toISO()!,
    endDate: DateTime.now().set({ hour: 15, minute: 0 }).toISO()!,
    status: 'in-progress',
    color: '#3b82f6',
    createdBy: 'user-001',
    createdByName: 'John Manager',
    createdAt: DateTime.now().minus({ days: 3 }).toISO()!,
    updatedAt: DateTime.now().toISO()!,
    assignedTo: ['user-003'],
    location: MOCK_DEFAULT_LOCATIONS[5], // Siam Paragon
    checkIns: [
      {
        id: 'checkin-003',
        userId: 'user-003',
        userName: 'Sales Rep B',
        latitude: 13.7466,
        longitude: 100.5348,
        timestamp: DateTime.now().set({ hour: 10, minute: 2 }).toISO()!,
        date: DateTime.now().toFormat('yyyy-MM-dd'),
        address: 'Siam Paragon, Pathum Wan, Bangkok',
        distanceFromLocation: 12
      }
    ],
    files: [],
    comments: []
  },

  // 3. Personal task at office - checked in
  {
    id: 'act-003',
    type: 'personal',
    title: 'Review Q4 Budget Report',
    description: 'Analyze department spending and prepare adjustments',
    startDate: DateTime.now().set({ hour: 14, minute: 0 }).toISO()!,
    endDate: DateTime.now().set({ hour: 16, minute: 0 }).toISO()!,
    status: 'in-progress',
    color: '#8b5cf6',
    createdBy: 'user-002',
    createdByName: 'Sales Rep A',
    createdAt: DateTime.now().minus({ hours: 4 }).toISO()!,
    updatedAt: DateTime.now().toISO()!,
    location: MOCK_DEFAULT_LOCATIONS[0], // Head Office
    checkIns: [
      {
        id: 'checkin-004',
        userId: 'user-002',
        userName: 'Sales Rep A',
        latitude: 13.7368,
        longitude: 100.5607,
        timestamp: DateTime.now().set({ hour: 14, minute: 1 }).toISO()!,
        date: DateTime.now().toFormat('yyyy-MM-dd'),
        address: 'Business District, Bangkok',
        distanceFromLocation: 5
      }
    ],
    files: [],
    comments: []
  },

  // 4. Warehouse inspection - NOT checked in (warning!)
  {
    id: 'act-004',
    type: 'assignment',
    title: 'Warehouse Inspection - Inventory Check',
    description: 'Verify stock levels and update system',
    startDate: DateTime.now().minus({ hours: 2 }).set({ minute: 0 }).toISO()!,
    endDate: DateTime.now().plus({ hours: 1 }).set({ minute: 0 }).toISO()!,
    status: 'in-progress',
    color: '#3b82f6',
    createdBy: 'user-001',
    createdByName: 'John Manager',
    createdAt: DateTime.now().minus({ days: 2 }).toISO()!,
    updatedAt: DateTime.now().minus({ hours: 2 }).toISO()!,
    assignedTo: ['user-004'],
    location: MOCK_DEFAULT_LOCATIONS[2], // Warehouse
    checkIns: [],
    files: [],
    comments: []
  },

  // 5. Afternoon meeting - upcoming
  {
    id: 'act-005',
    type: 'assignment',
    title: 'Team Sync - Sales Strategy',
    description: 'Discuss Q1 sales targets and action plans',
    startDate: DateTime.now().plus({ hours: 3 }).toISO()!,
    endDate: DateTime.now().plus({ hours: 4 }).toISO()!,
    status: 'pending',
    color: '#3b82f6',
    createdBy: 'user-001',
    createdByName: 'John Manager',
    createdAt: DateTime.now().minus({ days: 1 }).toISO()!,
    updatedAt: DateTime.now().minus({ days: 1 }).toISO()!,
    assignedTo: ['user-002', 'user-003', 'user-004'],
    location: MOCK_DEFAULT_LOCATIONS[0], // Head Office
    checkIns: [],
    files: [],
    comments: []
  },

  // ===== YESTERDAY'S ACTIVITIES =====

  // 6. Customer visit - completed with check-in
  {
    id: 'act-006',
    type: 'assignment',
    title: 'Customer Visit - XYZ Ltd',
    description: 'Quarterly business review and contract discussion',
    startDate: DateTime.now().minus({ days: 1 }).set({ hour: 10, minute: 0 }).toISO()!,
    endDate: DateTime.now().minus({ days: 1 }).set({ hour: 12, minute: 0 }).toISO()!,
    status: 'finished',
    color: '#3b82f6',
    createdBy: 'user-001',
    createdByName: 'John Manager',
    createdAt: DateTime.now().minus({ days: 3 }).toISO()!,
    updatedAt: DateTime.now().minus({ days: 1 }).toISO()!,
    finishedAt: DateTime.now().minus({ days: 1 }).set({ hour: 12, minute: 0 }).toISO()!,
    assignedTo: ['user-002'],
    location: MOCK_DEFAULT_LOCATIONS[1], // Sales Office Silom
    checkIns: [
      {
        id: 'checkin-005',
        userId: 'user-002',
        userName: 'Sales Rep A',
        latitude: 13.7279,
        longitude: 100.5342,
        timestamp: DateTime.now().minus({ days: 1 }).set({ hour: 10, minute: 3 }).toISO()!,
        date: DateTime.now().minus({ days: 1 }).toFormat('yyyy-MM-dd'),
        address: 'Silom Road, Bang Rak, Bangkok',
        distanceFromLocation: 10
      }
    ],
    files: [],
    comments: []
  },

  // 7. Training session - completed
  {
    id: 'act-007',
    type: 'personal',
    title: 'CRM System Training',
    description: 'Learn new features and best practices',
    startDate: DateTime.now().minus({ days: 1 }).set({ hour: 13, minute: 0 }).toISO()!,
    endDate: DateTime.now().minus({ days: 1 }).set({ hour: 16, minute: 0 }).toISO()!,
    status: 'finished',
    color: '#8b5cf6',
    createdBy: 'user-003',
    createdByName: 'Sales Rep B',
    createdAt: DateTime.now().minus({ days: 4 }).toISO()!,
    updatedAt: DateTime.now().minus({ days: 1 }).toISO()!,
    finishedAt: DateTime.now().minus({ days: 1 }).set({ hour: 16, minute: 0 }).toISO()!,
    location: MOCK_DEFAULT_LOCATIONS[3], // Training Center
    checkIns: [
      {
        id: 'checkin-006',
        userId: 'user-003',
        userName: 'Sales Rep B',
        latitude: 13.7241,
        longitude: 100.5511,
        timestamp: DateTime.now().minus({ days: 1 }).set({ hour: 13, minute: 2 }).toISO()!,
        date: DateTime.now().minus({ days: 1 }).toFormat('yyyy-MM-dd'),
        address: 'Sukhumvit Road, Khlong Toei, Bangkok',
        distanceFromLocation: 7
      }
    ],
    files: [],
    comments: []
  },

  // ===== TOMORROW'S ACTIVITIES =====

  // 8. Site visit scheduled
  {
    id: 'act-008',
    type: 'assignment',
    title: 'Site Visit - New Property Development',
    description: 'Survey potential office space for expansion',
    startDate: DateTime.now().plus({ days: 1 }).set({ hour: 9, minute: 0 }).toISO()!,
    endDate: DateTime.now().plus({ days: 1 }).set({ hour: 12, minute: 0 }).toISO()!,
    status: 'pending',
    color: '#3b82f6',
    createdBy: 'user-001',
    createdByName: 'John Manager',
    createdAt: DateTime.now().toISO()!,
    updatedAt: DateTime.now().toISO()!,
    assignedTo: ['user-002', 'user-004'],
    location: MOCK_DEFAULT_LOCATIONS[4], // Central World
    checkIns: [],
    files: [],
    comments: []
  },

  // 9. Client presentation
  {
    id: 'act-009',
    type: 'assignment',
    title: 'Client Presentation - Q1 Proposal',
    description: 'Present annual service package to key client',
    startDate: DateTime.now().plus({ days: 1 }).set({ hour: 14, minute: 0 }).toISO()!,
    endDate: DateTime.now().plus({ days: 1 }).set({ hour: 16, minute: 0 }).toISO()!,
    status: 'pending',
    color: '#3b82f6',
    createdBy: 'user-001',
    createdByName: 'John Manager',
    createdAt: DateTime.now().minus({ hours: 12 }).toISO()!,
    updatedAt: DateTime.now().minus({ hours: 12 }).toISO()!,
    assignedTo: ['user-003'],
    finishRequirement: { type: 'both', description: 'Upload presentation slides and meeting notes' },
    location: MOCK_DEFAULT_LOCATIONS[5], // Siam Paragon
    checkIns: [],
    files: [],
    comments: []
  },

  // ===== LAST WEEK'S ACTIVITIES =====

  // 10. Completed warehouse audit
  {
    id: 'act-010',
    type: 'assignment',
    title: 'Monthly Warehouse Audit',
    description: 'Conduct full inventory count and reconciliation',
    startDate: DateTime.now().minus({ days: 6 }).set({ hour: 8, minute: 0 }).toISO()!,
    endDate: DateTime.now().minus({ days: 6 }).set({ hour: 17, minute: 0 }).toISO()!,
    status: 'finished',
    color: '#3b82f6',
    createdBy: 'user-001',
    createdByName: 'John Manager',
    createdAt: DateTime.now().minus({ days: 10 }).toISO()!,
    updatedAt: DateTime.now().minus({ days: 6 }).toISO()!,
    finishedAt: DateTime.now().minus({ days: 6 }).set({ hour: 17, minute: 0 }).toISO()!,
    assignedTo: ['user-004'],
    location: MOCK_DEFAULT_LOCATIONS[2], // Warehouse
    checkIns: [
      {
        id: 'checkin-007',
        userId: 'user-004',
        userName: 'Logistics Manager',
        latitude: 13.7295,
        longitude: 100.7503,
        timestamp: DateTime.now().minus({ days: 6 }).set({ hour: 8, minute: 5 }).toISO()!,
        date: DateTime.now().minus({ days: 6 }).toFormat('yyyy-MM-dd'),
        address: 'Lat Krabang, Bangkok',
        distanceFromLocation: 18
      }
    ],
    files: [],
    comments: []
  },

  // 11-15: More activities from last week
  {
    id: 'act-011',
    type: 'personal',
    title: 'Update Sales Pipeline',
    description: 'Review and update all active opportunities',
    startDate: DateTime.now().minus({ days: 5 }).set({ hour: 9, minute: 0 }).toISO()!,
    endDate: DateTime.now().minus({ days: 5 }).set({ hour: 11, minute: 0 }).toISO()!,
    status: 'finished',
    color: '#8b5cf6',
    createdBy: 'user-002',
    createdByName: 'Sales Rep A',
    createdAt: DateTime.now().minus({ days: 6 }).toISO()!,
    updatedAt: DateTime.now().minus({ days: 5 }).toISO()!,
    finishedAt: DateTime.now().minus({ days: 5 }).set({ hour: 11, minute: 0 }).toISO()!,
    checkIns: [],
    files: [],
    comments: []
  },

  {
    id: 'act-012',
    type: 'assignment',
    title: 'Partner Meeting - Alliance Corp',
    description: 'Discuss joint marketing campaign',
    startDate: DateTime.now().minus({ days: 4 }).set({ hour: 10, minute: 0 }).toISO()!,
    endDate: DateTime.now().minus({ days: 4 }).set({ hour: 12, minute: 0 }).toISO()!,
    status: 'finished',
    color: '#3b82f6',
    createdBy: 'user-001',
    createdByName: 'John Manager',
    createdAt: DateTime.now().minus({ days: 7 }).toISO()!,
    updatedAt: DateTime.now().minus({ days: 4 }).toISO()!,
    finishedAt: DateTime.now().minus({ days: 4 }).set({ hour: 12, minute: 0 }).toISO()!,
    assignedTo: ['user-002', 'user-003'],
    location: MOCK_DEFAULT_LOCATIONS[0], // Head Office
    checkIns: [
      {
        id: 'checkin-008',
        userId: 'user-002',
        userName: 'Sales Rep A',
        latitude: 13.7367,
        longitude: 100.5606,
        timestamp: DateTime.now().minus({ days: 4 }).set({ hour: 10, minute: 1 }).toISO()!,
        date: DateTime.now().minus({ days: 4 }).toFormat('yyyy-MM-dd'),
        address: 'Business District, Bangkok',
        distanceFromLocation: 3
      },
      {
        id: 'checkin-009',
        userId: 'user-003',
        userName: 'Sales Rep B',
        latitude: 13.7367,
        longitude: 100.5607,
        timestamp: DateTime.now().minus({ days: 4 }).set({ hour: 10, minute: 2 }).toISO()!,
        date: DateTime.now().minus({ days: 4 }).toFormat('yyyy-MM-dd'),
        address: 'Business District, Bangkok',
        distanceFromLocation: 8
      }
    ],
    files: [],
    comments: []
  },

  {
    id: 'act-013',
    type: 'assignment',
    title: 'Trade Show Booth Setup',
    description: 'Prepare booth for annual tech expo',
    startDate: DateTime.now().minus({ days: 3 }).set({ hour: 8, minute: 0 }).toISO()!,
    endDate: DateTime.now().minus({ days: 3 }).set({ hour: 18, minute: 0 }).toISO()!,
    status: 'finished',
    color: '#3b82f6',
    createdBy: 'user-001',
    createdByName: 'John Manager',
    createdAt: DateTime.now().minus({ days: 10 }).toISO()!,
    updatedAt: DateTime.now().minus({ days: 3 }).toISO()!,
    finishedAt: DateTime.now().minus({ days: 3 }).set({ hour: 18, minute: 0 }).toISO()!,
    assignedTo: ['user-003', 'user-004'],
    location: MOCK_DEFAULT_LOCATIONS[4], // Central World
    checkIns: [
      {
        id: 'checkin-010',
        userId: 'user-003',
        userName: 'Sales Rep B',
        latitude: 13.7469,
        longitude: 100.5398,
        timestamp: DateTime.now().minus({ days: 3 }).set({ hour: 8, minute: 10 }).toISO()!,
        date: DateTime.now().minus({ days: 3 }).toFormat('yyyy-MM-dd'),
        address: 'Central World, Pathum Wan, Bangkok',
        distanceFromLocation: 5
      }
    ],
    files: [],
    comments: []
  },

  {
    id: 'act-014',
    type: 'personal',
    title: 'Prepare Monthly Report',
    description: 'Compile sales metrics and analysis',
    startDate: DateTime.now().minus({ days: 3 }).set({ hour: 13, minute: 0 }).toISO()!,
    endDate: DateTime.now().minus({ days: 3 }).set({ hour: 17, minute: 0 }).toISO()!,
    status: 'finished',
    color: '#8b5cf6',
    createdBy: 'user-002',
    createdByName: 'Sales Rep A',
    createdAt: DateTime.now().minus({ days: 5 }).toISO()!,
    updatedAt: DateTime.now().minus({ days: 3 }).toISO()!,
    finishedAt: DateTime.now().minus({ days: 3 }).set({ hour: 17, minute: 0 }).toISO()!,
    checkIns: [],
    files: [],
    comments: []
  },

  {
    id: 'act-015',
    type: 'assignment',
    title: 'Customer Support Training',
    description: 'Train new team members on support procedures',
    startDate: DateTime.now().minus({ days: 2 }).set({ hour: 9, minute: 0 }).toISO()!,
    endDate: DateTime.now().minus({ days: 2 }).set({ hour: 16, minute: 0 }).toISO()!,
    status: 'finished',
    color: '#3b82f6',
    createdBy: 'user-001',
    createdByName: 'John Manager',
    createdAt: DateTime.now().minus({ days: 8 }).toISO()!,
    updatedAt: DateTime.now().minus({ days: 2 }).toISO()!,
    finishedAt: DateTime.now().minus({ days: 2 }).set({ hour: 16, minute: 0 }).toISO()!,
    assignedTo: ['user-003'],
    location: MOCK_DEFAULT_LOCATIONS[3], // Training Center
    checkIns: [
      {
        id: 'checkin-011',
        userId: 'user-003',
        userName: 'Sales Rep B',
        latitude: 13.7240,
        longitude: 100.5510,
        timestamp: DateTime.now().minus({ days: 2 }).set({ hour: 9, minute: 5 }).toISO()!,
        date: DateTime.now().minus({ days: 2 }).toFormat('yyyy-MM-dd'),
        address: 'Sukhumvit Road, Khlong Toei, Bangkok',
        distanceFromLocation: 4
      }
    ],
    files: [],
    comments: []
  },

  // ===== NEXT WEEK'S ACTIVITIES =====

  // 16-20: Upcoming activities
  {
    id: 'act-016',
    type: 'assignment',
    title: 'Board Meeting Preparation',
    description: 'Prepare quarterly review presentation',
    startDate: DateTime.now().plus({ days: 3 }).set({ hour: 9, minute: 0 }).toISO()!,
    endDate: DateTime.now().plus({ days: 3 }).set({ hour: 17, minute: 0 }).toISO()!,
    status: 'pending',
    color: '#3b82f6',
    createdBy: 'user-001',
    createdByName: 'John Manager',
    createdAt: DateTime.now().toISO()!,
    updatedAt: DateTime.now().toISO()!,
    assignedTo: ['user-002'],
    finishRequirement: { type: 'file', description: 'Upload final presentation deck' },
    checkIns: [],
    files: [],
    comments: []
  },

  {
    id: 'act-017',
    type: 'assignment',
    title: 'New Employee Orientation',
    description: 'Welcome and onboard new sales team members',
    startDate: DateTime.now().plus({ days: 4 }).set({ hour: 9, minute: 0 }).toISO()!,
    endDate: DateTime.now().plus({ days: 4 }).set({ hour: 12, minute: 0 }).toISO()!,
    status: 'pending',
    color: '#3b82f6',
    createdBy: 'user-001',
    createdByName: 'John Manager',
    createdAt: DateTime.now().minus({ days: 2 }).toISO()!,
    updatedAt: DateTime.now().minus({ days: 2 }).toISO()!,
    assignedTo: ['user-003', 'user-004'],
    location: MOCK_DEFAULT_LOCATIONS[0], // Head Office
    checkIns: [],
    files: [],
    comments: []
  },

  {
    id: 'act-018',
    type: 'assignment',
    title: 'Product Launch Event',
    description: 'Host launch event for new product line',
    startDate: DateTime.now().plus({ days: 5 }).set({ hour: 14, minute: 0 }).toISO()!,
    endDate: DateTime.now().plus({ days: 5 }).set({ hour: 18, minute: 0 }).toISO()!,
    status: 'pending',
    color: '#3b82f6',
    createdBy: 'user-001',
    createdByName: 'John Manager',
    createdAt: DateTime.now().minus({ days: 7 }).toISO()!,
    updatedAt: DateTime.now().minus({ days: 1 }).toISO()!,
    assignedTo: ['user-002', 'user-003', 'user-004'],
    finishRequirement: { type: 'both', description: 'Event photos and attendee feedback summary' },
    location: MOCK_DEFAULT_LOCATIONS[5], // Siam Paragon
    checkIns: [],
    files: [],
    comments: []
  },

  {
    id: 'act-019',
    type: 'personal',
    title: 'Review Contract Terms',
    description: 'Analyze supplier contracts for renewal',
    startDate: DateTime.now().plus({ days: 6 }).set({ hour: 10, minute: 0 }).toISO()!,
    endDate: DateTime.now().plus({ days: 6 }).set({ hour: 12, minute: 0 }).toISO()!,
    status: 'pending',
    color: '#8b5cf6',
    createdBy: 'user-004',
    createdByName: 'Logistics Manager',
    createdAt: DateTime.now().plus({ days: 1 }).toISO()!,
    updatedAt: DateTime.now().plus({ days: 1 }).toISO()!,
    checkIns: [],
    files: [],
    comments: []
  },

  {
    id: 'act-020',
    type: 'assignment',
    title: 'Sales Team Workshop',
    description: 'Advanced negotiation techniques training',
    startDate: DateTime.now().plus({ days: 7 }).set({ hour: 9, minute: 0 }).toISO()!,
    endDate: DateTime.now().plus({ days: 7 }).set({ hour: 17, minute: 0 }).toISO()!,
    status: 'pending',
    color: '#3b82f6',
    createdBy: 'user-001',
    createdByName: 'John Manager',
    createdAt: DateTime.now().minus({ days: 5 }).toISO()!,
    updatedAt: DateTime.now().minus({ days: 2 }).toISO()!,
    assignedTo: ['user-002', 'user-003'],
    location: MOCK_DEFAULT_LOCATIONS[3], // Training Center
    checkIns: [],
    files: [],
    comments: []
  },

  // ===== ADDITIONAL ACTIVITIES (21-30) =====

  {
    id: 'act-021',
    type: 'personal',
    title: 'Market Research Analysis',
    description: 'Study competitor strategies and market trends',
    startDate: DateTime.now().plus({ days: 2 }).set({ hour: 13, minute: 0 }).toISO()!,
    endDate: DateTime.now().plus({ days: 2 }).set({ hour: 16, minute: 0 }).toISO()!,
    status: 'pending',
    color: '#8b5cf6',
    createdBy: 'user-002',
    createdByName: 'Sales Rep A',
    createdAt: DateTime.now().toISO()!,
    updatedAt: DateTime.now().toISO()!,
    checkIns: [],
    files: [],
    comments: []
  },

  {
    id: 'act-022',
    type: 'assignment',
    title: 'Inventory Reconciliation',
    description: 'Match physical stock with system records',
    startDate: DateTime.now().minus({ days: 7 }).set({ hour: 8, minute: 0 }).toISO()!,
    endDate: DateTime.now().minus({ days: 7 }).set({ hour: 12, minute: 0 }).toISO()!,
    status: 'finished',
    color: '#3b82f6',
    createdBy: 'user-001',
    createdByName: 'John Manager',
    createdAt: DateTime.now().minus({ days: 10 }).toISO()!,
    updatedAt: DateTime.now().minus({ days: 7 }).toISO()!,
    finishedAt: DateTime.now().minus({ days: 7 }).set({ hour: 12, minute: 0 }).toISO()!,
    assignedTo: ['user-004'],
    location: MOCK_DEFAULT_LOCATIONS[2], // Warehouse
    checkIns: [
      {
        id: 'checkin-012',
        userId: 'user-004',
        userName: 'Logistics Manager',
        latitude: 13.7294,
        longitude: 100.7501,
        timestamp: DateTime.now().minus({ days: 7 }).set({ hour: 8, minute: 8 }).toISO()!,
        date: DateTime.now().minus({ days: 7 }).toFormat('yyyy-MM-dd'),
        address: 'Lat Krabang, Bangkok',
        distanceFromLocation: 12
      }
    ],
    files: [],
    comments: []
  },

  {
    id: 'act-023',
    type: 'assignment',
    title: 'Website Content Update',
    description: 'Review and refresh product pages',
    startDate: DateTime.now().plus({ days: 8 }).set({ hour: 10, minute: 0 }).toISO()!,
    endDate: DateTime.now().plus({ days: 8 }).set({ hour: 15, minute: 0 }).toISO()!,
    status: 'pending',
    color: '#3b82f6',
    createdBy: 'user-001',
    createdByName: 'John Manager',
    createdAt: DateTime.now().toISO()!,
    updatedAt: DateTime.now().toISO()!,
    assignedTo: ['user-003'],
    checkIns: [],
    files: [],
    comments: []
  },

  {
    id: 'act-024',
    type: 'personal',
    title: 'Professional Development',
    description: 'Complete online sales certification course',
    startDate: DateTime.now().plus({ days: 9 }).set({ hour: 13, minute: 0 }).toISO()!,
    endDate: DateTime.now().plus({ days: 9 }).set({ hour: 17, minute: 0 }).toISO()!,
    status: 'pending',
    color: '#8b5cf6',
    createdBy: 'user-003',
    createdByName: 'Sales Rep B',
    createdAt: DateTime.now().minus({ days: 3 }).toISO()!,
    updatedAt: DateTime.now().minus({ days: 3 }).toISO()!,
    checkIns: [],
    files: [],
    comments: []
  },

  {
    id: 'act-025',
    type: 'assignment',
    title: 'Customer Feedback Survey',
    description: 'Conduct phone surveys with key accounts',
    startDate: DateTime.now().plus({ days: 10 }).set({ hour: 9, minute: 0 }).toISO()!,
    endDate: DateTime.now().plus({ days: 10 }).set({ hour: 17, minute: 0 }).toISO()!,
    status: 'pending',
    color: '#3b82f6',
    createdBy: 'user-001',
    createdByName: 'John Manager',
    createdAt: DateTime.now().minus({ days: 1 }).toISO()!,
    updatedAt: DateTime.now().minus({ days: 1 }).toISO()!,
    assignedTo: ['user-002', 'user-003'],
    finishRequirement: { type: 'text', description: 'Summary of feedback and action items' },
    checkIns: [],
    files: [],
    comments: []
  },

  {
    id: 'act-026',
    type: 'assignment',
    title: 'Safety Inspection',
    description: 'Annual workplace safety audit',
    startDate: DateTime.now().minus({ days: 8 }).set({ hour: 9, minute: 0 }).toISO()!,
    endDate: DateTime.now().minus({ days: 8 }).set({ hour: 15, minute: 0 }).toISO()!,
    status: 'finished',
    color: '#3b82f6',
    createdBy: 'user-001',
    createdByName: 'John Manager',
    createdAt: DateTime.now().minus({ days: 15 }).toISO()!,
    updatedAt: DateTime.now().minus({ days: 8 }).toISO()!,
    finishedAt: DateTime.now().minus({ days: 8 }).set({ hour: 15, minute: 0 }).toISO()!,
    assignedTo: ['user-004'],
    location: MOCK_DEFAULT_LOCATIONS[2], // Warehouse
    checkIns: [
      {
        id: 'checkin-013',
        userId: 'user-004',
        userName: 'Logistics Manager',
        latitude: 13.7293,
        longitude: 100.7504,
        timestamp: DateTime.now().minus({ days: 8 }).set({ hour: 9, minute: 3 }).toISO()!,
        date: DateTime.now().minus({ days: 8 }).toFormat('yyyy-MM-dd'),
        address: 'Lat Krabang, Bangkok',
        distanceFromLocation: 22
      }
    ],
    files: [],
    comments: []
  },

  {
    id: 'act-027',
    type: 'personal',
    title: 'Email Campaign Planning',
    description: 'Design Q1 email marketing strategy',
    startDate: DateTime.now().plus({ days: 11 }).set({ hour: 10, minute: 0 }).toISO()!,
    endDate: DateTime.now().plus({ days: 11 }).set({ hour: 13, minute: 0 }).toISO()!,
    status: 'pending',
    color: '#8b5cf6',
    createdBy: 'user-003',
    createdByName: 'Sales Rep B',
    createdAt: DateTime.now().toISO()!,
    updatedAt: DateTime.now().toISO()!,
    checkIns: [],
    files: [],
    comments: []
  },

  {
    id: 'act-028',
    type: 'assignment',
    title: 'Vendor Negotiation',
    description: 'Renegotiate terms with main supplier',
    startDate: DateTime.now().plus({ days: 12 }).set({ hour: 14, minute: 0 }).toISO()!,
    endDate: DateTime.now().plus({ days: 12 }).set({ hour: 16, minute: 0 }).toISO()!,
    status: 'pending',
    color: '#3b82f6',
    createdBy: 'user-001',
    createdByName: 'John Manager',
    createdAt: DateTime.now().minus({ days: 2 }).toISO()!,
    updatedAt: DateTime.now().minus({ days: 2 }).toISO()!,
    assignedTo: ['user-004'],
    location: MOCK_DEFAULT_LOCATIONS[1], // Sales Office Silom
    checkIns: [],
    files: [],
    comments: []
  },

  {
    id: 'act-029',
    type: 'assignment',
    title: 'Social Media Content Creation',
    description: 'Develop posts for February campaign',
    startDate: DateTime.now().plus({ days: 13 }).set({ hour: 9, minute: 0 }).toISO()!,
    endDate: DateTime.now().plus({ days: 13 }).set({ hour: 12, minute: 0 }).toISO()!,
    status: 'pending',
    color: '#3b82f6',
    createdBy: 'user-001',
    createdByName: 'John Manager',
    createdAt: DateTime.now().toISO()!,
    updatedAt: DateTime.now().toISO()!,
    assignedTo: ['user-003'],
    checkIns: [],
    files: [],
    comments: []
  },

  {
    id: 'act-030',
    type: 'personal',
    title: 'Performance Review Preparation',
    description: 'Gather data and examples for annual review',
    startDate: DateTime.now().plus({ days: 14 }).set({ hour: 10, minute: 0 }).toISO()!,
    endDate: DateTime.now().plus({ days: 14 }).set({ hour: 12, minute: 0 }).toISO()!,
    status: 'pending',
    color: '#8b5cf6',
    createdBy: 'user-002',
    createdByName: 'Sales Rep A',
    createdAt: DateTime.now().toISO()!,
    updatedAt: DateTime.now().toISO()!,
    checkIns: [],
    files: [],
    comments: []
  }
];

// ==================== TEAM ACTIVITY FEED (30 Items) ====================

export const MOCK_TEAM_ACTIVITY_FEED: TeamActivityFeedItem[] = [
  // Most recent first
  {
    id: 'feed-001',
    activityId: 'act-003',
    activityTitle: 'Review Q4 Budget Report',
    userId: 'user-002',
    userName: 'Sales Rep A',
    action: 'checked-in',
    description: 'Checked in at Head Office (5m away)',
    timestamp: DateTime.now().set({ hour: 14, minute: 1 }).toISO()!
  },
  {
    id: 'feed-002',
    activityId: 'act-002',
    activityTitle: 'Product Demo at Siam Paragon',
    userId: 'user-003',
    userName: 'Sales Rep B',
    action: 'checked-in',
    description: 'Checked in at Siam Paragon (12m away)',
    timestamp: DateTime.now().set({ hour: 10, minute: 2 }).toISO()!
  },
  {
    id: 'feed-003',
    activityId: 'act-005',
    activityTitle: 'Team Sync - Sales Strategy',
    userId: 'user-001',
    userName: 'John Manager',
    action: 'created',
    description: 'Created new assignment for sales team',
    timestamp: DateTime.now().minus({ days: 1 }).toISO()!
  },
  {
    id: 'feed-004',
    activityId: 'act-001',
    activityTitle: 'Client Meeting - ABC Corp Roadshow',
    userId: 'user-002',
    userName: 'Sales Rep A',
    action: 'checked-in',
    description: 'Checked in at Central World (8m away)',
    timestamp: DateTime.now().minus({ days: 1 }).set({ hour: 9, minute: 10 }).toISO()!
  },
  {
    id: 'feed-005',
    activityId: 'act-006',
    activityTitle: 'Customer Visit - XYZ Ltd',
    userId: 'user-002',
    userName: 'Sales Rep A',
    action: 'checked-in',
    description: 'Checked in at Sales Office Silom (10m away)',
    timestamp: DateTime.now().minus({ days: 1 }).set({ hour: 10, minute: 3 }).toISO()!
  },
  {
    id: 'feed-006',
    activityId: 'act-006',
    activityTitle: 'Customer Visit - XYZ Ltd',
    userId: 'user-002',
    userName: 'Sales Rep A',
    action: 'finished',
    description: 'Completed customer visit successfully',
    timestamp: DateTime.now().minus({ days: 1 }).set({ hour: 12, minute: 0 }).toISO()!
  },
  {
    id: 'feed-007',
    activityId: 'act-007',
    activityTitle: 'CRM System Training',
    userId: 'user-003',
    userName: 'Sales Rep B',
    action: 'checked-in',
    description: 'Checked in at Training Center (7m away)',
    timestamp: DateTime.now().minus({ days: 1 }).set({ hour: 13, minute: 2 }).toISO()!
  },
  {
    id: 'feed-008',
    activityId: 'act-007',
    activityTitle: 'CRM System Training',
    userId: 'user-003',
    userName: 'Sales Rep B',
    action: 'finished',
    description: 'Completed CRM training session',
    timestamp: DateTime.now().minus({ days: 1 }).set({ hour: 16, minute: 0 }).toISO()!
  },
  {
    id: 'feed-009',
    activityId: 'act-001',
    activityTitle: 'Client Meeting - ABC Corp Roadshow',
    userId: 'user-002',
    userName: 'Sales Rep A',
    action: 'checked-in',
    description: 'Checked in at Central World (15m away)',
    timestamp: DateTime.now().minus({ days: 2 }).set({ hour: 9, minute: 5 }).toISO()!
  },
  {
    id: 'feed-010',
    activityId: 'act-015',
    activityTitle: 'Customer Support Training',
    userId: 'user-003',
    userName: 'Sales Rep B',
    action: 'checked-in',
    description: 'Checked in at Training Center (4m away)',
    timestamp: DateTime.now().minus({ days: 2 }).set({ hour: 9, minute: 5 }).toISO()!
  },
  {
    id: 'feed-011',
    activityId: 'act-015',
    activityTitle: 'Customer Support Training',
    userId: 'user-003',
    userName: 'Sales Rep B',
    action: 'finished',
    description: 'Completed training successfully',
    timestamp: DateTime.now().minus({ days: 2 }).set({ hour: 16, minute: 0 }).toISO()!
  },
  {
    id: 'feed-012',
    activityId: 'act-013',
    activityTitle: 'Trade Show Booth Setup',
    userId: 'user-003',
    userName: 'Sales Rep B',
    action: 'checked-in',
    description: 'Checked in at Central World (5m away)',
    timestamp: DateTime.now().minus({ days: 3 }).set({ hour: 8, minute: 10 }).toISO()!
  },
  {
    id: 'feed-013',
    activityId: 'act-013',
    activityTitle: 'Trade Show Booth Setup',
    userId: 'user-003',
    userName: 'Sales Rep B',
    action: 'finished',
    description: 'Booth setup completed on time',
    timestamp: DateTime.now().minus({ days: 3 }).set({ hour: 18, minute: 0 }).toISO()!
  },
  {
    id: 'feed-014',
    activityId: 'act-014',
    activityTitle: 'Prepare Monthly Report',
    userId: 'user-002',
    userName: 'Sales Rep A',
    action: 'finished',
    description: 'Submitted monthly sales report',
    timestamp: DateTime.now().minus({ days: 3 }).set({ hour: 17, minute: 0 }).toISO()!
  },
  {
    id: 'feed-015',
    activityId: 'act-012',
    activityTitle: 'Partner Meeting - Alliance Corp',
    userId: 'user-002',
    userName: 'Sales Rep A',
    action: 'checked-in',
    description: 'Checked in at Head Office (3m away)',
    timestamp: DateTime.now().minus({ days: 4 }).set({ hour: 10, minute: 1 }).toISO()!
  },
  {
    id: 'feed-016',
    activityId: 'act-012',
    activityTitle: 'Partner Meeting - Alliance Corp',
    userId: 'user-003',
    userName: 'Sales Rep B',
    action: 'checked-in',
    description: 'Checked in at Head Office (8m away)',
    timestamp: DateTime.now().minus({ days: 4 }).set({ hour: 10, minute: 2 }).toISO()!
  },
  {
    id: 'feed-017',
    activityId: 'act-012',
    activityTitle: 'Partner Meeting - Alliance Corp',
    userId: 'user-002',
    userName: 'Sales Rep A',
    action: 'finished',
    description: 'Finalized partnership agreement',
    timestamp: DateTime.now().minus({ days: 4 }).set({ hour: 12, minute: 0 }).toISO()!
  },
  {
    id: 'feed-018',
    activityId: 'act-011',
    activityTitle: 'Update Sales Pipeline',
    userId: 'user-002',
    userName: 'Sales Rep A',
    action: 'finished',
    description: 'Updated all opportunities in system',
    timestamp: DateTime.now().minus({ days: 5 }).set({ hour: 11, minute: 0 }).toISO()!
  },
  {
    id: 'feed-019',
    activityId: 'act-010',
    activityTitle: 'Monthly Warehouse Audit',
    userId: 'user-004',
    userName: 'Logistics Manager',
    action: 'checked-in',
    description: 'Checked in at Warehouse (18m away)',
    timestamp: DateTime.now().minus({ days: 6 }).set({ hour: 8, minute: 5 }).toISO()!
  },
  {
    id: 'feed-020',
    activityId: 'act-010',
    activityTitle: 'Monthly Warehouse Audit',
    userId: 'user-004',
    userName: 'Logistics Manager',
    action: 'finished',
    description: 'Completed inventory audit',
    timestamp: DateTime.now().minus({ days: 6 }).set({ hour: 17, minute: 0 }).toISO()!
  },
  {
    id: 'feed-021',
    activityId: 'act-022',
    activityTitle: 'Inventory Reconciliation',
    userId: 'user-004',
    userName: 'Logistics Manager',
    action: 'checked-in',
    description: 'Checked in at Warehouse (12m away)',
    timestamp: DateTime.now().minus({ days: 7 }).set({ hour: 8, minute: 8 }).toISO()!
  },
  {
    id: 'feed-022',
    activityId: 'act-022',
    activityTitle: 'Inventory Reconciliation',
    userId: 'user-004',
    userName: 'Logistics Manager',
    action: 'finished',
    description: 'All records reconciled successfully',
    timestamp: DateTime.now().minus({ days: 7 }).set({ hour: 12, minute: 0 }).toISO()!
  },
  {
    id: 'feed-023',
    activityId: 'act-026',
    activityTitle: 'Safety Inspection',
    userId: 'user-004',
    userName: 'Logistics Manager',
    action: 'checked-in',
    description: 'Checked in at Warehouse (22m away)',
    timestamp: DateTime.now().minus({ days: 8 }).set({ hour: 9, minute: 3 }).toISO()!
  },
  {
    id: 'feed-024',
    activityId: 'act-026',
    activityTitle: 'Safety Inspection',
    userId: 'user-004',
    userName: 'Logistics Manager',
    action: 'finished',
    description: 'Safety audit passed with recommendations',
    timestamp: DateTime.now().minus({ days: 8 }).set({ hour: 15, minute: 0 }).toISO()!
  },
  {
    id: 'feed-025',
    activityId: 'act-018',
    activityTitle: 'Product Launch Event',
    userId: 'user-001',
    userName: 'John Manager',
    action: 'updated',
    description: 'Updated event location and requirements',
    timestamp: DateTime.now().minus({ days: 1 }).toISO()!
  },
  {
    id: 'feed-026',
    activityId: 'act-008',
    activityTitle: 'Site Visit - New Property Development',
    userId: 'user-001',
    userName: 'John Manager',
    action: 'created',
    description: 'Created new site visit assignment',
    timestamp: DateTime.now().toISO()!
  },
  {
    id: 'feed-027',
    activityId: 'act-004',
    activityTitle: 'Warehouse Inspection - Inventory Check',
    userId: 'user-001',
    userName: 'John Manager',
    action: 'created',
    description: 'Assigned warehouse inspection',
    timestamp: DateTime.now().minus({ days: 2 }).toISO()!
  },
  {
    id: 'feed-028',
    activityId: 'act-020',
    activityTitle: 'Sales Team Workshop',
    userId: 'user-001',
    userName: 'John Manager',
    action: 'updated',
    description: 'Added workshop materials',
    timestamp: DateTime.now().minus({ days: 2 }).toISO()!
  },
  {
    id: 'feed-029',
    activityId: 'act-009',
    activityTitle: 'Client Presentation - Q1 Proposal',
    userId: 'user-001',
    userName: 'John Manager',
    action: 'created',
    description: 'Assigned presentation to Sales Rep B',
    timestamp: DateTime.now().minus({ hours: 12 }).toISO()!
  },
  {
    id: 'feed-030',
    activityId: 'act-001',
    activityTitle: 'Client Meeting - ABC Corp Roadshow',
    userId: 'user-001',
    userName: 'John Manager',
    action: 'created',
    description: 'Created 3-day roadshow assignment',
    timestamp: DateTime.now().minus({ days: 5 }).toISO()!
  }
];
