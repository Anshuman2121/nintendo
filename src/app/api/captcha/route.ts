import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHmac } from 'crypto';
import { createCanvas } from 'canvas';

const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || 'nintendo-world-secret-key-change-me';

function sign(text: string) {
    const hash = createHmac('sha256', CAPTCHA_SECRET).update(text.toLowerCase()).digest('hex');
    return `${text.toLowerCase()}.${hash}`;
}

function generateCaptchaText(length: number = 5): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function GET() {
    const captchaText = generateCaptchaText();

    // Create canvas
    const width = 150;
    const height = 50;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    // Add noise lines
    for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `rgb(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.random() * width, Math.random() * height);
        ctx.lineTo(Math.random() * width, Math.random() * height);
        ctx.stroke();
    }

    // Draw text
    ctx.font = 'bold 30px Arial';
    ctx.fillStyle = '#333';
    ctx.textBaseline = 'middle';

    const textWidth = ctx.measureText(captchaText).width;
    const startX = (width - textWidth) / 2;

    for (let i = 0; i < captchaText.length; i++) {
        const char = captchaText[i];
        const x = startX + (i * textWidth / captchaText.length);
        const y = height / 2 + (Math.random() - 0.5) * 10;
        const rotation = (Math.random() - 0.5) * 0.3;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.fillStyle = `rgb(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100})`;
        ctx.fillText(char, 0, 0);
        ctx.restore();
    }

    // Add noise dots
    for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
        ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
    }

    const imageBuffer = canvas.toBuffer('image/png');
    const base64Image = imageBuffer.toString('base64');

    const signedValue = sign(captchaText);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('captcha_token', signedValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 300, // 5 minutes
        path: '/',
    });

    return NextResponse.json({
        svg: `<img src="data:image/png;base64,${base64Image}" alt="captcha" style="width:150px;height:50px;" />`
    });
}
