// js/firebase/terms-manager.js - Terms Acceptance Management System
// This ensures ALL users accept terms once, regardless of how they signed up

import { auth, db } from './config.js';
import { doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

class TermsManager {
  constructor() {
    this.termsChecked = false;
    this.currentUser = null;
  }

  // Initialize terms checking
  async init() {
    // Wait for auth state
    auth.onAuthStateChanged(async (user) => {
      if (user && !this.termsChecked) {
        this.currentUser = user;
        this.termsChecked = true;
        
        // Check if user has accepted terms
        const hasAcceptedTerms = await this.checkTermsAcceptance(user.uid);
        
        if (!hasAcceptedTerms) {
          // Show terms modal
          setTimeout(() => {
            this.showTermsModal();
          }, 1000); // Small delay to ensure page is loaded
        }
      } else if (!user) {
        this.termsChecked = false;
        this.currentUser = null;
      }
    });
  }

  // Check if user has accepted terms
  async checkTermsAcceptance(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.termsAccepted === true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking terms acceptance:', error);
      return false; // Show terms on error to be safe
    }
  }

  // Show terms modal
  showTermsModal() {
    // Check if modal already exists
    if (document.getElementById('termsRequiredModal')) {
      return;
    }

    const modalHTML = `
      <div id="termsRequiredModal" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10002;
      ">
        <div style="
          background: white;
          border-radius: 15px;
          padding: 40px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        ">
          <h2 style="color: #333; margin-bottom: 20px; text-align: center;">Welcome to ChaceClaborn.com</h2>
          
          <p style="color: #666; margin-bottom: 20px; text-align: center;">
            Before continuing, please review and accept our Terms of Service and Privacy Policy.
          </p>
          
          <div style="
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
          ">
            <button onclick="termsManager.showTermsContent()" style="
              flex: 1;
              padding: 12px;
              background: #617140;
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-size: 15px;
            ">View Terms of Service</button>
            
            <button onclick="termsManager.showPrivacyContent()" style="
              flex: 1;
              padding: 12px;
              background: #617140;
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-size: 15px;
            ">View Privacy Policy</button>
          </div>
          
          <div id="termsContent" style="
            display: none;
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            max-height: 300px;
            overflow-y: auto;
          ">
            <h3 style="color: #333; margin-bottom: 15px;">Terms of Service</h3>
            <div style="color: #555; font-size: 14px; line-height: 1.6;">
              <p><strong>1. Acceptance of Terms</strong><br>
              By accessing and using chaceclaborn.com, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
              
              <p><strong>2. User Accounts</strong><br>
              When you create an account, you must provide accurate and complete information. You are responsible for safeguarding your account.</p>
              
              <p><strong>3. Privacy</strong><br>
              Your use of our service is governed by our Privacy Policy.</p>
              
              <p><strong>4. Content</strong><br>
              All content on this website is the property of Chace Claborn unless otherwise stated.</p>
              
              <p><strong>5. Termination</strong><br>
              We reserve the right to terminate or suspend your account at our discretion.</p>
              
              <p><strong>6. Limitation of Liability</strong><br>
              The website and its content are provided "as is" without warranties of any kind.</p>
              
              <p><strong>7. Changes to Terms</strong><br>
              We may modify these terms at any time. Continued use constitutes acceptance.</p>
              
              <p><strong>8. Contact</strong><br>
              For questions about these Terms, contact chaceclaborn@gmail.com.</p>
            </div>
          </div>
          
          <div id="privacyContent" style="
            display: none;
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            max-height: 300px;
            overflow-y: auto;
          ">
            <h3 style="color: #333; margin-bottom: 15px;">Privacy Policy</h3>
            <div style="color: #555; font-size: 14px; line-height: 1.6;">
              <p><strong>Information We Collect</strong><br>
              We collect information you provide directly to us, including email, display name, and authentication data.</p>
              
              <p><strong>How We Use Information</strong><br>
              We use information to provide, maintain, and improve our services, and to protect against unauthorized access.</p>
              
              <p><strong>Information Sharing</strong><br>
              We do not sell or rent your personal information to third parties.</p>
              
              <p><strong>Data Security</strong><br>
              We implement appropriate technical and organizational measures to protect your personal data.</p>
              
              <p><strong>Your Rights</strong><br>
              You have the right to access, correct, or delete your personal information.</p>
              
              <p><strong>Cookies</strong><br>
              We use cookies to enhance your experience on our website.</p>
              
              <p><strong>Changes</strong><br>
              We may update this policy from time to time.</p>
              
              <p><strong>Contact</strong><br>
              For privacy concerns, contact chaceclaborn@gmail.com.</p>
            </div>
          </div>
          
          <div style="
            background: #f0f8ff;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #617140;
          ">
            <label style="
              display: flex;
              align-items: flex-start;
              cursor: pointer;
              font-size: 15px;
              color: #333;
            ">
              <input type="checkbox" id="termsCheckbox" style="
                margin-right: 10px;
                margin-top: 2px;
                width: 18px;
                height: 18px;
                cursor: pointer;
              ">
              <span>I have read and agree to the Terms of Service and Privacy Policy</span>
            </label>
          </div>
          
          <div id="termsErrorMsg" style="
            display: none;
            background: #fee;
            color: #c00;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 15px;
            text-align: center;
            font-size: 14px;
          ">
            Please accept the Terms of Service and Privacy Policy to continue
          </div>
          
          <div style="
            display: flex;
            gap: 15px;
          ">
            <button id="termsAcceptBtn" onclick="termsManager.acceptTerms()" style="
              flex: 1;
              padding: 14px;
              background: #617140;
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-size: 16px;
              font-weight: 600;
              transition: all 0.3s ease;
            ">Accept and Continue</button>
            
            <button id="termsDeclineBtn" onclick="termsManager.declineTerms()" style="
              padding: 14px 20px;
              background: #f44336;
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-size: 16px;
              transition: all 0.3s ease;
            ">Decline</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  // Show terms content
  showTermsContent() {
    const termsContent = document.getElementById('termsContent');
    const privacyContent = document.getElementById('privacyContent');
    
    if (termsContent.style.display === 'none') {
      termsContent.style.display = 'block';
      privacyContent.style.display = 'none';
    } else {
      termsContent.style.display = 'none';
    }
  }

  // Show privacy content
  showPrivacyContent() {
    const privacyContent = document.getElementById('privacyContent');
    const termsContent = document.getElementById('termsContent');
    
    if (privacyContent.style.display === 'none') {
      privacyContent.style.display = 'block';
      termsContent.style.display = 'none';
    } else {
      privacyContent.style.display = 'none';
    }
  }

  // Hide terms modal
  hideTermsModal() {
    const modal = document.getElementById('termsRequiredModal');
    if (modal) {
      modal.remove();
    }
  }

  // Accept terms
  async acceptTerms() {
    const checkbox = document.getElementById('termsCheckbox');
    const errorDiv = document.getElementById('termsErrorMsg');
    const acceptBtn = document.getElementById('termsAcceptBtn');
    
    if (!checkbox.checked) {
      errorDiv.style.display = 'block';
      return;
    }
    
    try {
      // Disable button and show loading
      acceptBtn.disabled = true;
      acceptBtn.textContent = 'Saving...';
      
      // Update user document
      await updateDoc(doc(db, 'users', this.currentUser.uid), {
        termsAccepted: true,
        termsAcceptedAt: serverTimestamp(),
        termsVersion: '1.0' // Track version for future updates
      });
      
      console.log('✅ Terms accepted and saved');
      
      // Show success
      acceptBtn.textContent = '✅ Terms Accepted!';
      acceptBtn.style.background = '#4caf50';
      
      // Hide modal after short delay
      setTimeout(() => {
        this.hideTermsModal();
      }, 1000);
      
    } catch (error) {
      console.error('Error accepting terms:', error);
      errorDiv.textContent = 'Error saving your acceptance. Please try again.';
      errorDiv.style.display = 'block';
      acceptBtn.disabled = false;
      acceptBtn.textContent = 'Accept and Continue';
    }
  }

  // Decline terms and sign out
  async declineTerms() {
    if (confirm('If you decline the terms, you will be signed out. Are you sure?')) {
      try {
        await auth.signOut();
        this.hideTermsModal();
        
        // Redirect to home page
        if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
  }
}

// Create and export the terms manager instance
const termsManager = new TermsManager();

// Make it globally available for onclick handlers
window.termsManager = termsManager;

// Auto-initialize when module is imported
termsManager.init();

export default termsManager;