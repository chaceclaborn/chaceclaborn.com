// js/raeha-customization.js - Handles both form submission and admin panel
import { auth, db } from './firebase/config.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    orderBy, 
    updateDoc,
    doc,
    arrayUnion,
    serverTimestamp,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// ========================================
// FORM HANDLER FOR RAEHA'S PAGE
// ========================================
class CustomizationFormHandler {
    constructor() {
        this.form = null;
        this.currentUser = null;
        this.init();
    }

    init() {
        // Only initialize on girlfriend.html page
        if (!window.location.pathname.includes('girlfriend.html')) {
            return;
        }

        console.log('💝 Initializing Raeha\'s form handler...');
        
        // Wait for auth and DOM
        onAuthStateChanged(auth, (user) => {
            this.currentUser = user;
            if (user) {
                this.setupForm();
            }
        });
    }

    setupForm() {
        // Wait for DOM if needed
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.attachFormListener());
        } else {
            this.attachFormListener();
        }
    }

    attachFormListener() {
        this.form = document.getElementById('customization-form');
        
        if (!this.form) {
            console.log('No customization form found on this page');
            return;
        }

        console.log('✅ Found customization form');
        
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit();
        });
    }

    async handleSubmit() {
        const type = document.getElementById('request-type')?.value;
        const details = document.getElementById('request-details')?.value;
        
        if (!type || !details) {
            alert('Please fill in all fields');
            return;
        }

        // FIXED: Changed 'const subm' to 'const submitBtn'
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            const requestData = {
                type: type,
                details: details,
                email: this.currentUser?.email || 'anonymous',
                displayName: this.currentUser?.displayName || 'Anonymous',
                status: 'pending',
                createdAt: serverTimestamp(),
                userId: this.currentUser?.uid || null
            };
            
            const docRef = await addDoc(collection(db, 'customization_requests'), requestData);
            console.log('✅ Request saved with ID:', docRef.id);
            
            alert(`Request submitted!\n\nType: ${type}\nDetails: ${details}\n\nChace will implement this soon!`);
            this.form.reset();
            
        } catch (error) {
            console.error('❌ Error:', error);
            alert('Error submitting request. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
}

// ========================================
// ADMIN PANEL FOR VIEWING REQUESTS
// ========================================
class AdminCustomizationPanel {
    constructor() {
        this.requests = [];
        this.unsubscribe = null;
        this.init();
    }

    async init() {
        // Only initialize on admin.html page
        if (!window.location.pathname.includes('admin.html')) {
            return;
        }

        // Wait for auth
        onAuthStateChanged(auth, async (user) => {
            if (user?.email?.toLowerCase() === 'chaceclaborn@gmail.com') {
                console.log('👨‍💼 Admin panel initializing...');
                this.setupAdminPanel();
                this.subscribeToRequests();
            }
        });
    }

    setupAdminPanel() {
        // Find or create container
        let container = document.getElementById('customization-panel-container');
        if (!container) {
            // If no specific container, add after the header
            const adminHeader = document.querySelector('.admin-header');
            if (adminHeader) {
                container = document.createElement('div');
                container.id = 'customization-panel-container';
                adminHeader.insertAdjacentElement('afterend', container);
            }
        }

        if (!container) {
            console.error('Could not find place to insert admin panel');
            return;
        }

        // Add the panel HTML
        container.innerHTML = `
            <div class="admin-customization-panel">
                <div class="admin-panel-header">
                    <h2><i class="fas fa-user-cog"></i> Raeha's Customization Requests</h2>
                    <div class="admin-stats">
                        <span class="stat-badge pending-count">0 Pending</span>
                        <span class="stat-badge progress-count">0 In Progress</span>
                        <span class="stat-badge completed-count">0 Completed</span>
                    </div>
                </div>
                <div id="admin-requests-list" class="admin-requests-list">
                    <div class="loading-admin">Loading requests...</div>
                </div>
            </div>
        `;

        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('admin-panel-styles')) return;
        
        const styles = `
            <style id="admin-panel-styles">
                .admin-customization-panel {
                    background: white;
                    border-radius: 15px;
                    padding: 30px;
                    margin: 30px auto;
                    max-width: 1200px;
                    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
                }

                .admin-panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #e5e7eb;
                }

                .admin-panel-header h2 {
                    color: #1f2937;
                    font-size: 1.8rem;
                    margin: 0;
                }

                .admin-stats {
                    display: flex;
                    gap: 15px;
                }

                .stat-badge {
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 600;
                }

                .pending-count {
                    background: #fef3c7;
                    color: #92400e;
                }

                .progress-count {
                    background: #dbeafe;
                    color: #1e40af;
                }

                .completed-count {
                    background: #d1fae5;
                    color: #065f46;
                }

                .request-item {
                    background: #f9fafb;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 20px;
                    border: 1px solid #e5e7eb;
                }

                .request-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: start;
                    margin-bottom: 15px;
                }

                .request-type-badge {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    margin-right: 10px;
                }

                .type-design { background: #fce7f3; color: #be185d; }
                .type-feature { background: #e0e7ff; color: #4338ca; }
                .type-content { background: #dcfce7; color: #15803d; }
                .type-photo { background: #f3e8ff; color: #7c3aed; }
                .type-other { background: #f3f4f6; color: #4b5563; }

                .status-badge {
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 600;
                }

                .status-pending { background: #fef3c7; color: #92400e; }
                .status-in-progress { background: #dbeafe; color: #1e40af; }
                .status-completed { background: #d1fae5; color: #065f46; }

                .request-details {
                    background: white;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 15px 0;
                }

                .admin-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 15px;
                }

                .admin-btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .btn-progress {
                    background: #3b82f6;
                    color: white;
                }

                .btn-complete {
                    background: #10b981;
                    color: white;
                }

                .loading-admin {
                    text-align: center;
                    padding: 40px;
                    color: #6b7280;
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    subscribeToRequests() {
        const q = query(
            collection(db, 'customization_requests'),
            orderBy('createdAt', 'desc')
        );

        this.unsubscribe = onSnapshot(q, (snapshot) => {
            this.requests = [];
            snapshot.forEach((doc) => {
                this.requests.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            this.displayRequests();
            this.updateStats();
        }, (error) => {
            console.error('Error loading requests:', error);
            document.getElementById('admin-requests-list').innerHTML = `
                <div class="loading-admin">Error loading requests: ${error.message}</div>
            `;
        });
    }

    displayRequests() {
        const container = document.getElementById('admin-requests-list');
        if (!container) return;

        if (this.requests.length === 0) {
            container.innerHTML = '<div class="loading-admin">No requests yet</div>';
            return;
        }

        container.innerHTML = this.requests.map(request => {
            const date = request.createdAt?.toDate ? 
                request.createdAt.toDate() : 
                new Date(request.timestamp || Date.now());
                
            return `
                <div class="request-item">
                    <div class="request-header">
                        <div>
                            <span class="request-type-badge type-${request.type}">${request.type}</span>
                            <span class="status-badge status-${request.status || 'pending'}">${request.status || 'pending'}</span>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: #6b7280; font-size: 0.9rem;">${request.email}</div>
                            <div style="color: #9ca3af; font-size: 0.8rem;">${this.formatDate(date)}</div>
                        </div>
                    </div>
                    
                    <div class="request-details">
                        <strong>Request:</strong><br>
                        ${this.escapeHtml(request.details)}
                    </div>
                    
                    <div class="admin-actions">
                        ${request.status !== 'in-progress' && request.status !== 'completed' ? `
                            <button class="admin-btn btn-progress" onclick="adminPanel.updateStatus('${request.id}', 'in-progress')">
                                <i class="fas fa-clock"></i> Mark In Progress
                            </button>
                        ` : ''}
                        
                        ${request.status === 'in-progress' ? `
                            <button class="admin-btn btn-complete" onclick="adminPanel.updateStatus('${request.id}', 'completed')">
                                <i class="fas fa-check"></i> Mark Complete
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    async updateStatus(requestId, newStatus) {
        try {
            await updateDoc(doc(db, 'customization_requests', requestId), {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
            console.log(`✅ Request ${requestId} updated to ${newStatus}`);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error updating status');
        }
    }

    updateStats() {
        const pending = this.requests.filter(r => !r.status || r.status === 'pending').length;
        const inProgress = this.requests.filter(r => r.status === 'in-progress').length;
        const completed = this.requests.filter(r => r.status === 'completed').length;
        
        const pendingBadge = document.querySelector('.pending-count');
        const progressBadge = document.querySelector('.progress-count');
        const completedBadge = document.querySelector('.completed-count');
        
        if (pendingBadge) pendingBadge.textContent = `${pending} Pending`;
        if (progressBadge) progressBadge.textContent = `${inProgress} In Progress`;
        if (completedBadge) completedBadge.textContent = `${completed} Completed`;
    }

    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            if (hours === 0) {
                const mins = Math.floor(diff / (1000 * 60));
                return `${mins} minutes ago`;
            }
            return `${hours} hours ago`;
        }
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}

// ========================================
// INITIALIZE BOTH BASED ON CURRENT PAGE
// ========================================
console.log('📄 Current page:', window.location.pathname);

// Initialize form handler (only on girlfriend.html)
const formHandler = new CustomizationFormHandler();

// Initialize admin panel (only on admin.html)
const adminPanel = new AdminCustomizationPanel();

// Make admin panel globally available for onclick handlers
window.adminPanel = adminPanel;

// Export for debugging
window.raehaCustomization = {
    formHandler,
    adminPanel
};