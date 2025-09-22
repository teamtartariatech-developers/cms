import { mockAuth } from './mockAuth';
import { mockStorage } from './mockStorage';
import { 
  mockUsers, 
  mockAttendance, 
  mockProjects, 
  mockClients, 
  mockEmployees, 
  mockExpenses, 
  mockLeads, 
  mockAnnouncements, 
  mockNotifications,
  currentUser,
  User,
  Attendance,
  Project,
  Client,
  Employee,
  Expense,
  Lead,
  Announcement,
  Notification
} from '@/data/mockData';

// Local storage keys for persistence
const STORAGE_KEYS = {
  ATTENDANCE: 'mock_attendance',
  PROJECTS: 'mock_projects',
  CLIENTS: 'mock_clients',
  EMPLOYEES: 'mock_employees',
  EXPENSES: 'mock_expenses',
  LEADS: 'mock_leads',
  ANNOUNCEMENTS: 'mock_announcements',
  NOTIFICATIONS: 'mock_notifications',
};

// Helper functions for local storage
const getFromStorage = <T>(key: string, defaultValue: T[]): T[] => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, data: T[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

class MockQueryBuilder {
  private tableName: string;
  private selectFields: string = '*';
  private filters: Array<{ column: string; operator: string; value: any }> = [];
  private orderBy: { column: string; ascending: boolean } | null = null;
  private limitValue: number | null = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(fields: string = '*') {
    this.selectFields = fields;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ column, operator: 'eq', value });
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push({ column, operator: 'neq', value });
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push({ column, operator: 'in', value: values });
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push({ column, operator: 'gte', value });
    return this;
  }

  order(column: string, options: { ascending: boolean } = { ascending: true }) {
    this.orderBy = { column, ascending: options.ascending };
    return this;
  }

  limit(count: number) {
    this.limitValue = count;
    return this;
  }

  not(column: string, operator: string, value: any) {
    this.filters.push({ column, operator: `not_${operator}`, value });
    return this;
  }

  maybeSingle() {
    return this.single();
  }

  async single() {
    const result = await this.execute();
    if (result.error) return result;
    
    const data = result.data as any[];
    if (data.length === 0) {
      return { data: null, error: { code: 'PGRST116', message: 'No rows found' } };
    }
    
    return { data: data[0], error: null };
  }

  async execute(): Promise<{ data: any[] | null; error: any; count?: number }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    let data: any[] = [];

    // Get data based on table name
    switch (this.tableName) {
      case 'profiles':
        data = [...mockUsers];
        break;
      case 'attendance':
        data = getFromStorage(STORAGE_KEYS.ATTENDANCE, mockAttendance);
        break;
      case 'projects':
        data = getFromStorage(STORAGE_KEYS.PROJECTS, mockProjects);
        break;
      case 'clients':
        data = getFromStorage(STORAGE_KEYS.CLIENTS, mockClients);
        break;
      case 'client_payments':
        const clients = getFromStorage(STORAGE_KEYS.CLIENTS, mockClients);
        data = clients.flatMap(client => 
          client.client_payments.map(payment => ({
            ...payment,
            client_id: client.id,
            clients: { name: client.name, email: client.email }
          }))
        );
        break;
      case 'employees':
        data = getFromStorage(STORAGE_KEYS.EMPLOYEES, mockEmployees);
        break;
      case 'company_expenses':
        data = getFromStorage(STORAGE_KEYS.EXPENSES, mockExpenses);
        break;
      case 'leads':
        data = getFromStorage(STORAGE_KEYS.LEADS, mockLeads);
        break;
      case 'announcements':
        data = getFromStorage(STORAGE_KEYS.ANNOUNCEMENTS, mockAnnouncements);
        break;
      case 'notifications':
        data = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, mockNotifications);
        break;
      case 'timesheets':
        data = []; // Empty for now
        break;
      case 'tasks':
        data = []; // Empty for now
        break;
      case 'hourly_tasks':
        data = []; // Empty for now
        break;
      case 'leads_access':
        data = []; // Empty for now
        break;
      default:
        data = [];
    }

    // Apply filters
    data = data.filter(item => {
      return this.filters.every(filter => {
        const value = this.getNestedValue(item, filter.column);
        
        switch (filter.operator) {
          case 'eq':
            return value === filter.value;
          case 'neq':
            return value !== filter.value;
          case 'in':
            return filter.value.includes(value);
          case 'gte':
            return value >= filter.value;
          case 'not_is':
            return value !== null;
          default:
            return true;
        }
      });
    });

    // Apply ordering
    if (this.orderBy) {
      data.sort((a, b) => {
        const aVal = this.getNestedValue(a, this.orderBy!.column);
        const bVal = this.getNestedValue(b, this.orderBy!.column);
        
        if (aVal < bVal) return this.orderBy!.ascending ? -1 : 1;
        if (aVal > bVal) return this.orderBy!.ascending ? 1 : -1;
        return 0;
      });
    }

    // Apply limit
    if (this.limitValue) {
      data = data.slice(0, this.limitValue);
    }

    return { data, error: null, count: data.length };
  }

  private getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

class MockSupabaseClient {
  auth = mockAuth;
  storage = mockStorage;

  from(tableName: string) {
    return {
      select: (fields?: string) => new MockQueryBuilder(tableName).select(fields),
      insert: (data: any) => this.insert(tableName, data),
      update: (data: any) => this.update(tableName, data),
      delete: () => this.delete(tableName),
      upsert: (data: any) => this.upsert(tableName, data),
    };
  }

  private async insert(tableName: string, data: any) {
    await new Promise(resolve => setTimeout(resolve, 100));

    const newItem = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let currentData: any[] = [];
    let storageKey = '';

    switch (tableName) {
      case 'attendance':
        storageKey = STORAGE_KEYS.ATTENDANCE;
        currentData = getFromStorage(storageKey, mockAttendance);
        break;
      case 'projects':
        storageKey = STORAGE_KEYS.PROJECTS;
        currentData = getFromStorage(storageKey, mockProjects);
        break;
      case 'clients':
        storageKey = STORAGE_KEYS.CLIENTS;
        currentData = getFromStorage(storageKey, mockClients);
        newItem.client_payments = [];
        newItem.totalPaid = 0;
        newItem.remainingBalance = newItem.total_amount;
        newItem.paymentStatus = 'Pending';
        newItem.pendingAmount = 0;
        break;
      case 'employees':
        storageKey = STORAGE_KEYS.EMPLOYEES;
        currentData = getFromStorage(storageKey, mockEmployees);
        break;
      case 'company_expenses':
        storageKey = STORAGE_KEYS.EXPENSES;
        currentData = getFromStorage(storageKey, mockExpenses);
        newItem.created_by_name = currentUser?.name || 'Unknown';
        break;
      case 'leads':
        storageKey = STORAGE_KEYS.LEADS;
        currentData = getFromStorage(storageKey, mockLeads);
        break;
      case 'announcements':
        storageKey = STORAGE_KEYS.ANNOUNCEMENTS;
        currentData = getFromStorage(storageKey, mockAnnouncements);
        newItem.profiles = { 
          first_name: currentUser?.first_name || 'Unknown', 
          last_name: currentUser?.last_name || 'User' 
        };
        break;
      case 'notifications':
        storageKey = STORAGE_KEYS.NOTIFICATIONS;
        currentData = getFromStorage(storageKey, mockNotifications);
        break;
    }

    if (storageKey) {
      currentData.push(newItem);
      saveToStorage(storageKey, currentData);
    }

    return { data: newItem, error: null };
  }

  private update(tableName: string, data: any) {
    return {
      eq: (column: string, value: any) => this.updateWithFilter(tableName, data, column, value)
    };
  }

  private async updateWithFilter(tableName: string, data: any, column: string, value: any) {
    await new Promise(resolve => setTimeout(resolve, 100));

    let currentData: any[] = [];
    let storageKey = '';

    switch (tableName) {
      case 'attendance':
        storageKey = STORAGE_KEYS.ATTENDANCE;
        currentData = getFromStorage(storageKey, mockAttendance);
        break;
      case 'clients':
        storageKey = STORAGE_KEYS.CLIENTS;
        currentData = getFromStorage(storageKey, mockClients);
        break;
      case 'company_expenses':
        storageKey = STORAGE_KEYS.EXPENSES;
        currentData = getFromStorage(storageKey, mockExpenses);
        break;
      case 'leads':
        storageKey = STORAGE_KEYS.LEADS;
        currentData = getFromStorage(storageKey, mockLeads);
        break;
      case 'notifications':
        storageKey = STORAGE_KEYS.NOTIFICATIONS;
        currentData = getFromStorage(storageKey, mockNotifications);
        break;
    }

    if (storageKey) {
      const index = currentData.findIndex(item => item[column] === value);
      if (index !== -1) {
        currentData[index] = { ...currentData[index], ...data, updated_at: new Date().toISOString() };
        saveToStorage(storageKey, currentData);
      }
    }

    return { error: null };
  }

  private delete(tableName: string) {
    return {
      eq: (column: string, value: any) => this.deleteWithFilter(tableName, column, value)
    };
  }

  private async deleteWithFilter(tableName: string, column: string, value: any) {
    await new Promise(resolve => setTimeout(resolve, 100));

    let currentData: any[] = [];
    let storageKey = '';

    switch (tableName) {
      case 'attendance':
        storageKey = STORAGE_KEYS.ATTENDANCE;
        currentData = getFromStorage(storageKey, mockAttendance);
        break;
      case 'company_expenses':
        storageKey = STORAGE_KEYS.EXPENSES;
        currentData = getFromStorage(storageKey, mockExpenses);
        break;
      case 'leads':
        storageKey = STORAGE_KEYS.LEADS;
        currentData = getFromStorage(storageKey, mockLeads);
        break;
    }

    if (storageKey) {
      const filteredData = currentData.filter(item => item[column] !== value);
      saveToStorage(storageKey, filteredData);
    }

    return { error: null };
  }

  private async upsert(tableName: string, data: any) {
    // For simplicity, treat upsert as insert
    return this.insert(tableName, data);
  }

  // Mock channel for real-time subscriptions
  channel(name: string) {
    return {
      on: () => this,
      subscribe: (callback?: (status: string) => void) => {
        if (callback) callback('SUBSCRIBED');
        return this;
      }
    };
  }

  removeChannel() {
    // Mock implementation
  }
}

export const mockSupabase = new MockSupabaseClient();