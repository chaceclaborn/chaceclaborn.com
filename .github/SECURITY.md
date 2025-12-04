# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public GitHub issue
2. Email security concerns to: chaceclaborn@gmail.com
3. Include detailed information about the vulnerability
4. Allow reasonable time for a response and fix before public disclosure

## Security Measures

This project implements the following security measures:

### Headers
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection
- Strict-Transport-Security (HSTS)
- Referrer-Policy
- Permissions-Policy

### Infrastructure
- HTTPS-only via CloudFront
- S3 bucket with restricted access (CloudFront OAI)
- No server-side code execution (static site)

### CI/CD
- Automated dependency vulnerability scanning
- Secret scanning with TruffleHog
- Type checking and linting
- Build verification before deployment

## Security Updates

Security updates are prioritized and typically deployed within 24-48 hours of identification.
