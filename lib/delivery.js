const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DEFAULT_TTL_HOURS = 72;

function getBaseUrl(req) {
  const envUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

function getTokenSecret() {
  const secret = process.env.DOWNLOAD_TOKEN_SECRET;
  if (!secret) {
    throw new Error('Missing DOWNLOAD_TOKEN_SECRET');
  }
  return secret;
}

function getTtlMs() {
  const hours = Number(process.env.DOWNLOAD_LINK_TTL_HOURS || DEFAULT_TTL_HOURS);
  return Math.max(hours, 1) * 60 * 60 * 1000;
}

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4;
  const withPadding = pad ? normalized + '='.repeat(4 - pad) : normalized;
  return Buffer.from(withPadding, 'base64').toString('utf8');
}

function signDownloadToken(payload) {
  const data = {
    ...payload,
    exp: Date.now() + getTtlMs(),
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(data));
  const signature = crypto
    .createHmac('sha256', getTokenSecret())
    .update(encodedPayload)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

  return `${encodedPayload}.${signature}`;
}

function verifyDownloadToken(token) {
  if (!token || !token.includes('.')) {
    throw new Error('Invalid token');
  }

  const [encodedPayload, signature] = token.split('.');
  const expected = crypto
    .createHmac('sha256', getTokenSecret())
    .update(encodedPayload)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new Error('Invalid signature');
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload));
  if (!payload.exp || Date.now() > payload.exp) {
    throw new Error('Token expired');
  }

  return payload;
}

function getPdfPath() {
  const configured = process.env.EBOOK_PDF_PATH;
  if (configured) return path.resolve(process.cwd(), configured);
  return path.resolve(process.cwd(), 'private_assets', 'LeashingAI-ebook.pdf');
}

function getPdfBuffer() {
  return fs.readFileSync(getPdfPath());
}

module.exports = {
  getBaseUrl,
  getPdfBuffer,
  getPdfPath,
  signDownloadToken,
  verifyDownloadToken,
};
