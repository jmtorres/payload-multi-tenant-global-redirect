// Usage: node check-redirect.mjs <email> <password> [screenshot.png]
import { chromium } from '@playwright/test'

const [email, password, shot] = process.argv.slice(2)
const base = process.env.BASE_URL || 'http://localhost:3000'
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL })
const page = await browser.newPage()
await page.goto(`${base}/admin/login`)
await page.fill('#field-email', email)
await page.fill('#field-password', password)
await page.click('button[type="submit"]')
await page.waitForURL((url) => !url.pathname.endsWith('/login'))
await page.goto(`${base}/admin/collections/settings`)
await page.waitForTimeout(5000)
console.log(`${email}: ${new URL(page.url()).pathname}`)
if (shot) await page.screenshot({ path: shot })
await browser.close()
