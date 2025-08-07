// js/firebase/terms-manager.js - Standalone Terms of Service Manager
import { auth, db } from './config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

class TermsManager {
  constructor() {
    this.currentVersion = '1.0';
    this.termsModalCreated = false;
    this.checkInterval = null;
    this.isChecking = false;
  }

  // Initialize the terms manager
  init() {
    console.log('📋 Terms Manager: Initializing...');
    
    // Create the modal immediately
    this.createTermsModal();
    
    // Listen for auth state changes
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('📋 Terms Manager: User signed in:', user.email);
        // Add a small delay to ensure user profile is created
        setTimeout(() => this.checkUserTerms(user), 1000);
      } else {
        console.log('📋 Terms Manager: User signed out');
        this.hideTermsModal();
        if (this.checkInterval) {
          clearInterval(this.checkInterval);
          this.checkInterval = null;
        }
      }
    });
  }

  // Check if user has accepted current terms
  async checkUserTerms(user) {
    if (this.isChecking) return;
    this.isChecking = true;
    
    try {
      console.log('📋 Terms Manager: Checking terms for user:', user.email);
      
      const userRef = doc(db, 'users', user.uid);
      let userDoc = await getDoc(userRef);
      
      // If no user document exists, wait a bit for it to be created
      if (!userDoc.exists()) {
        console.log('📋 Terms Manager: No user document found, waiting...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        userDoc = await getDoc(userRef);
      }
      
      let hasAcceptedTerms = false;
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        hasAcceptedTerms = userData.termsAccepted === true && userData.termsVersion === this.currentVersion;
        
        console.log('📋 Terms Manager: User document found:', {
          termsAccepted: userData.termsAccepted,
          termsVersion: userData.termsVersion,
          currentVersion: this.currentVersion,
          hasAcceptedTerms
        });
      } else {
        console.log('📋 Terms Manager: User document still not found after waiting');
      }
      
      if (!hasAcceptedTerms) {
        console.log('📋 Terms Manager: User needs to accept terms');
        this.showTermsModal(user);
        
        // Keep checking periodically in case of issues
        if (!this.checkInterval) {
          this.checkInterval = setInterval(() => {
            if (auth.currentUser) {
              this.checkUserTerms(auth.currentUser);
            }
          }, 5000);
        }
      } else {
        console.log('📋 Terms Manager: User has already accepted current terms');
        this.hideTermsModal();
        if (this.checkInterval) {
          clearInterval(this.checkInterval);
          this.checkInterval = null;
        }
      }
    } catch (error) {
      console.error('📋 Terms Manager: Error checking terms:', error);
      // Show terms modal on error to be safe
      this.showTermsModal(user);
    } finally {
      this.isChecking = false;
    }
  }

  // Create the terms modal
  createTermsModal() {
    if (this.termsModalCreated) return;
    
    const modalHTML = `
      <div id="termsRequiredModal" style="
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 9999;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          background: white;
          padding: 2rem;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
        ">
          <h2 style="margin: 0 0 1rem 0; color: #333;">Terms of Service Agreement Required</h2>
          
          <div style="
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 4px;
            margin-bottom: 1rem;
          ">
            <p style="margin: 0; color: #666;">
              Welcome to ChaceClaborn.com! Before continuing, please review and accept our Terms of Service.
            </p>
          </div>
          
          <div id="termsContent" style="
            border: 1px solid #ddd;
            padding: 1rem;
            margin: 1rem 0;
            max-height: 300px;
            overflow-y: auto;
            background: #fafafa;
          ">
            <h3>Terms of Service</h3>
            <p><strong>Last Updated: January 2025 (Version 1.0)</strong></p>
            
            <h4>1. Acceptance of Terms</h4>
            <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
            
            <h4>2. Use License</h4>
            <p>Permission is granted to temporarily access the materials on this website for personal, non-commercial viewing only.</p>
            
            <h4>3. User Accounts</h4>
            <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
            
            <h4>4. Content Access</h4>
            <p>Different content tiers are available based on user permissions. You agree to respect these access levels and not attempt to circumvent them.</p>
            
            <h4>5. Privacy</h4>
            <p>Your use of this website is also governed by our Privacy Policy. We respect your privacy and handle your data in accordance with applicable laws.</p>
            
            <h4>6. Prohibited Uses</h4>
            <p>You may not use this site:</p>
            <ul>
              <li>For any unlawful purpose</li>
              <li>To solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
            </ul>
            
            <h4>7. Disclaimer</h4>
            <p>The materials on this website are provided on an 'as is' basis. ChaceClaborn.com makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
            
            <h4>8. Modifications</h4>
            <p>These terms may be revised at any time without notice. By using this website, you agree to be bound by the current version of these Terms of Service.</p>
            
            <h4>9. Governing Law</h4>
            <p>These terms and conditions are governed by and construed in accordance with the laws of the United States and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
          </div>
          
          <div style="
            background: #fff3cd;
            color: #856404;
            padding: 0.75rem;
            border-radius: 4px;
            margin: 1rem 0;
            border: 1px solid #ffeaa7;
          ">
            <strong>Important:</strong> You must accept these terms to continue using ChaceClaborn.com
          </div>
          
          <div style="margin: 1.5rem 0;">
            <label style="
              display: flex;
              align-items: flex-start;
              cursor: pointer;
              font-size: 1rem;
            ">
              <input type="checkbox" id="termsCheckbox" style="
                margin-right: 0.5rem;
                margin-top: 0.2rem;
                cursor: pointer;
              ">
              <span>I have read and agree to the Terms of Service</span>
            </label>
          </div>
          
          <div style="display: flex; gap: 1rem; justify-content: flex-end;">
            <button id="termsDeclineBtn" style="
              padding: 0.75rem 1.5rem;
              border: 1px solid #dc3545;
              background: white;
              color: #dc3545;
              border-radius: 4px;
              cursor: pointer;
              font-size: 1rem;
            ">Decline & Sign Out</button>
            
            <button id="termsAcceptBtn" disabled style="
              padding: 0.75rem 1.5rem;
              border: none;
              background: #617140;
              color: white;
              border-radius: 4px;
              cursor: not-allowed;
              font-size: 1rem;
              opacity: 0.6;
            ">Accept Terms</button>
          </div>
          
          <div id="termsError" style="
            display: none;
            background: #f8d7da;
            color: #721c24;
            padding: 0.75rem;
            border-radius: 4px;
            margin-top: 1rem;
          "></div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.termsModalCreated = true;
    
    // Set up event listeners
    this.setupEventListeners();
  }

  // Set up event listeners
  setupEventListeners() {
    const checkbox = document.getElementById('termsCheckbox');
    const acceptBtn = document.getElementById('termsAcceptBtn');
    const declineBtn = document.getElementById('termsDeclineBtn');
    
    if (checkbox) {
      checkbox.addEventListener('change', (e) => {
        if (acceptBtn) {
          acceptBtn.disabled = !e.target.checked;
          acceptBtn.style.cursor = e.target.checked ? 'pointer' : 'not-allowed';
          acceptBtn.style.opacity = e.target.checked ? '1' : '0.6';
        }
      });
    }
    
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => this.acceptTerms());
    }
    
    if (declineBtn) {
      declineBtn.addEventListener('click', () => this.declineTerms());
    }
  }

  // Show the terms modal
  showTermsModal(user) {
    console.log('📋 Terms Manager: Showing terms modal for user:', user.email);
    const modal = document.getElementById('termsRequiredModal');
    if (modal) {
      modal.style.display = 'flex';
      // Force to top
      modal.style.zIndex = '10000';
      
      // Reset checkbox
      const checkbox = document.getElementById('termsCheckbox');
      if (checkbox) {
        checkbox.checked = false;
      }
      
      // Reset accept button
      const acceptBtn = document.getElementById('termsAcceptBtn');
      if (acceptBtn) {
        acceptBtn.disabled = true;
        acceptBtn.style.cursor = 'not-allowed';
        acceptBtn.style.opacity = '0.6';
      }
      
      // Update user info in modal
      const modalContent = modal.querySelector('.modal-content') || modal.querySelector('div > div');
      if (modalContent) {
        const existingUserInfo = modalContent.querySelector('.user-info-display');
        if (!existingUserInfo) {
          const userInfo = document.createElement('div');
          userInfo.className = 'user-info-display';
          userInfo.style.cssText = 'background: #e3f2fd; padding: 0.5rem; border-radius: 4px; margin-bottom: 1rem; text-align: center;';
          userInfo.innerHTML = `<strong>Signed in as:</strong> ${user.email}`;
          modalContent.insertBefore(userInfo, modalContent.firstChild.nextSibling);
        }
      }
    }
  }

  // Hide the terms modal
  hideTermsModal() {
    const modal = document.getElementById('termsRequiredModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // Accept terms
  async acceptTerms() {
    const user = auth.currentUser;
    if (!user) {
      console.error('📋 Terms Manager: No user signed in');
      return;
    }
    
    const acceptBtn = document.getElementById('termsAcceptBtn');
    const errorDiv = document.getElementById('termsError');
    
    if (acceptBtn) {
      acceptBtn.disabled = true;
      acceptBtn.textContent = 'Saving...';
    }
    
    try {
      const userRef = doc(db, 'users', user.uid);
      
      // Update user document with terms acceptance
      await setDoc(userRef, {
        termsAccepted: true,
        termsAcceptedAt: serverTimestamp(),
        termsVersion: this.currentVersion,
        termsAcceptedBy: user.email
      }, { merge: true });
      
      console.log('📋 Terms Manager: Terms accepted successfully');
      
      // Log activity (optional - only if databaseService is available)
      try {
        const { default: databaseService } = await import('./database.js');
        if (databaseService && databaseService.logUserActivity) {
          await databaseService.logUserActivity(user.uid, 'terms_accepted', {
            version: this.currentVersion,
            method: 'manual_acceptance'
          });
        }
      } catch (logError) {
        console.log('📋 Terms Manager: Could not log activity (not critical):', logError);
      }
      
      // Clear the check interval
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
      }
      
      // Show success message
      if (acceptBtn) {
        acceptBtn.textContent = '✓ Terms Accepted!';
        acceptBtn.style.background = '#28a745';
      }
      
      // Hide modal after short delay
      setTimeout(() => {
        this.hideTermsModal();
      }, 1000);
      
    } catch (error) {
      console.error('📋 Terms Manager: Error accepting terms:', error);
      if (errorDiv) {
        errorDiv.textContent = 'Error saving your acceptance. Please try again.';
        errorDiv.style.display = 'block';
      }
      if (acceptBtn) {
        acceptBtn.disabled = false;
        acceptBtn.textContent = 'Accept Terms';
      }
    }
  }

  // Decline terms and sign out
  async declineTerms() {
    console.log('📋 Terms Manager: User declined terms');
    try {
      await auth.signOut();
      this.hideTermsModal();
      
      // Redirect to home page
      if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('📋 Terms Manager: Error signing out:', error);
    }
  }
}

// Create and export the terms manager instance
const termsManager = new TermsManager();

// Auto-initialize when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    termsManager.init();
    termsManager.addFooterLink();
  });
} else {
  termsManager.init();
  termsManager.addFooterLink();
}

// Add method to show terms to logged-in users
termsManager.addFooterLink = function() {
  // Wait a bit for footer to load
  setTimeout(() => {
    const footer = document.querySelector('.site-footer') || document.querySelector('footer');
    if (footer) {
      const footerContent = footer.querySelector('.footer-content') || footer;
      
      // Check if link already exists
      if (!document.getElementById('footer-terms-link')) {
        const termsLink = document.createElement('div');
        termsLink.style.cssText = 'text-align: center; margin-top: 10px; font-size: 0.8rem; opacity: 0.7;';
        termsLink.innerHTML = `
          <a href="#" id="footer-terms-link" style="color: inherit; text-decoration: none; margin: 0 5px;">Terms of Service</a>
          <span>•</span>
          <a href="#" id="footer-privacy-link" style="color: inherit; text-decoration: none; margin: 0 5px;">Privacy Policy</a>
        `;
        footerContent.appendChild(termsLink);
        
        // Add click handlers
        document.getElementById('footer-terms-link').addEventListener('click', (e) => {
          e.preventDefault();
          termsManager.showTermsForReview();
        });
        
        document.getElementById('footer-privacy-link').addEventListener('click', (e) => {
          e.preventDefault();
          termsManager.showTermsForReview();
        });
      }
    }
  }, 1000);
};

// Method to show terms for review (not enforcement)
termsManager.showTermsForReview = function() {
  const modal = document.getElementById('termsRequiredModal');
  if (modal) {
    // Hide enforcement elements
    const acceptBtn = document.getElementById('termsAcceptBtn');
    const declineBtn = document.getElementById('termsDeclineBtn');
    const checkbox = document.getElementById('termsCheckbox');
    const checkboxContainer = checkbox ? checkbox.parentElement.parentElement : null;
    
    if (acceptBtn) acceptBtn.style.display = 'none';
    if (declineBtn) declineBtn.style.display = 'none';
    if (checkboxContainer) checkboxContainer.style.display = 'none';
    
    // Show close button instead
    const modalContent = modal.querySelector('div > div');
    if (modalContent) {
      const existingCloseBtn = modalContent.querySelector('.review-close-btn');
      if (!existingCloseBtn) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'review-close-btn';
        closeBtn.textContent = 'Close';
        closeBtn.style.cssText = `
          padding: 0.75rem 2rem;
          border: none;
          background: #617140;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          margin: 1rem auto;
          display: block;
        `;
        closeBtn.onclick = () => this.hideTermsModal();
        modalContent.appendChild(closeBtn);
      }
    }
    
    modal.style.display = 'flex';
  }
};

export default termsManager;