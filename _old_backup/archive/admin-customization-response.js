// Admin Customization Response Handler
import { auth, db } from './firebase/config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';
import { doc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';

class AdminResponseHandler {
    constructor() {
        // Only initialize on admin page
        if (!window.location.pathname.includes('admin.html')) {
            console.log('Not on admin page, skipping admin response handler');
            return;
        }
        
        // Wait for auth to be ready before initializing
        this.waitForAuth();
    }

    waitForAuth() {
        // Use auth state observer to ensure auth is ready
        this.authUnsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && user.email?.toLowerCase() === 'chaceclaborn@gmail.com') {
                console.log('Admin authenticated, initializing response handler');
                this.init();
            } else if (!user) {
                console.log('No user signed in, skipping admin response handler');
            }
        });
    }

    init() {
        // Ensure we only init once
        if (this.initialized) return;
        this.initialized = true;
        
        // Wait for DOM to be fully ready and other scripts to load
        setTimeout(() => {
            this.attachEventListeners();
        }, 100);
    }

    attachEventListeners() {
        // Check if we're still on admin page
        if (!window.location.pathname.includes('admin.html')) return;
        
        // Delegate event handling for dynamically created buttons
        document.addEventListener('click', async (e) => {
            // Only handle clicks on admin buttons
            const target = e.target;
            
            if (target.classList.contains('btn-accept') || target.closest('.btn-accept')) {
                e.preventDefault();
                e.stopPropagation();
                const requestId = target.dataset.requestId || target.closest('.btn-accept').dataset.requestId;
                if (requestId) await this.updateStatus(requestId, 'in-progress');
            } else if (target.classList.contains('btn-complete') || target.closest('.btn-complete')) {
                e.preventDefault();
                e.stopPropagation();
                const requestId = target.dataset.requestId || target.closest('.btn-complete').dataset.requestId;
                if (requestId) await this.updateStatus(requestId, 'completed');
            } else if (target.classList.contains('btn-reject') || target.closest('.btn-reject')) {
                e.preventDefault();
                e.stopPropagation();
                const requestId = target.dataset.requestId || target.closest('.btn-reject').dataset.requestId;
                if (requestId) {
                    const reason = prompt('Reason for rejection (optional):');
                    await this.updateStatus(requestId, 'rejected', reason);
                }
            } else if (target.classList.contains('btn-add-response') || target.closest('.btn-add-response')) {
                e.preventDefault();
                e.stopPropagation();
                const requestId = target.dataset.requestId || target.closest('.btn-add-response').dataset.requestId;
                if (requestId) this.showResponseForm(requestId);
            }
        });

        // Handle response form submissions
        document.addEventListener('submit', async (e) => {
            if (e.target.classList.contains('admin-response-form')) {
                e.preventDefault();
                const requestId = e.target.dataset.requestId;
                const response = e.target.querySelector('textarea').value;
                if (requestId && response) {
                    await this.addResponse(requestId, response);
                }
            }
        });
    }

    async updateStatus(requestId, status, reason = null) {
        if (!requestId) {
            console.error('No request ID provided');
            return;
        }
        
        try {
            const updates = {
                status: status,
                updatedAt: serverTimestamp()
            };

            if (status === 'in-progress') {
                updates.startedAt = serverTimestamp();
            } else if (status === 'completed') {
                updates.completedAt = serverTimestamp();
            } else if (status === 'rejected' && reason) {
                updates.rejectionReason = reason;
            }

            await updateDoc(doc(db, 'customization_requests', requestId), updates);
            
            // Show success message
            this.showNotification(`Status updated to ${status}`, 'success');
        } catch (error) {
            console.error('Error updating status:', error);
            this.showNotification('Failed to update status', 'error');
        }
    }

    showResponseForm(requestId) {
        if (!requestId) return;
        
        const requestElement = document.querySelector(`[data-request-id="${requestId}"]`)?.closest('.admin-request-item');
        if (!requestElement) return;

        // Check if form already exists
        let formContainer = requestElement.querySelector('.response-form-container');
        if (formContainer) {
            formContainer.remove();
            return;
        }

        // Create response form
        formContainer = document.createElement('div');
        formContainer.className = 'response-form-container';
        formContainer.innerHTML = `
            <form class="admin-response-form" data-request-id="${requestId}">
                <h4>Add Response</h4>
                <textarea 
                    placeholder="Enter your response to Raeha..." 
                    required
                    rows="4"
                ></textarea>
                <div class="form-actions">
                    <button type="submit" class="btn-submit-response">
                        <i class="fas fa-paper-plane"></i> Send Response
                    </button>
                    <button type="button" class="btn-cancel" onclick="this.closest('.response-form-container').remove()">
                        Cancel
                    </button>
                </div>
            </form>
        `;

        requestElement.appendChild(formContainer);
    }

    async addResponse(requestId, responseText) {
        if (!requestId || !responseText) {
            console.error('Missing request ID or response text');
            return;
        }
        
        try {
            const responseData = {
                adminResponse: responseText,
                respondedAt: serverTimestamp(),
                status: 'in-progress'
            };

            await updateDoc(doc(db, 'customization_requests', requestId), responseData);
            
            // Remove form
            const formContainer = document.querySelector(`[data-request-id="${requestId}"]`)
                ?.closest('.admin-request-item')
                ?.querySelector('.response-form-container');
            
            if (formContainer) {
                formContainer.remove();
            }

            this.showNotification('Response sent successfully', 'success');
        } catch (error) {
            console.error('Error adding response:', error);
            this.showNotification('Failed to send response', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `admin-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;

        // Add to page
        document.body.appendChild(notification);

        // Add styles if not already present
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.innerHTML = `
                .admin-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    background: white;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: slideIn 0.3s ease;
                    z-index: 10000;
                }
                
                .admin-notification.success {
                    background: #10b981;
                    color: white;
                }
                
                .admin-notification.error {
                    background: #ef4444;
                    color: white;
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }

                .response-form-container {
                    margin-top: 20px;
                    padding: 20px;
                    background: #f3f4f6;
                    border-radius: 8px;
                }

                .admin-response-form h4 {
                    margin: 0 0 15px 0;
                    color: #374151;
                }

                .admin-response-form textarea {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 14px;
                    resize: vertical;
                    box-sizing: border-box;
                }

                .form-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 15px;
                }

                .btn-submit-response {
                    background: #3b82f6;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .btn-submit-response:hover {
                    background: #2563eb;
                }

                .btn-cancel {
                    background: #6b7280;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                }
                
                .btn-cancel:hover {
                    background: #4b5563;
                }
            `;
            document.head.appendChild(styles);
        }

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Clean up method
    destroy() {
        if (this.authUnsubscribe) {
            this.authUnsubscribe();
        }
    }
}

// Initialize only when module loads
let responseHandler = null;

// Only create instance if we're on the right page
if (window.location.pathname.includes('admin.html')) {
    responseHandler = new AdminResponseHandler();
}

export default responseHandler;