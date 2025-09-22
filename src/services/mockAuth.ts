import { mockUsers, currentUser, setCurrentUser, getUserByEmail, User } from '@/data/mockData';

class MockAuthService {
  private listeners: ((user: User | null) => void)[] = [];

  // Simulate auth state change listeners
  onAuthStateChange(callback: (user: User | null) => void) {
    this.listeners.push(callback);
    // Immediately call with current user
    setTimeout(() => callback(currentUser), 0);
    
    return {
      unsubscribe: () => {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
          this.listeners.splice(index, 1);
        }
      }
    };
  }

  // Simulate login
  async signInWithPassword(credentials: { email: string; password: string }) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = getUserByEmail(credentials.email);
    if (user && credentials.password === 'password') { // Simple password check
      setCurrentUser(user);
      this.notifyListeners(user);
      return { data: { user }, error: null };
    }
    
    return { 
      data: { user: null }, 
      error: { message: 'Invalid login credentials' } 
    };
  }

  // Simulate logout
  async signOut() {
    setCurrentUser(null);
    this.notifyListeners(null);
    return { error: null };
  }

  // Simulate getting current session
  async getSession() {
    return { 
      data: { 
        session: currentUser ? { user: currentUser } : null 
      } 
    };
  }

  // Simulate getting current user
  async getUser() {
    return { 
      data: { 
        user: currentUser 
      } 
    };
  }

  // Simulate password reset
  async resetPasswordForEmail(email: string) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const user = getUserByEmail(email);
    if (user) {
      return { error: null };
    }
    return { error: { message: 'User not found' } };
  }

  // Simulate user update
  async updateUser(updates: any) {
    if (currentUser) {
      Object.assign(currentUser, updates);
      this.notifyListeners(currentUser);
    }
    return { error: null };
  }

  private notifyListeners(user: User | null) {
    this.listeners.forEach(listener => listener(user));
  }
}

export const mockAuth = new MockAuthService();