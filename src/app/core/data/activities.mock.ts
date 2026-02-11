// activities.mock.ts - Mock activity data for activities section

import { DateTime } from 'luxon';

export type ActivityType = 'assignment' | 'personal';
export type ActivityStatus = 'pending' | 'in-progress' | 'finished' | 'canceled' | 'returned';

// ✅ NEW: Location Interface
export interface ActivityLocation {
id: string;
name: string;
address: string;
lat: number;
lng: number;
placeId?: string;
isDefault?: boolean;
}
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
assignedTo?: string[];
assignedToRoles?: string[];
location?: ActivityLocation; // ✅ NEW: Optional location
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
// ✅ NEW: Default Saved Locations (Per User - Max 4)
export const MOCK_DEFAULT_LOCATIONS: ActivityLocation[] = [
{
id: 'loc-default-001',
name: 'Head Office',
address: '123 Sukhumvit Road, Khlong Toei, Bangkok 10110, Thailand',
lat: 13.7367,
lng: 100.5606,
isDefault: true
},
{
id: 'loc-default-002',
name: 'Sales Office - Silom',
address: '456 Silom Road, Bang Rak, Bangkok 10500, Thailand',
lat: 13.7278,
lng: 100.5341,
isDefault: true
},
{
id: 'loc-default-003',
name: 'Warehouse - Lat Krabang',
address: '789 Lat Krabang Road, Lat Krabang, Bangkok 10520, Thailand',
lat: 13.7294,
lng: 100.7502,
isDefault: true
},
{
id: 'loc-default-004',
name: 'Training Center',
address: '321 Rama 4 Road, Pathum Wan, Bangkok 10110, Thailand',
lat: 13.7240,
lng: 100.5510,
isDefault: true
}
];
export const MOCK_ACTIVITIES: Activity[] = [
// Activity with Head Office location
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
location: {
id: 'loc-001',
name: 'Head Office',
address: '123 Sukhumvit Road, Khlong Toei, Bangkok 10110, Thailand',
lat: 13.7367,
lng: 100.5606
},
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
// Activity with client location
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
location: {
id: 'loc-002',
name: 'Client Office - ABC Corp',
address: '789 Asoke Road, Khlong Toei Nuea, Bangkok 10110, Thailand',
lat: 13.7400,
lng: 100.5614
},
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
// Activity with Sales Office location
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
location: {
id: 'loc-003',
name: 'Sales Office - Silom',
address: '456 Silom Road, Bang Rak, Bangkok 10500, Thailand',
lat: 13.7278,
lng: 100.5341
},
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
// Activity without location
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
// Activity with Warehouse location
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
location: {
id: 'loc-004',
name: 'Warehouse - Lat Krabang',
address: '789 Lat Krabang Road, Lat Krabang, Bangkok 10520, Thailand',
lat: 13.7294,
lng: 100.7502
},
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
// Activity with Training Center location
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
location: {
id: 'loc-005',
name: 'Training Center',
address: '321 Rama 4 Road, Pathum Wan, Bangkok 10110, Thailand',
lat: 13.7240,
lng: 100.5510
},
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
// Activity without location
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
// Activity with Head Office location
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
location: {
id: 'loc-006',
name: 'Head Office - Meeting Room A',
address: '123 Sukhumvit Road, Khlong Toei, Bangkok 10110, Thailand',
lat: 13.7367,
lng: 100.5606
},
finishRequirement: {
type: 'none'
},
files: [],
comments: [],
createdAt: DateTime.now().minus({ days: 7 }).toISO(),
updatedAt: DateTime.now().minus({ days: 7 }).toISO(),
color: '#3b82f6'
},
// Activity with custom location
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
location: {
id: 'loc-007',
name: 'Central World Shopping Mall',
address: '999/9 Rama I Road, Pathum Wan, Bangkok 10330, Thailand',
lat: 13.7469,
lng: 100.5397
},
files: [],
comments: [],
createdAt: DateTime.now().minus({ hours: 5 }).toISO(),
updatedAt: DateTime.now().minus({ hours: 5 }).toISO(),
color: '#8b5cf6'
},
// Activity without location
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
// Activity with Head Office location
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
location: {
id: 'loc-008',
name: 'Head Office',
address: '123 Sukhumvit Road, Khlong Toei, Bangkok 10110, Thailand',
lat: 13.7367,
lng: 100.5606
},
finishRequirement: {
type: 'none'
},
files: [],
comments: [],
createdAt: DateTime.now().minus({ days: 1 }).toISO(),
updatedAt: DateTime.now().minus({ days: 1 }).toISO(),
color: '#3b82f6'
},
// Activity with Siam Paragon location
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
location: {
id: 'loc-009',
name: 'Siam Paragon',
address: '991 Rama I Road, Pathum Wan, Bangkok 10330, Thailand',
lat: 13.7467,
lng: 100.5347
},
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
  },
    {
    id: 'feed-011',
    activityId: 'act-002',
    activityTitle: 'Review Contract #12345',
    userId: 'user-001',
    userName: 'John Smith',
    userAvatar: '👨‍💼',
    action: 'updated',
    description: 'Reviewed contract clauses and added comments',
    timestamp: DateTime.now().minus({ minutes: 35 }).toISO()
  },
  {
    id: 'feed-012',
    activityId: 'act-003',
    activityTitle: 'Client Meeting Preparation',
    userId: 'user-004',
    userName: 'Esther Howard',
    userAvatar: '👩‍💻',
    action: 'finished',
    description: 'Presentation slides completed',
    timestamp: DateTime.now().minus({ hours: 1 }).toISO()
  },
  {
    id: 'feed-013',
    activityId: 'act-004',
    activityTitle: 'Update CRM Data',
    userId: 'user-005',
    userName: 'Cody Fisher',
    userAvatar: '👨‍💻',
    action: 'updated',
    description: 'Updated customer contact information',
    timestamp: DateTime.now().minus({ hours: 2 }).toISO()
  },
  {
    id: 'feed-014',
    activityId: 'act-007',
    activityTitle: 'Financial Forecast Review',
    userId: 'user-003',
    userName: 'Robert Fox',
    userAvatar: '👨‍💼',
    action: 'returned',
    description: 'Returned due to missing assumptions',
    timestamp: DateTime.now().minus({ hours: 3 }).toISO()
  },
  {
    id: 'feed-015',
    activityId: 'act-008',
    activityTitle: 'Website Content Update',
    userId: 'user-006',
    userName: 'Emily Davis',
    userAvatar: '👩‍🎨',
    action: 'updated',
    description: 'Added new landing page content',
    timestamp: DateTime.now().minus({ hours: 4 }).toISO()
  },
  {
    id: 'feed-016',
    activityId: 'act-009',
    activityTitle: 'Internal Training Session',
    userId: 'user-002',
    userName: 'Jane Cooper',
    userAvatar: '👩‍💼',
    action: 'finished',
    description: 'Training session successfully completed',
    timestamp: DateTime.now().minus({ hours: 6 }).toISO()
  },
  {
    id: 'feed-017',
    activityId: 'act-010',
    activityTitle: 'Product Demo Preparation',
    userId: 'user-004',
    userName: 'Esther Howard',
    userAvatar: '👩‍💻',
    action: 'updated',
    description: 'Demo script updated based on feedback',
    timestamp: DateTime.now().minus({ hours: 8 }).toISO()
  },
  {
    id: 'feed-018',
    activityId: 'act-011',
    activityTitle: 'Customer Follow-up Call',
    userId: 'user-001',
    userName: 'John Smith',
    userAvatar: '👨‍💼',
    action: 'finished',
    description: 'Customer confirmed next steps',
    timestamp: DateTime.now().minus({ hours: 10 }).toISO()
  },
  {
    id: 'feed-019',
    activityId: 'act-012',
    activityTitle: 'Bug Fix Verification',
    userId: 'user-005',
    userName: 'Cody Fisher',
    userAvatar: '👨‍💻',
    action: 'updated',
    description: 'Verified fix on staging environment',
    timestamp: DateTime.now().minus({ hours: 12 }).toISO()
  },
  {
    id: 'feed-020',
    activityId: 'act-013',
    activityTitle: 'Design Review',
    userId: 'user-006',
    userName: 'Emily Davis',
    userAvatar: '👩‍🎨',
    action: 'returned',
    description: 'Requested minor UI adjustments',
    timestamp: DateTime.now().minus({ hours: 14 }).toISO()
  },
  {
    id: 'feed-021',
    activityId: 'act-014',
    activityTitle: 'Monthly Performance Report',
    userId: 'user-003',
    userName: 'Robert Fox',
    userAvatar: '👨‍💼',
    action: 'updated',
    description: 'Updated KPIs and charts',
    timestamp: DateTime.now().minus({ hours: 18 }).toISO()
  },
  {
    id: 'feed-022',
    activityId: 'act-015',
    activityTitle: 'Security Access Review',
    userId: 'user-002',
    userName: 'Jane Cooper',
    userAvatar: '👩‍💼',
    action: 'finished',
    description: 'Access rights reviewed and approved',
    timestamp: DateTime.now().minus({ hours: 22 }).toISO()
  },
  {
    id: 'feed-023',
    activityId: 'act-016',
    activityTitle: 'Marketing Campaign Planning',
    userId: 'user-004',
    userName: 'Esther Howard',
    userAvatar: '👩‍💻',
    action: 'updated',
    description: 'Drafted campaign timeline',
    timestamp: DateTime.now().minus({ days: 1 }).toISO()
  },
  {
    id: 'feed-024',
    activityId: 'act-017',
    activityTitle: 'Data Migration Task',
    userId: 'user-005',
    userName: 'Cody Fisher',
    userAvatar: '👨‍💻',
    action: 'canceled',
    description: 'Canceled due to change in requirements',
    timestamp: DateTime.now().minus({ days: 1, hours: 4 }).toISO()
  },
  {
    id: 'feed-025',
    activityId: 'act-018',
    activityTitle: 'User Feedback Analysis',
    userId: 'user-006',
    userName: 'Emily Davis',
    userAvatar: '👩‍🎨',
    action: 'updated',
    description: 'Summarized user feedback insights',
    timestamp: DateTime.now().minus({ days: 2 }).toISO()
  }

];
