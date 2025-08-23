// frontend/js/components/AuthButton.jsx
import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';
import { signInWithGoogle, signOutUser } from '../firebase/auth-service.js';

const AuthButton = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);

    useEffect(() => {
        // Listen to auth state changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log('🔐 AuthButton: Auth state changed:', currentUser?.email || 'null');
            setUser(currentUser);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => {
            console.log('🧹 AuthButton: Cleaning up auth listener');
            unsubscribe();
        };
    }, []);

    const handleSignIn = async () => {
        if (authLoading) return;
        
        try {
            setAuthLoading(true);
            console.log('🚀 AuthButton: Starting sign in...');
            await signInWithGoogle();
            // User state will update automatically via onAuthStateChanged
        } catch (error) {
            if (error.code !== 'auth/popup-closed-by-user' && 
                error.code !== 'auth/cancelled-popup-request') {
                console.error('Sign in error:', error);
                alert('Sign in failed. Please try again.');
            }
        } finally {
            setAuthLoading(false);
        }
    };

    const handleSignOut = async () => {
        if (authLoading) return;
        
        try {
            setAuthLoading(true);
            console.log('👋 AuthButton: Signing out...');
            await signOutUser();
            
            // Check if we're on a protected page
            const protectedPages = ['admin', 'family', 'girlfriend', 'dashboard'];
            const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
            
            if (protectedPages.includes(currentPage)) {
                // Redirect to home
                window.location.href = window.location.pathname.includes('/pages/') 
                    ? '../index.html' 
                    : 'index.html';
            }
        } catch (error) {
            console.error('Sign out error:', error);
            alert('Sign out failed. Please try again.');
        } finally {
            setAuthLoading(false);
        }
    };

    // Initial loading state
    if (loading) {
        return (
            <div className="auth-loading-state" style={{
                padding: '0.75rem 1.5rem',
                color: '#617140',
                fontStyle: 'italic'
            }}>
                Loading...
            </div>
        );
    }

    // Render based on auth state
    if (user) {
        // User is signed IN
        return (
            <div className="user-info" id="user-info" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                {user.photoURL && (
                    <img 
                        className="user-avatar" 
                        id="user-photo"
                        src={user.photoURL} 
                        alt="User Avatar"
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #617140'
                        }}
                    />
                )}
                <span id="user-name" style={{ display: 'none' }}>
                    {user.displayName || user.email?.split('@')[0]}
                </span>
                <span id="user-email" style={{ display: 'none' }}>
                    {user.email}
                </span>
                <button 
                    className="btn-modern sign-out-btn"
                    id="logout-btn"
                    onClick={handleSignOut}
                    disabled={authLoading}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: authLoading ? '#9ca584' : '#617140',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: authLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 6px rgba(97, 113, 64, 0.3)',
                        opacity: authLoading ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => {
                        if (!authLoading) {
                            e.target.style.background = '#7a8e5a';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(97, 113, 64, 0.4)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!authLoading) {
                            e.target.style.background = '#617140';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 6px rgba(97, 113, 64, 0.3)';
                        }
                    }}
                >
                    {authLoading ? 'Signing out...' : 'Sign Out'}
                </button>
            </div>
        );
    } else {
        // User is signed OUT
        return (
            <button 
                className="btn-modern"
                id="login-btn"
                onClick={handleSignIn}
                disabled={authLoading}
                style={{
                    padding: '0.75rem 1.5rem',
                    background: authLoading ? '#9ca584' : '#617140',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: authLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'inline-block',
                    boxShadow: '0 2px 6px rgba(97, 113, 64, 0.3)',
                    opacity: authLoading ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                    if (!authLoading) {
                        e.target.style.background = '#7a8e5a';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(97, 113, 64, 0.4)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!authLoading) {
                        e.target.style.background = '#617140';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 6px rgba(97, 113, 64, 0.3)';
                    }
                }}
            >
                {authLoading ? 'Signing in...' : 'Sign In'}
            </button>
        );
    }
};

export default AuthButton;