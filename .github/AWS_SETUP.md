# AWS S3 + CloudFront Deployment Setup

Enterprise-grade deployment setup with security headers, CI/CD pipelines, and preview environments.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   GitHub        │────▶│   CloudFront    │────▶│      S3         │
│   Actions       │     │   (CDN + SSL)   │     │   (Static)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       ├── Security Headers (CloudFront Function)
        │                       ├── HTTPS Enforcement
        │                       └── Edge Caching
        │
        ├── CI Pipeline (lint, typecheck, security scan)
        ├── Build & Deploy Pipeline
        ├── PR Preview Deployments
        └── Smoke Tests
```

## Prerequisites

- AWS Account with admin access
- GitHub repository
- Domain name (optional, but recommended)

---

## Step 1: Create Production S3 Bucket

1. Go to **AWS Console → S3 → Create bucket**
2. **Bucket name:** `chaceclaborn-portfolio-prod`
3. **Region:** `us-east-1` (required for CloudFront)
4. **Block Public Access:** Keep ALL checked (CloudFront will access via OAI)
5. **Versioning:** Enable (for rollback capability)
6. Create bucket

### Bucket Policy (add after CloudFront setup)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontOAC",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::chaceclaborn-portfolio-prod/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

---

## Step 2: Create Preview S3 Bucket (Optional)

For PR preview deployments:

1. Create bucket: `chaceclaborn-portfolio-previews`
2. Same settings as production
3. Set lifecycle rule to delete objects after 30 days

---

## Step 3: Create CloudFront Distribution

1. Go to **AWS Console → CloudFront → Create distribution**

### Origin Settings
- **Origin domain:** Select your S3 bucket
- **Origin access:** Origin access control settings (recommended)
- Click **Create control setting** → Save

### Default Cache Behavior
- **Viewer protocol policy:** Redirect HTTP to HTTPS
- **Allowed HTTP methods:** GET, HEAD
- **Cache policy:** CachingOptimized
- **Origin request policy:** CORS-S3Origin

### Settings
- **Price class:** Use all edge locations (best performance)
- **Default root object:** `index.html`
- **Standard logging:** Enable (optional)

### Custom Error Pages
Add these custom error responses:

| HTTP Error | Response Page Path | HTTP Response Code |
|------------|-------------------|-------------------|
| 403        | /404/index.html   | 404               |
| 404        | /404/index.html   | 404               |

---

## Step 4: Add Security Headers (CloudFront Function)

1. Go to **CloudFront → Functions → Create function**
2. **Name:** `security-headers`
3. **Runtime:** cloudfront-js-2.0
4. Paste the code from `.github/cloudfront/security-headers.js`
5. Click **Save changes**
6. Go to **Publish** tab → **Publish function**
7. Go to **Associated distributions** → **Add association**
   - Distribution: Your distribution
   - Event type: **Viewer response**
   - Cache behavior: Default (*)
8. Save

---

## Step 5: Create IAM User for GitHub Actions

1. Go to **AWS Console → IAM → Users → Create user**
2. **User name:** `github-actions-deploy`
3. Select **Attach policies directly**
4. Create custom policy with this JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3Access",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::chaceclaborn-portfolio-prod",
        "arn:aws:s3:::chaceclaborn-portfolio-prod/*",
        "arn:aws:s3:::chaceclaborn-portfolio-previews",
        "arn:aws:s3:::chaceclaborn-portfolio-previews/*"
      ]
    },
    {
      "Sid": "CloudFrontInvalidation",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/*"
    }
  ]
}
```

5. Create user → Security credentials → Create access key
6. Choose **Application running outside AWS**
7. **Save the Access Key ID and Secret Access Key**

---

## Step 6: Configure GitHub Secrets

Go to **GitHub Repository → Settings → Secrets and variables → Actions**

### AWS Secrets (Required)

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | IAM access key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key | `wJalr...` |
| `AWS_REGION` | AWS region | `us-east-1` |
| `S3_BUCKET_NAME` | Production bucket | `chaceclaborn-portfolio-prod` |
| `CLOUDFRONT_DISTRIBUTION_ID` | Distribution ID | `E1234567890ABC` |

### AWS Secrets (Optional - for PR previews)

| Secret Name | Description |
|-------------|-------------|
| `S3_PREVIEW_BUCKET_NAME` | Preview bucket name |
| `PREVIEW_DOMAIN` | Preview CloudFront domain |

### Firebase Secrets (Required)

| Secret Name | Value |
|-------------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Your API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `*.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `*.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-*` |

---

## Step 7: Configure GitHub Environments (Optional)

For deployment protection rules:

1. Go to **Settings → Environments → New environment**
2. Create `production` environment
3. Add protection rules:
   - Required reviewers (optional)
   - Wait timer (optional)
   - Deployment branches: `main` only

---

## Step 8: Custom Domain Setup (Optional)

### Request SSL Certificate

1. Go to **AWS Certificate Manager** (must be in `us-east-1`)
2. Request public certificate
3. Add domain: `chaceclaborn.com` and `www.chaceclaborn.com`
4. DNS validation → Create records in Route 53

### Update CloudFront

1. Edit distribution → Settings
2. **Alternate domain names:** Add your domain(s)
3. **Custom SSL certificate:** Select your ACM certificate
4. Save changes

### Update DNS

In Route 53 or your DNS provider:
- `A` record → Alias to CloudFront distribution
- `AAAA` record → Alias to CloudFront distribution (IPv6)

---

## CI/CD Pipeline Overview

### On Pull Request
```
┌─────────┐   ┌──────────┐   ┌───────────┐   ┌────────────┐
│  Lint   │──▶│TypeCheck │──▶│  Security │──▶│   Build    │
└─────────┘   └──────────┘   │   Scan    │   └────────────┘
                             └───────────┘         │
                                                   ▼
                                          ┌────────────────┐
                                          │ PR Preview     │
                                          │ Deployment     │
                                          └────────────────┘
```

### On Push to Main
```
┌─────────┐   ┌──────────┐   ┌───────────┐   ┌────────────┐
│  Lint   │──▶│TypeCheck │──▶│   Build   │──▶│  Deploy    │
└─────────┘   └──────────┘   └───────────┘   │  to S3     │
                                             └────────────┘
                                                   │
                                                   ▼
                                          ┌────────────────┐
                                          │  Invalidate    │
                                          │  CloudFront    │
                                          └────────────────┘
                                                   │
                                                   ▼
                                          ┌────────────────┐
                                          │  Smoke Test    │
                                          └────────────────┘
```

---

## Security Features

### HTTP Security Headers
All responses include:
- `Content-Security-Policy` - XSS protection
- `Strict-Transport-Security` - HTTPS enforcement
- `X-Frame-Options` - Clickjacking prevention
- `X-Content-Type-Options` - MIME sniffing prevention
- `Referrer-Policy` - Referrer control
- `Permissions-Policy` - Feature restrictions

### CI Security
- **Dependabot:** Automated dependency updates
- **TruffleHog:** Secret scanning
- **npm audit:** Vulnerability scanning
- **TypeScript:** Type safety

---

## Troubleshooting

### Build Failures
1. Check Node.js version matches (v20)
2. Verify all secrets are set
3. Run `yarn build` locally to debug

### 403 Errors
1. Verify CloudFront OAC is configured
2. Check S3 bucket policy includes CloudFront
3. Ensure `trailingSlash: true` in next.config.ts

### Security Headers Not Working
1. Verify CloudFront Function is published
2. Check function is associated with distribution
3. Clear browser cache and CloudFront cache

### Cache Not Updating
1. Check GitHub Actions completed successfully
2. Verify CloudFront invalidation ran
3. Wait 5-10 minutes for propagation

---

## Cost Estimation

| Service | Estimated Monthly Cost |
|---------|----------------------|
| S3 | ~$0.50 |
| CloudFront | Free tier (1TB) |
| Route 53 | ~$0.50/zone |
| **Total** | **~$1-2/month** |

---

## Quick Reference

```bash
# Manual S3 sync
aws s3 sync out/ s3://YOUR_BUCKET --delete

# Manual CloudFront invalidation
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"

# Check distribution status
aws cloudfront get-distribution --id YOUR_DIST_ID
```
