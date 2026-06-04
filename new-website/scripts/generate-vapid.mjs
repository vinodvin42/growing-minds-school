#!/usr/bin/env node
/**
 * Generate VAPID keys for Web Push (student app notifications).
 * Run: node scripts/generate-vapid.mjs
 * Add output to Vercel Environment Variables — see PUSH-SETUP.md
 */
import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();

console.log("Add these to Vercel → Settings → Environment Variables:\n");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log("VAPID_SUBJECT=mailto:growingmindsenglishschool@gmail.com");
