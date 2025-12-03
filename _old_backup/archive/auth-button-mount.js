// frontend/js/components/auth-button-mount.js
// This script mounts the React AuthButton component on any page

import React from 'react';
import ReactDOM from 'react-dom/client';
import AuthButton from './AuthButton.jsx';

// Wait for DOM to be ready
function mountAuthButton() {
    const container = document.getElementById('auth-button-container');
    
    if (!container) {
        console.error('❌ Auth button container not found! Add <div id="auth-button-container"></div> to your HTML');
        return;
    }
    
    console.log('🎯 Mounting React AuthButton component...');
    
    // Create React root and render the component
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(AuthButton));
    
    console.log('✅ AuthButton component mounted successfully');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountAuthButton);
} else {
    mountAuthButton();
}

// Export for debugging
window.debugAuthButton = function() {
    const container = document.getElementById('auth-button-container');
    console.log('=== Auth Button Debug ===');
    console.log('Container found:', !!container);
    console.log('Container location:', container);
    console.log('React mounted:', container?._reactRootContainer ? 'Yes' : 'No');
};