// CloudFront Function for Security Headers
// Deploy this as a CloudFront Function attached to the viewer response event

function handler(event) {
  var response = event.response;
  var headers = response.headers;

  // Prevent clickjacking
  headers['x-frame-options'] = { value: 'DENY' };

  // Prevent MIME type sniffing
  headers['x-content-type-options'] = { value: 'nosniff' };

  // Enable XSS filter
  headers['x-xss-protection'] = { value: '1; mode=block' };

  // Control referrer information
  headers['referrer-policy'] = { value: 'strict-origin-when-cross-origin' };

  // Permissions Policy
  headers['permissions-policy'] = {
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  };

  // HSTS - Strict Transport Security
  headers['strict-transport-security'] = {
    value: 'max-age=31536000; includeSubDomains; preload'
  };

  // Content Security Policy
  headers['content-security-policy'] = {
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.firebaseio.com https://*.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.firebase.com https://*.firebaseio.com https://*.googleapis.com https://*.google-analytics.com wss://*.firebaseio.com",
      "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ')
  };

  return response;
}
