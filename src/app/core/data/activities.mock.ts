// activities.mock.ts - Mock activity data for activities section

import { DateTime } from 'luxon';

export type ActivityType = 'assignment' | 'personal';
export type ActivityStatus = 'pending' | 'in-progress' | 'finished' | 'canceled' | 'returned';

export interface ActivityRequirement {
  type: 'none' | 'text' | 'file' | 'both';
  description?: string;
}

export interface ActivityFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ActivityComment {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
  type: 'update' | 'cancel' | 'return' | 'finish';
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ActivityStatus;
  createdBy: string;
  createdByName: string;
  assignedTo?: string[]; // user IDs
  assignedToRoles?: string[]; // role IDs
  finishRequirement?: ActivityRequirement;
  files: ActivityFile[];
  comments: ActivityComment[];
  createdAt: string;
  updatedAt: string;
  finishedAt?: string;
  canceledAt?: string;
  cancelReason?: string;
  returnReason?: string;
  color?: string;
}

export const MOCK_ACTIVITIES: Activity[] = [
  // Assignment - Multi-day task
  {
    id: 'act-001',
    type: 'assignment',
    title: 'Prepare Q4 Sales Report',
    description: 'Compile all sales data for Q4 2024 and create comprehensive report with analysis',
    startDate: DateTime.now().minus({ days: 2 }).toISO(),
    endDate: DateTime.now().plus({ days: 3 }).toISO(),
    status: 'in-progress',
    createdBy: 'user-001',
    createdByName: 'John Smith',
    assignedTo: ['user-002', 'user-003', 'user-004'],
    assignedToRoles: ['role-003'],
    finishRequirement: {
      type: 'both',
      description: 'Please submit the completed report in PDF format and include a summary of key findings'
    },
    files: [
      {
        id: 'file-001',
        name: 'Q3_Sales_Data.xlsx',
        size: 2458624,
        type: 'application/vnd.ms-excel',
        uploadedAt: DateTime.now().minus({ days: 2 }).toISO(),
        uploadedBy: 'user-001'
      }
    ],
    comments: [
      {
        id: 'comment-001',
        userId: 'user-002',
        userName: 'Jane Cooper',
        comment: 'Started working on the report',
        createdAt: DateTime.now().minus({ hours: 5 }).toISO(),
        type: 'update'
      }
    ],
    createdAt: DateTime.now().minus({ days: 2 }).toISO(),
    updatedAt: DateTime.now().minus({ hours: 5 }).toISO(),
    color: '#3b82f6'
  },

  // Personal Task - Today
  {
    id: 'act-002',
    type: 'personal',
    title: 'Review Contract #12345',
    description: 'Review and approve customer contract before deadline',
    startDate: DateTime.now().startOf('day').toISO(),
    endDate: DateTime.now().endOf('day').toISO(),
    status: 'pending',
    createdBy: 'user-001',
    createdByName: 'John Smith',
    files: [
      {
        id: 'file-002',
        name: 'Contract_12345.pdf',
        size: 1245896,
        type: 'application/pdf',
        uploadedAt: DateTime.now().minus({ hours: 2 }).toISO(),
        uploadedBy: 'user-001'
      }
    ],
    comments: [],
    createdAt: DateTime.now().minus({ hours: 3 }).toISO(),
    updatedAt: DateTime.now().minus({ hours: 3 }).toISO(),
    color: '#8b5cf6'
  },

  // Assignment - This week
  {
    id: 'act-003',
    type: 'assignment',
    title: 'Client Meeting Preparation',
    description: 'Prepare presentation materials for ABC Corp meeting next week',
    startDate: DateTime.now().plus({ days: 1 }).toISO(),
    endDate: DateTime.now().plus({ days: 5 }).toISO(),
    status: 'pending',
    createdBy: 'user-008',
    createdByName: 'Lisa Anderson',
    assignedTo: ['user-001', 'user-002'],
    finishRequirement: {
      type: 'file',
      description: 'Upload final presentation slides'
    },
    files: [],
    comments: [],
    createdAt: DateTime.now().minus({ hours: 10 }).toISO(),
    updatedAt: DateTime.now().minus({ hours: 10 }).toISO(),
    color: '#3b82f6'
  },

  // Personal - Multi-day
  {
    id: 'act-004',
    type: 'personal',
    title: 'Complete Sales Training Course',
    description: 'Finish online sales training modules 5-8',
    startDate: DateTime.now().toISO(),
    endDate: DateTime.now().plus({ days: 7 }).toISO(),
    status: 'in-progress',
    createdBy: 'user-001',
    createdByName: 'John Smith',
    files: [],
    comments: [
      {
        id: 'comment-002',
        userId: 'user-001',
        userName: 'John Smith',
        comment: 'Completed modules 5 and 6',
        createdAt: DateTime.now().minus({ hours: 12 }).toISO(),
        type: 'update'
      }
    ],
    createdAt: DateTime.now().minus({ days: 1 }).toISO(),
    updatedAt: DateTime.now().minus({ hours: 12 }).toISO(),
    color: '#8b5cf6'
  },

  // Assignment - Finished
  {
    id: 'act-005',
    type: 'assignment',
    title: 'Update Customer Database',
    description: 'Update all customer contact information in CRM system',
    startDate: DateTime.now().minus({ days: 5 }).toISO(),
    endDate: DateTime.now().minus({ days: 1 }).toISO(),
    status: 'finished',
    createdBy: 'user-001',
    createdByName: 'John Smith',
    assignedTo: ['user-006', 'user-007'],
    assignedToRoles: ['role-004'],
    finishRequirement: {
      type: 'text',
      description: 'Provide summary of updates made'
    },
    files: [],
    comments: [
      {
        id: 'comment-003',
        userId: 'user-006',
        userName: 'Emily Davis',
        comment: 'Updated 150+ customer records. All contact information verified and current.',
        createdAt: DateTime.now().minus({ days: 1 }).toISO(),
        type: 'finish'
      }
    ],
    createdAt: DateTime.now().minus({ days: 5 }).toISO(),
    updatedAt: DateTime.now().minus({ days: 1 }).toISO(),
    finishedAt: DateTime.now().minus({ days: 1 }).toISO(),
    color: '#10b981'
  },

  // Assignment - Returned
  {
    id: 'act-006',
    type: 'assignment',
    title: 'Market Research Analysis',
    description: 'Analyze competitor pricing and market trends',
    startDate: DateTime.now().minus({ days: 3 }).toISO(),
    endDate: DateTime.now().plus({ days: 2 }).toISO(),
    status: 'returned',
    createdBy: 'user-008',
    createdByName: 'Lisa Anderson',
    assignedTo: ['user-003'],
    finishRequirement: {
      type: 'both',
      description: 'Submit detailed analysis report with data sources'
    },
    files: [],
    comments: [
      {
        id: 'comment-004',
        userId: 'user-003',
        userName: 'Robert Fox',
        comment: 'Need more specific guidelines on which competitors to analyze and what metrics to focus on',
        createdAt: DateTime.now().minus({ hours: 8 }).toISO(),
        type: 'return'
      }
    ],
    createdAt: DateTime.now().minus({ days: 3 }).toISO(),
    updatedAt: DateTime.now().minus({ hours: 8 }).toISO(),
    returnReason: 'Need more specific guidelines on which competitors to analyze and what metrics to focus on',
    color: '#f97316'
  },

  // Personal - Finished
  {
    id: 'act-007',
    type: 'personal',
    title: 'Expense Report Submission',
    description: 'Submit October expense report',
    startDate: DateTime.now().minus({ days: 2 }).toISO(),
    endDate: DateTime.now().minus({ days: 1 }).toISO(),
    status: 'finished',
    createdBy: 'user-001',
    createdByName: 'John Smith',
    files: [
      {
        id: 'file-003',
        name: 'Expenses_October.pdf',
        size: 854216,
        type: 'application/pdf',
        uploadedAt: DateTime.now().minus({ days: 1 }).toISO(),
        uploadedBy: 'user-001'
      }
    ],
    comments: [],
    createdAt: DateTime.now().minus({ days: 2 }).toISO(),
    updatedAt: DateTime.now().minus({ days: 1 }).toISO(),
    finishedAt: DateTime.now().minus({ days: 1 }).toISO(),
    color: '#10b981'
  },

  // Assignment - Next week
  {
    id: 'act-008',
    type: 'assignment',
    title: 'Sales Team Meeting - November',
    description: 'Monthly sales team meeting to review performance and set goals',
    startDate: DateTime.now().plus({ days: 7 }).set({ hour: 10, minute: 0 }).toISO(),
    endDate: DateTime.now().plus({ days: 7 }).set({ hour: 12, minute: 0 }).toISO(),
    status: 'pending',
    createdBy: 'user-008',
    createdByName: 'Lisa Anderson',
    assignedToRoles: ['role-002', 'role-003'],
    finishRequirement: {
      type: 'none'
    },
    files: [],
    comments: [],
    createdAt: DateTime.now().minus({ days: 7 }).toISO(),
    updatedAt: DateTime.now().minus({ days: 7 }).toISO(),
    color: '#3b82f6'
  },

  // Personal - This week
  {
    id: 'act-009',
    type: 'personal',
    title: 'Follow up with Client XYZ',
    description: 'Call client to discuss contract renewal',
    startDate: DateTime.now().plus({ days: 2 }).toISO(),
    endDate: DateTime.now().plus({ days: 2 }).toISO(),
    status: 'pending',
    createdBy: 'user-001',
    createdByName: 'John Smith',
    files: [],
    comments: [],
    createdAt: DateTime.now().minus({ hours: 5 }).toISO(),
    updatedAt: DateTime.now().minus({ hours: 5 }).toISO(),
    color: '#8b5cf6'
  },

  // Assignment - Canceled
  {
    id: 'act-010',
    type: 'assignment',
    title: 'Product Demo Preparation',
    description: 'Prepare demo materials for canceled client meeting',
    startDate: DateTime.now().minus({ days: 1 }).toISO(),
    endDate: DateTime.now().plus({ days: 1 }).toISO(),
    status: 'canceled',
    createdBy: 'user-001',
    createdByName: 'John Smith',
    assignedTo: ['user-004', 'user-005'],
    finishRequirement: {
      type: 'file',
      description: 'Upload demo slides and product samples'
    },
    files: [],
    comments: [
      {
        id: 'comment-005',
        userId: 'user-001',
        userName: 'John Smith',
        comment: 'Client postponed the meeting indefinitely',
        createdAt: DateTime.now().minus({ hours: 3 }).toISO(),
        type: 'cancel'
      }
    ],
    createdAt: DateTime.now().minus({ days: 3 }).toISO(),
    updatedAt: DateTime.now().minus({ hours: 3 }).toISO(),
    canceledAt: DateTime.now().minus({ hours: 3 }).toISO(),
    cancelReason: 'Client postponed the meeting indefinitely',
    color: '#ef4444'
  },

  // Assignment - Today with time
  {
    id: 'act-011',
    type: 'assignment',
    title: 'Weekly Sales Review',
    description: 'Review weekly sales numbers and KPIs',
    startDate: DateTime.now().set({ hour: 11, minute: 0 }).toISO(),
    endDate: DateTime.now().set({ hour: 12, minute: 0 }).toISO(),
    status: 'pending',
    createdBy: 'user-001',
    createdByName: 'John Smith',
    assignedToRoles: ['role-003'],
    finishRequirement: {
      type: 'none'
    },
    files: [],
    comments: [],
    createdAt: DateTime.now().minus({ days: 1 }).toISO(),
    updatedAt: DateTime.now().minus({ days: 1 }).toISO(),
    color: '#3b82f6'
  },

  // Personal - Next week
  {
    id: 'act-012',
    type: 'personal',
    title: 'Team Birthday Celebration',
    description: 'King Bhumibol Birthday celebration event',
    startDate: DateTime.now().plus({ days: 20 }).toISO(),
    endDate: DateTime.now().plus({ days: 20 }).toISO(),
    status: 'pending',
    createdBy: 'user-001',
    createdByName: 'John Smith',
    files: [],
    comments: [],
    createdAt: DateTime.now().minus({ days: 10 }).toISO(),
    updatedAt: DateTime.now().minus({ days: 10 }).toISO(),
    color: '#10b981'
  }
];

// Team activity feed - only assignments updates
export interface TeamActivityFeedItem {
  id: string;
  activityId: string;
  activityTitle: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: 'created' | 'updated' | 'finished' | 'canceled' | 'returned';
  description: string;
  timestamp: string;
  metadata?: string;
}

export const MOCK_TEAM_ACTIVITY_FEED: TeamActivityFeedItem[] = [
  {
    id: 'feed-001',
    activityId: 'act-001',
    activityTitle: 'Prepare Q4 Sales Report',
    userId: 'user-002',
    userName: 'Jane Cooper',
    userAvatar: '👩‍💼',
    action: 'updated',
    description: 'Started working on the report',
    timestamp: DateTime.now().minus({ minutes: 14 }).toISO(),
    metadata: 'Wallet #8123'
  },
  {
    id: 'feed-002',
    activityId: 'act-006',
    activityTitle: 'Market Research Analysis',
    userId: 'user-003',
    userName: 'Robert Fox',
    userAvatar: '👨‍💻',
    action: 'returned',
    description: 'Returned with request for more information',
    timestamp: DateTime.now().minus({ minutes: 20 }).toISO()
  },
  {
    id: 'feed-003',
    activityId: 'act-010',
    activityTitle: 'Product Demo Preparation',
    userId: 'user-001',
    userName: 'John Smith',
    userAvatar: '👨‍💼',
    action: 'canceled',
    description: 'Client postponed the meeting indefinitely',
    timestamp: DateTime.now().minus({ hours: 3 }).toISO()
  },
  {
    id: 'feed-004',
    activityId: 'act-005',
    activityTitle: 'Update Customer Database',
    userId: 'user-006',
    userName: 'Emily Davis',
    userAvatar: '👩‍💼',
    action: 'finished',
    description: 'Completed task successfully',
    timestamp: DateTime.now().minus({ days: 1 }).toISO()
  },
  {
    id: 'feed-005',
    activityId: 'act-003',
    activityTitle: 'Client Meeting Preparation',
    userId: 'user-008',
    userName: 'Lisa Anderson',
    userAvatar: '👩‍💼',
    action: 'created',
    description: 'Created new assignment',
    timestamp: DateTime.now().minus({ hours: 10 }).toISO()
  },
  {
    id: 'feed-006',
    activityId: 'act-008',
    activityTitle: 'Sales Team Meeting - November',
    userId: 'user-008',
    userName: 'Lisa Anderson',
    userAvatar: '👩‍💼',
    action: 'created',
    description: 'Scheduled monthly team meeting',
    timestamp: DateTime.now().minus({ days: 7 }).toISO()
  },
  {
    id: 'feed-007',
    activityId: 'act-001',
    activityTitle: 'Prepare Q4 Sales Report',
    userId: 'user-001',
    userName: 'John Smith',
    userAvatar: '👨‍💼',
    action: 'created',
    description: 'Created new assignment',
    timestamp: DateTime.now().minus({ days: 2 }).toISO()
  },
  {
    id: 'feed-008',
    activityId: 'act-011',
    activityTitle: 'Weekly Sales Review',
    userId: 'user-001',
    userName: 'John Smith',
    userAvatar: '👨‍💼',
    action: 'created',
    description: 'Scheduled weekly review meeting',
    timestamp: DateTime.now().minus({ days: 1 }).toISO()
  },
  {
    id: 'feed-009',
    activityId: 'act-006',
    activityTitle: 'Market Research Analysis',
    userId: 'user-008',
    userName: 'Lisa Anderson',
    userAvatar: '👩‍💼',
    action: 'created',
    description: 'Created market research task',
    timestamp: DateTime.now().minus({ days: 3 }).toISO()
  },
  {
    id: 'feed-010',
    activityId: 'act-010',
    activityTitle: 'Product Demo Preparation',
    userId: 'user-001',
    userName: 'John Smith',
    userAvatar: '👨‍💼',
    action: 'created',
    description: 'Created demo preparation task',
    timestamp: DateTime.now().minus({ days: 3 }).toISO()
  }
];
