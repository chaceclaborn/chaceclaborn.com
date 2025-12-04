#!/usr/bin/env node

/**
 * Upload large files to S3
 *
 * Usage: yarn upload:large
 *
 * This uploads all files from public/large-files/ to your S3 bucket.
 * These files are gitignored but will be available on your site via CloudFront.
 */

import { execSync } from 'child_process';
import { readdirSync, existsSync } from 'fs';
import { join } from 'path';

const LARGE_FILES_DIR = 'public/large-files';
const S3_BUCKET = process.env.S3_BUCKET_NAME || 'chaceclaborn.com';

function main() {
  console.log('\n📦 Uploading large files to S3...\n');

  // Check if directory exists
  if (!existsSync(LARGE_FILES_DIR)) {
    console.log(`📁 Creating ${LARGE_FILES_DIR} directory...`);
    execSync(`mkdir -p ${LARGE_FILES_DIR}`);
  }

  // List files
  const files = readdirSync(LARGE_FILES_DIR);

  if (files.length === 0) {
    console.log('ℹ️  No files found in public/large-files/');
    console.log('   Add large files (videos, presentations, etc.) to this folder.');
    return;
  }

  console.log(`Found ${files.length} file(s):`);
  files.forEach(f => console.log(`   - ${f}`));
  console.log('');

  // Check AWS CLI is installed
  try {
    execSync('aws --version', { stdio: 'pipe' });
  } catch {
    console.error('❌ AWS CLI not installed!');
    console.error('   Install it from: https://aws.amazon.com/cli/');
    process.exit(1);
  }

  // Check AWS credentials
  try {
    execSync('aws sts get-caller-identity', { stdio: 'pipe' });
  } catch {
    console.error('❌ AWS credentials not configured!');
    console.error('   Run: aws configure');
    console.error('   Enter your AWS Access Key ID and Secret Access Key');
    process.exit(1);
  }

  // Sync to S3
  try {
    console.log(`🚀 Syncing to s3://${S3_BUCKET}/files/...\n`);

    execSync(
      `aws s3 sync "${LARGE_FILES_DIR}" "s3://${S3_BUCKET}/files/" --size-only`,
      { stdio: 'inherit' }
    );

    console.log('\n✅ Upload complete!');
    console.log('\n📎 Your files are available at:');
    files.forEach(f => {
      const encodedName = encodeURIComponent(f);
      console.log(`   https://${S3_BUCKET}/files/${encodedName}`);
    });
    console.log('');
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  }
}

main();
