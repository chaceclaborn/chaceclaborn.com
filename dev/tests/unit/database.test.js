// tests/unit/database.test.js - Database service tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockUser } from '../utils/testHelpers.js';

// Mock Firestore
const mockFirestore = {
  doc: vi.fn(() => ({ id: 'mock-doc-id' })),
  collection: vi.fn(() => ({ id: 'mock-collection' })),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  addDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
  increment: vi.fn((n) => n),
  arrayUnion: vi.fn(),
  arrayRemove: vi.fn()
};

vi.mock('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js', () => mockFirestore);

describe('💾 Database Service Tests', () => {
  let databaseService;
  
  beforeEach(async () => {
    console.log('\n  🔄 Setting up database service test...');
    vi.resetModules();
    
    const module = await import('../../../js/firebase/database.js');

    databaseService = module.default;
  });

  describe('👤 User Profile Management', () => {
    it('should create user profile with all fields', async () => {
      const mockUser = createMockUser();
      mockFirestore.setDoc.mockResolvedValueOnce();
      
      const result = await databaseService.createUserProfile(mockUser);
      
      expect(mockFirestore.doc).toHaveBeenCalledWith(
        databaseService.db,
        'users',
        mockUser.uid
      );
      expect(mockFirestore.setDoc).toHaveBeenCalled();
      expect(result).toMatchObject({
        uid: mockUser.uid,
        email: mockUser.email,
        role: 'member',
        loginCount: 1,
        isActive: true
      });
      console.log('    ✅ User profile created with correct structure');
    });

    it('should update user profile', async () => {
      mockFirestore.updateDoc.mockResolvedValueOnce();
      
      await databaseService.updateUserProfile('user123', {
        displayName: 'Updated Name',
        preferences: { theme: 'dark' }
      });
      
      expect(mockFirestore.updateDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          displayName: 'Updated Name',
          preferences: { theme: 'dark' },
          updatedAt: expect.any(Date)
        })
      );
      console.log('    ✅ User profile updated successfully');
    });

    it('should get user profile', async () => {
      const mockProfile = {
        uid: 'user123',
        email: 'test@example.com',
        role: 'member'
      };
      
      mockFirestore.getDoc.mockResolvedValueOnce({
        exists: () => true,
        id: 'user123',
        data: () => mockProfile
      });
      
      const result = await databaseService.getUserProfile('user123');
      
      expect(result).toEqual({
        id: 'user123',
        ...mockProfile
      });
      console.log('    ✅ User profile retrieved successfully');
    });

    it('should return null for non-existent user', async () => {
      mockFirestore.getDoc.mockResolvedValueOnce({
        exists: () => false
      });
      
      const result = await databaseService.getUserProfile('nonexistent');
      
      expect(result).toBeNull();
      console.log('    ✅ Returns null for non-existent user');
    });
  });

  describe('📊 Activity Logging', () => {
    it('should log user activity with metadata', async () => {
      mockFirestore.addDoc.mockResolvedValueOnce({ id: 'activity123' });
      
      const activityId = await databaseService.logUserActivity(
        'user123',
        'button_click',
        { button: 'submit', page: '/home' }
      );
      
      expect(mockFirestore.addDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          userId: 'user123',
          activity: 'button_click',
          timestamp: expect.any(Date),
          userAgent: expect.any(String),
          url: 'http://localhost:3000/',
          sessionId: expect.stringMatching(/^session-/),
          button: 'submit',
          page: '/home'
        })
      );
      expect(activityId).toBe('activity123');
      console.log('    ✅ Activity logged with metadata');
    });

    it('should log page view with analytics data', async () => {
      mockFirestore.addDoc.mockResolvedValueOnce({ id: 'pageview123' });
      
      const pageViewId = await databaseService.logPageView(
        'user123',
        '/portfolio',
        { source: 'navigation' }
      );
      
      expect(mockFirestore.addDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          userId: 'user123',
          page: '/portfolio',
          timestamp: expect.any(Date),
          referrer: '',
          screenSize: '1920x1080',
          viewport: '1920x1080',
          duration: 0,
          source: 'navigation'
        })
      );
      expect(pageViewId).toBe('pageview123');
      console.log('    ✅ Page view logged with analytics');
    });

    it('should update page duration on exit', async () => {
      // Setup page view
      databaseService.currentPageView = 'pageview123';
      databaseService.pageStartTime = Date.now() - 5000; // 5 seconds ago
      
      mockFirestore.updateDoc.mockResolvedValueOnce();
      
      await databaseService.updatePageDuration();
      
      expect(mockFirestore.updateDoc).toHaveBeenCalledWith(
        expect.any(Object),
        { duration: expect.any(Number) }
      );
      console.log('    ✅ Page duration updated');
    });
  });

  describe('🔑 Login Statistics', () => {
    it('should update login stats and log activity', async () => {
      mockFirestore.updateDoc.mockResolvedValueOnce();
      mockFirestore.addDoc.mockResolvedValueOnce({ id: 'activity123' });
      
      await databaseService.updateLoginStats('user123');
      
      expect(mockFirestore.updateDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          lastLogin: expect.any(Date),
          loginCount: expect.any(Number),
          'metadata.lastUserAgent': expect.any(String)
        })
      );
      
      expect(mockFirestore.addDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          userId: 'user123',
          activity: 'login'
        })
      );
      console.log('    ✅ Login stats updated and activity logged');
    });
  });

  describe('📈 User Statistics', () => {
    it('should get user stats with activities and page views', async () => {
      const mockActivities = [
        { id: 'act1', activity: 'login', timestamp: new Date() },
        { id: 'act2', activity: 'logout', timestamp: new Date() }
      ];
      
      const mockPageViews = [
        { id: 'pv1', page: '/home', duration: 30 },
        { id: 'pv2', page: '/portfolio', duration: 120 }
      ];
      
      mockFirestore.getDocs
        .mockResolvedValueOnce({
          forEach: (fn) => mockActivities.forEach((doc) => fn(doc))
        })
        .mockResolvedValueOnce({
          forEach: (fn) => mockPageViews.forEach((doc) => fn(doc))
        });
      
      const stats = await databaseService.getUserStats('user123');
      
      expect(stats).toEqual({
        activities: mockActivities,
        pageViews: mockPageViews,
        totalPageViews: 2,
        lastActive: mockActivities[0].timestamp
      });
      console.log('    ✅ User stats retrieved successfully');
    });
  });

  describe('🔔 Real-time Listeners', () => {
    it('should subscribe to user profile changes', () => {
      const callback = vi.fn();
      const unsubscribe = vi.fn();
      mockFirestore.onSnapshot.mockReturnValueOnce(unsubscribe);
      
      const result = databaseService.subscribeToUserProfile('user123', callback);
      
      expect(mockFirestore.onSnapshot).toHaveBeenCalled();
      expect(databaseService.listeners.has('user-user123')).toBe(true);
      expect(result).toBe(unsubscribe);
      console.log('    ✅ Subscribed to user profile changes');
    });

    it('should unsubscribe all listeners', () => {
      const unsubscribe1 = vi.fn();
      const unsubscribe2 = vi.fn();
      
      databaseService.listeners.set('test1', unsubscribe1);
      databaseService.listeners.set('test2', unsubscribe2);
      
      databaseService.unsubscribeAll();
      
      expect(unsubscribe1).toHaveBeenCalled();
      expect(unsubscribe2).toHaveBeenCalled();
      expect(databaseService.listeners.size).toBe(0);
      console.log('    ✅ All listeners unsubscribed');
    });
  });

  describe('🛠️ Helper Methods', () => {
    it('should generate unique session ID', () => {
      const sessionId1 = databaseService.getSessionId();
      expect(sessionId1).toMatch(/^session-\d+-[a-z0-9]+$/);
      
      // Should return same ID for same session
      const sessionId2 = databaseService.getSessionId();
      expect(sessionId2).toBe(sessionId1);
      console.log('    ✅ Session ID generated and persisted');
    });
  });

  describe('❌ Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const error = new Error('Firestore permission denied');
      mockFirestore.setDoc.mockRejectedValueOnce(error);
      
      await expect(
        databaseService.createUserProfile(createMockUser())
      ).rejects.toThrow('Firestore permission denied');
      console.log('    ✅ Database errors handled correctly');
    });

    it('should log errors to error collection', async () => {
      mockFirestore.addDoc.mockResolvedValueOnce({ id: 'error123' });
      
      const error = new Error('Test error');
      await databaseService.logError(error, { context: 'test' });
      
      expect(mockFirestore.addDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          message: 'Test error',
          timestamp: expect.any(Date),
          context: 'test'
        })
      );
      console.log('    ✅ Errors logged to database');
    });
  });
});