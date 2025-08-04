// js/admin-customization-response.js - Admin Panel for Responding to Raeha's Requests
// Add this to your admin.html page

import { auth, db } from './firebase/config.js';
import { 
    collection, 
    getDocs, 
    query, 
    orderBy, 
    updateDoc,
    doc,
    arrayUnion,
    serverTimestamp,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

class AdminCustomizationPanel {
    constructor() {
        this.requests = [];
        this.unsubscribe = null;
        this.init();
    }

    async init() {
        // Only initialize if admin
        auth.onAuthStateChanged(async (user) => {
            if (user && user.email?.toLowerCase() === 'chaceclaborn@gmail.com') {
                console.log('👨‍💼 Admin panel initialized');
                this.setupAdminPanel();
                this.subscribeToRequests();
            }
        });
    }

    setupAdminPanel() {
        // Add admin panel to the page
        const adminSection = document.createElement('div');
        adminSection.className = 'admin-customization-panel';
        adminSection.innerHTML = `
            <div class="admin-panel-header">
                <h2><i class="fas fa-user-cog"></i> Raeha's Customization Requests</h2>
                <div class="admin-stats">
                    <span class="stat-badge pending-count">0 Pending</span>
                    <span class="stat-badge progress-count">0 In Progress</span>
                </div>
            </div>
            <div id="admin-requests-list" class="admin-requests-list">
                <div class="loading-admin">Loading requests...</div>
            </div>
        `;

        // Add styles
        const styles = `
            <style>
                .admin-customization-panel {
                    background: white;
                    border-radius: 15px;
                    padding: 30px;
                    margin: 30px 0;
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
                    color: #374151;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .admin-stats {
                    display: flex;
                    gap: 10px;
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

                .request-type-badge {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    margin-bottom: 10px;
                }

                .type-design { background: #fce7f3; color: #be185d; }
                .type-feature { background: #e0e7ff; color: #4338ca; }
                .type-content { background: #dcfce7; color: #15803d; }
                .type-photo { background: #f3e8ff; color: #7c3aed; }
                .type-other { background: #f3f4f6; color: #4b5563; }

                .priority-indicator {
                    display: inline-block;
                    margin-left: 10px;
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .priority-urgent { background: #fee2e2; color: #dc2626; }
                .priority-high { background: #fed7aa; color: #c2410c; }
                .priority-normal { background: #dbeafe; color: #2563eb; }
                .priority-low { background: #f3f4f6; color: #6b7280; }

                .admin-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                }

                .admin-btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .btn-accept {
                    background: #10b981;
                    color: white;
                }

                .btn-accept:hover {
                    background: #059669;
                }

                .btn-complete {
                    background: #3b82f6;
                    color: white;
                }

                .btn-complete:hover {
                    background: #2563eb;
                }

                .btn-reject {
                    background: #ef4444;
                    color: white;
                }

                .btn-reject:hover {
                    background: #dc2626;
                }

                .response-form {
                    margin-top: 15px;
                    padding: 15px;
                    background: white;
                    border-radius: 8px;
                    display: none;
                }

                .response-form.active {
                    display: block;
                }

                .response-textarea {
                    width: 100%;
                    padding: 10px;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    margin-bottom: 10px;
                    resize: vertical;
                }

                .response-textarea:focus {
                    outline: none;
                    border-color: #8b5cf6;
                }

                .response-submit {
                    background: #8b5cf6;
                    color: white;
                    padding: 8px 20px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                }

                .response-submit:hover {
                    background: #7c3aed;
                }

                .existing-response {
                    margin-top: 15px;
                    padding: 12px;
                    background: #f0fdf4;
                    border-left: 3px solid #10b981;
                    border-radius: 6px;
                }

                .response-label {
                    font-weight: 600;
                    color: #10b981;
                    margin-bottom: 5px;
                    font-size: 0.9rem;
                }

                .response-text {
                    color: #374151;
                }

                .loading-admin {
                    text-align: center;
                    padding: 40px;
                    color: #6b7280;
                }
            </style>
        `;

        // Add to page
        document.head.insertAdjacentHTML('beforeend', styles);
        
        const adminContainer = document.querySelector('.admin-container') || 
                               document.querySelector('main');
        if (adminContainer) {
            adminContainer.insertAdjacentHTML('afterbegin', adminSection.outerHTML);
        }
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
            const date = request.createdAt?.toDate ? request.createdAt.toDate() : new Date();
            const hasResponse = request.responses && request.responses.length > 0;

            return `
                <div class="admin-request-item" data-id="${request.id}">
                    <div class="request-header-admin">
                        <div class="request-info">
                            <div class="request-from">From: ${request.createdBy.name || request.createdBy.email}</div>
                            <div class="request-timestamp">${this.formatDate(date)}</div>
                        </div>
                        <span class="request-status-badge status-${request.status}">
                            ${request.status}
                        </span>
                    </div>
                    
                    <div class="request-content">
                        <span class="request-type-badge type-${request.type}">
                            ${request.type.toUpperCase()}
                        </span>
                        <span class="priority-indicator priority-${request.priority}">
                            ${request.priority.toUpperCase()} PRIORITY
                        </span>
                        <div style="margin-top: 10px; color: #374151;">
                            ${request.details}
                        </div>
                    </div>

                    ${hasResponse ? `
                        <div class="existing-response">
                            <div class="response-label">Your Response:</div>
                            <div class="response-text">${request.responses[request.responses.length - 1].message}</div>
                        </div>
                    ` : ''}

                    <div class="admin-actions">
                        ${request.status === 'pending' ? `
                            <button class="admin-btn btn-accept" onclick="adminPanel.updateStatus('${request.id}', 'in-progress')">
                                <i class="fas fa-play"></i> Start Working
                            </button>
                        ` : ''}
                        
                        ${request.status === 'in-progress' ? `
                            <button class="admin-btn btn-complete" onclick="adminPanel.updateStatus('${request.id}', 'completed')">
                                <i class="fas fa-check"></i> Mark Complete
                            </button>
                        ` : ''}
                        
                        ${request.status !== 'completed' ? `
                            <button class="admin-btn btn-reject" onclick="adminPanel.updateStatus('${request.id}', 'rejected')">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        ` : ''}
                        
                        <button class="admin-btn" onclick="adminPanel.toggleResponseForm('${request.id}')">
                            <i class="fas fa-reply"></i> Respond
                        </button>
                    </div>

                    <div class="response-form" id="response-form-${request.id}">
                        <textarea 
                            class="response-textarea" 
                            id="response-text-${request.id}"
                            placeholder="Write your response to Raeha..."
                            rows="3"
                        ></textarea>
                        <button class="response-submit" onclick="adminPanel.sendResponse('${request.id}')">
                            Send Response
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async updateStatus(requestId, newStatus) {
        try {
            await updateDoc(doc(db, 'customization_requests', requestId), {
                status: newStatus,
                updatedAt: serverTimestamp(),
                ...(newStatus === 'completed' ? { completed: true } : {})
            });
            
            console.log(`✅ Request ${requestId} updated to ${newStatus}`);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    }

    toggleResponseForm(requestId) {
        const form = document.getElementById(`response-form-${requestId}`);
        if (form) {
            form.classList.toggle('active');
            if (form.classList.contains('active')) {
                document.getElementById(`response-text-${requestId}`)?.focus();
            }
        }
    }

    async sendResponse(requestId) {
        const textarea = document.getElementById(`response-text-${requestId}`);
        const message = textarea?.value.trim();
        
        if (!message) {
            alert('Please enter a response');
            return;
        }

        try {
            const response = {
                message: message,
                timestamp: new Date(),
                by: 'Chace'
            };

            await updateDoc(doc(db, 'customization_requests', requestId), {
                responses: arrayUnion(response),
                updatedAt: serverTimestamp()
            });

            textarea.value = '';
            this.toggleResponseForm(requestId);
            console.log('✅ Response sent');
        } catch (error) {
            console.error('Error sending response:', error);
            alert('Error sending response');
        }
    }

    updateStats() {
        const pending = this.requests.filter(r => r.status === 'pending').length;
        const inProgress = this.requests.filter(r => r.status === 'in-progress').length;
        
        const pendingBadge = document.querySelector('.pending-count');
        const progressBadge = document.querySelector('.progress-count');
        
        if (pendingBadge) pendingBadge.textContent = `${pending} Pending`;
        if (progressBadge) progressBadge.textContent = `${inProgress} In Progress`;
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

    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}

// Initialize globally for onclick handlers
window.adminPanel = new AdminCustomizationPanel();