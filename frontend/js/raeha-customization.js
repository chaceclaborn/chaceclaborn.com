// js/raeha-customization.js - Fixed with single auth listener
import { auth, db } from './firebase/config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { 
    collection, addDoc, serverTimestamp, query, 
    where, orderBy, onSnapshot, doc, updateDoc 
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ========================================
// CUSTOMIZATION REQUEST FORM HANDLER
// ========================================
class CustomizationRequestHandler {
    constructor() {
        this.currentUser = null;
        this.form = null;
        this.adminPanel = null;
        this.unsubscribe = null;
        this.authUnsubscribe = null;
        this.init();
    }

    init() {
        // Single auth listener for the entire class
        this.authUnsubscribe = onAuthStateChanged(auth, (user) => {
            console.log('💝 Raeha customization: Auth state changed', user?.email || 'null');
            this.currentUser = user;
            
            if (user) {
                // Setup form if on girlfriend page
                if (window.location.pathname.includes('girlfriend.html')) {
                    this.setupForm();
                }
                
                // Setup admin panel if on admin page and user is admin
                if (window.location.pathname.includes('admin.html') && 
                    user.email?.toLowerCase() === 'chaceclaborn@gmail.com') {
                    // Use timeout to ensure DOM is ready
                    setTimeout(() => {
                        this.adminPanel = new AdminCustomizationPanel();
                    }, 100);
                }
            }
        });
    }

    setupForm() {
        // Wait for DOM if needed
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeForm());
        } else {
            this.initializeForm();
        }
    }

    initializeForm() {
        this.form = document.getElementById('customization-request-form');
        if (!this.form) {
            console.log('📝 Customization form not found on this page');
            return;
        }

        console.log('📝 Setting up customization request form');
        
        // Remove any existing listeners
        const newForm = this.form.cloneNode(true);
        this.form.parentNode.replaceChild(newForm, this.form);
        this.form = newForm;
        
        // Add submit handler
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.currentUser) {
            alert('Please sign in to submit a request');
            return;
        }

        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            const formData = {
                type: this.form.type.value,
                description: this.form.description.value.trim(),
                priority: this.form.priority.value,
                userEmail: this.currentUser.email,
                userName: this.currentUser.displayName || this.currentUser.email.split('@')[0],
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            // Add to Firestore
            const docRef = await addDoc(collection(db, 'customization_requests'), formData);
            console.log('✅ Request submitted with ID:', docRef.id);

            // Show success message
            this.showSuccessMessage();
            
            // Reset form
            this.form.reset();
            
        } catch (error) {
            console.error('❌ Error submitting request:', error);
            alert('Failed to submit request. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    showSuccessMessage() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'success-message';
        messageDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <p>Your request has been submitted! Chace will review it soon.</p>
        `;
        
        this.form.parentElement.insertBefore(messageDiv, this.form.nextSibling);
        
        setTimeout(() => {
            messageDiv.style.animation = 'fadeOut 0.5s ease';
            setTimeout(() => messageDiv.remove(), 500);
        }, 5000);
    }

    // Cleanup method
    destroy() {
        if (this.authUnsubscribe) {
            this.authUnsubscribe();
        }
        if (this.unsubscribe) {
            this.unsubscribe();
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
        this.setupAdminPanel();
        this.subscribeToRequests();
    }

    setupAdminPanel() {
        // Find or create container
        let container = document.getElementById('customization-panel-container');
        if (!container) {
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
        
        const styles = document.createElement('style');
        styles.id = 'admin-panel-styles';
        styles.innerHTML = `
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

            .admin-request-item {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 20px;
                transition: all 0.3s;
            }

            .admin-request-item:hover {
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            }

            .request-header-admin {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 15px;
            }

            .request-info {
                flex: 1;
            }

            .request-from {
                font-weight: 600;
                color: #8b5cf6;
                margin-bottom: 5px;
            }

            .request-timestamp {
                color: #6b7280;
                font-size: 0.9rem;
            }

            .request-content {
                margin: 15px 0;
                padding: 15px;
                background: white;
                border-radius: 8px;
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
        `;

        document.head.appendChild(styles);
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
                request.createdAt.toDate().toLocaleDateString() : 'Pending';
            
            return `
                <div class="admin-request-item">
                    <div class="request-header-admin">
                        <div class="request-info">
                            <div class="request-from">From: ${request.userName || request.userEmail}</div>
                            <div class="request-timestamp">${date}</div>
                        </div>
                        <span class="request-status-badge status-${request.status}">
                            ${request.status}
                        </span>
                    </div>
                    <div class="request-content">
                        <strong>Type:</strong> ${request.type}<br>
                        <strong>Priority:</strong> ${request.priority}<br>
                        <strong>Description:</strong> ${request.description}
                    </div>
                    <div class="admin-actions">
                        ${request.status === 'pending' ? `
                            <button class="admin-btn btn-progress" 
                                    data-request-id="${request.id}">
                                Mark In Progress
                            </button>
                        ` : ''}
                        ${request.status === 'in-progress' ? `
                            <button class="admin-btn btn-complete" 
                                    data-request-id="${request.id}">
                                Mark Complete
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners to buttons
        this.attachButtonListeners();
    }

    attachButtonListeners() {
        document.querySelectorAll('.btn-progress').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.updateRequestStatus(e.target.dataset.requestId, 'in-progress');
            });
        });

        document.querySelectorAll('.btn-complete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.updateRequestStatus(e.target.dataset.requestId, 'completed');
            });
        });
    }

    async updateRequestStatus(requestId, newStatus) {
        try {
            await updateDoc(doc(db, 'customization_requests', requestId), {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
            console.log(`✅ Request ${requestId} updated to ${newStatus}`);
        } catch (error) {
            console.error('Error updating request:', error);
            alert('Failed to update request status');
        }
    }

    updateStats() {
        const pending = this.requests.filter(r => r.status === 'pending').length;
        const inProgress = this.requests.filter(r => r.status === 'in-progress').length;
        const completed = this.requests.filter(r => r.status === 'completed').length;

        const pendingEl = document.querySelector('.pending-count');
        const progressEl = document.querySelector('.progress-count');
        const completedEl = document.querySelector('.completed-count');

        if (pendingEl) pendingEl.textContent = `${pending} Pending`;
        if (progressEl) progressEl.textContent = `${inProgress} In Progress`;
        if (completedEl) completedEl.textContent = `${completed} Completed`;
    }

    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}

// Initialize the handler
const customizationHandler = new CustomizationRequestHandler();

// Export for debugging
export { customizationHandler };