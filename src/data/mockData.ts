// Mock data for the application
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'founder' | 'cofounder' | 'manager' | 'employee' | 'hr' | 'intern';
  department: string | null;
  position: string | null;
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
  name: string;
  isCheckedIn: boolean;
  lastCheckIn?: string;
  lastCheckOut?: string;
}

export interface Attendance {
  id: string;
  user_id: string;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: 'present' | 'late' | 'absent' | 'sick_leave' | 'vacation';
  hours_worked: number | null;
  notes: string | null;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  start_date: string | null;
  end_date: string | null;
  manager_id: string;
  created_by: string;
  created_at: string;
  manager?: { first_name: string; last_name: string };
  creator?: { first_name: string; last_name: string };
  assignments?: Array<{
    id: string;
    user_id: string;
    role: string;
    profiles: { first_name: string; last_name: string };
  }>;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  service_type: string;
  total_amount: number;
  payment_type: string | null;
  monthly_amount: number | null;
  project_start_date: string | null;
  project_end_date: string | null;
  status: string;
  created_by: string;
  created_at: string;
  client_payments: Array<{
    id: string;
    amount: number;
    payment_date: string;
    payment_status: string;
    transaction_id: string | null;
    payment_method: string | null;
    payment_screenshot_url: string | null;
    notes: string | null;
  }>;
  totalPaid: number;
  remainingBalance: number;
  paymentStatus: string;
  pendingAmount: number;
}

export interface Employee {
  id: string;
  profile_id: string;
  employee_code: string;
  join_date: string;
  monthly_salary: number;
  upi_id: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  bank_name: string | null;
  is_active: boolean;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  department: string | null;
  position: string | null;
}

export interface Expense {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  expense_type: 'fixed' | 'variable';
  category: string | null;
  expense_date: string;
  payment_status: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
}

export interface Lead {
  id: string;
  business_name: string;
  contact_person: string;
  phone_number: string | null;
  email: string | null;
  address: string | null;
  source: string;
  status: string;
  notes: string | null;
  interest_area: string | null;
  next_follow_up_date: string | null;
  scheduled_meeting_date: string | null;
  meeting_type: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_by: string;
  department: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  profiles?: { first_name: string; last_name: string };
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string | null;
  is_read: boolean;
  created_at: string;
}

// Mock users data
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'founder@company.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 'founder',
    department: 'Management',
    position: 'CEO',
    avatar_url: null,
    phone: '+1234567890',
    is_active: true,
    name: 'John Doe',
    isCheckedIn: false,
    lastCheckIn: '2025-01-11T09:00:00Z',
    lastCheckOut: '2025-01-10T18:00:00Z',
  },
  {
    id: '2',
    email: 'jane@company.com',
    first_name: 'Jane',
    last_name: 'Smith',
    role: 'manager',
    department: 'Engineering',
    position: 'Engineering Manager',
    avatar_url: null,
    phone: '+1234567891',
    is_active: true,
    name: 'Jane Smith',
    isCheckedIn: true,
    lastCheckIn: '2025-01-11T09:15:00Z',
  },
  {
    id: '3',
    email: 'bob@company.com',
    first_name: 'Bob',
    last_name: 'Johnson',
    role: 'employee',
    department: 'Engineering',
    position: 'Software Engineer',
    avatar_url: null,
    phone: '+1234567892',
    is_active: true,
    name: 'Bob Johnson',
    isCheckedIn: true,
    lastCheckIn: '2025-01-11T09:30:00Z',
  },
];

// Mock attendance data
export const mockAttendance: Attendance[] = [
  {
    id: '1',
    user_id: '1',
    date: '2025-01-11',
    check_in_time: '2025-01-11T09:00:00Z',
    check_out_time: null,
    status: 'present',
    hours_worked: null,
    notes: null,
  },
  {
    id: '2',
    user_id: '2',
    date: '2025-01-11',
    check_in_time: '2025-01-11T09:15:00Z',
    check_out_time: null,
    status: 'present',
    hours_worked: null,
    notes: null,
  },
  {
    id: '3',
    user_id: '1',
    date: '2025-01-10',
    check_in_time: '2025-01-10T09:00:00Z',
    check_out_time: '2025-01-10T18:00:00Z',
    status: 'present',
    hours_worked: 9,
    notes: null,
  },
];

// Mock projects data
export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete redesign of company website',
    status: 'active',
    start_date: '2025-01-01',
    end_date: '2025-03-01',
    manager_id: '2',
    created_by: '1',
    created_at: '2025-01-01T00:00:00Z',
    manager: { first_name: 'Jane', last_name: 'Smith' },
    creator: { first_name: 'John', last_name: 'Doe' },
    assignments: [
      {
        id: '1',
        user_id: '3',
        role: 'developer',
        profiles: { first_name: 'Bob', last_name: 'Johnson' }
      }
    ]
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'New mobile application for iOS and Android',
    status: 'planning',
    start_date: '2025-02-01',
    end_date: '2025-06-01',
    manager_id: '2',
    created_by: '1',
    created_at: '2025-01-05T00:00:00Z',
    manager: { first_name: 'Jane', last_name: 'Smith' },
    creator: { first_name: 'John', last_name: 'Doe' },
    assignments: []
  },
];

// Mock clients data
export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Tech Solutions Inc',
    email: 'contact@techsolutions.com',
    phone_number: '+1234567890',
    service_type: 'Web Development',
    total_amount: 50000,
    payment_type: 'one-time',
    monthly_amount: null,
    project_start_date: '2025-01-01',
    project_end_date: '2025-03-01',
    status: 'active',
    created_by: '1',
    created_at: '2025-01-01T00:00:00Z',
    client_payments: [
      {
        id: '1',
        amount: 25000,
        payment_date: '2025-01-15',
        payment_status: 'verified',
        transaction_id: 'TXN123456',
        payment_method: 'Bank Transfer',
        payment_screenshot_url: null,
        notes: 'First installment',
      }
    ],
    totalPaid: 25000,
    remainingBalance: 25000,
    paymentStatus: 'Partially Paid',
    pendingAmount: 0,
  },
  {
    id: '2',
    name: 'Digital Marketing Pro',
    email: 'info@digitalmarketing.com',
    phone_number: '+1234567891',
    service_type: 'Digital Marketing',
    total_amount: 5000,
    payment_type: 'monthly',
    monthly_amount: 5000,
    project_start_date: '2025-01-01',
    project_end_date: null,
    status: 'active',
    created_by: '1',
    created_at: '2025-01-01T00:00:00Z',
    client_payments: [
      {
        id: '2',
        amount: 5000,
        payment_date: '2025-01-01',
        payment_status: 'verified',
        transaction_id: 'TXN789012',
        payment_method: 'UPI',
        payment_screenshot_url: null,
        notes: 'January payment',
      }
    ],
    totalPaid: 5000,
    remainingBalance: 0,
    paymentStatus: 'Paid',
    pendingAmount: 0,
  },
];

// Mock employees data
export const mockEmployees: Employee[] = [
  {
    id: '1',
    profile_id: '1',
    employee_code: 'EMP001',
    join_date: '2024-01-01',
    monthly_salary: 100000,
    upi_id: 'john@upi',
    bank_account_number: '1234567890',
    bank_ifsc: 'HDFC0001234',
    bank_name: 'HDFC Bank',
    is_active: true,
    name: 'John Doe',
    email: 'founder@company.com',
    phone: '+1234567890',
    avatar_url: null,
    role: 'founder',
    department: 'Management',
    position: 'CEO',
  },
  {
    id: '2',
    profile_id: '2',
    employee_code: 'EMP002',
    join_date: '2024-02-01',
    monthly_salary: 80000,
    upi_id: 'jane@upi',
    bank_account_number: '2345678901',
    bank_ifsc: 'HDFC0001235',
    bank_name: 'HDFC Bank',
    is_active: true,
    name: 'Jane Smith',
    email: 'jane@company.com',
    phone: '+1234567891',
    avatar_url: null,
    role: 'manager',
    department: 'Engineering',
    position: 'Engineering Manager',
  },
  {
    id: '3',
    profile_id: '3',
    employee_code: 'EMP003',
    join_date: '2024-03-01',
    monthly_salary: 60000,
    upi_id: 'bob@upi',
    bank_account_number: '3456789012',
    bank_ifsc: 'HDFC0001236',
    bank_name: 'HDFC Bank',
    is_active: true,
    name: 'Bob Johnson',
    email: 'bob@company.com',
    phone: '+1234567892',
    avatar_url: null,
    role: 'employee',
    department: 'Engineering',
    position: 'Software Engineer',
  },
];

// Mock expenses data
export const mockExpenses: Expense[] = [
  {
    id: '1',
    title: 'Office Rent',
    description: 'Monthly office rent payment',
    amount: 25000,
    expense_type: 'fixed',
    category: 'Office',
    expense_date: '2025-01-01',
    payment_status: 'paid',
    created_by: '1',
    created_by_name: 'John Doe',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Marketing Campaign',
    description: 'Google Ads campaign for Q1',
    amount: 15000,
    expense_type: 'variable',
    category: 'Marketing',
    expense_date: '2025-01-05',
    payment_status: 'unpaid',
    created_by: '1',
    created_by_name: 'John Doe',
    created_at: '2025-01-05T00:00:00Z',
  },
];

// Mock leads data
export const mockLeads: Lead[] = [
  {
    id: '1',
    business_name: 'Startup Solutions',
    contact_person: 'Alice Brown',
    phone_number: '+1234567893',
    email: 'alice@startupsolutions.com',
    address: '123 Business St, City',
    source: 'Google Search',
    status: 'needs_immediate_service',
    notes: 'Interested in web development services',
    interest_area: 'Web Development',
    next_follow_up_date: '2025-01-15',
    scheduled_meeting_date: '2025-01-16T10:00:00Z',
    meeting_type: 'Video Call',
    created_by: '1',
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2025-01-10T00:00:00Z',
  },
  {
    id: '2',
    business_name: 'E-commerce Plus',
    contact_person: 'Mike Wilson',
    phone_number: '+1234567894',
    email: 'mike@ecommerceplus.com',
    address: '456 Commerce Ave, City',
    source: 'Referral',
    status: 'interested_scheduled',
    notes: 'Looking for mobile app development',
    interest_area: 'Mobile App',
    next_follow_up_date: '2025-01-20',
    scheduled_meeting_date: null,
    meeting_type: null,
    created_by: '1',
    created_at: '2025-01-08T00:00:00Z',
    updated_at: '2025-01-08T00:00:00Z',
  },
];

// Mock announcements data
export const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'New Office Hours',
    content: 'Starting next week, our office hours will be 9 AM to 6 PM. Please adjust your schedules accordingly.',
    priority: 'high',
    created_by: '1',
    department: null,
    expires_at: null,
    is_active: true,
    created_at: '2025-01-10T00:00:00Z',
    profiles: { first_name: 'John', last_name: 'Doe' },
  },
  {
    id: '2',
    title: 'Team Building Event',
    content: 'Join us for a team building event this Friday at 5 PM. Food and drinks will be provided!',
    priority: 'medium',
    created_by: '1',
    department: null,
    expires_at: '2025-01-15T00:00:00Z',
    is_active: true,
    created_at: '2025-01-09T00:00:00Z',
    profiles: { first_name: 'John', last_name: 'Doe' },
  },
];

// Mock notifications data
export const mockNotifications: Notification[] = [
  {
    id: '1',
    user_id: '1',
    title: 'New Task Assigned',
    message: 'You have been assigned a new task for the website project.',
    type: 'task',
    is_read: false,
    created_at: '2025-01-11T10:00:00Z',
  },
  {
    id: '2',
    user_id: '1',
    title: 'Timesheet Reminder',
    message: 'Don\'t forget to submit your timesheet for this week.',
    type: 'reminder',
    is_read: true,
    created_at: '2025-01-10T17:00:00Z',
  },
];

// Current logged in user (can be changed for testing different roles)
export let currentUser: User | null = mockUsers[0]; // Default to founder

export const setCurrentUser = (user: User | null) => {
  currentUser = user;
};

// Helper function to get user by email
export const getUserByEmail = (email: string): User | undefined => {
  return mockUsers.find(user => user.email === email);
};