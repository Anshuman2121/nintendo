'use client';

import { useEffect } from 'react';

export default function FirebaseDebug() {
    useEffect(() => {
        console.log('=== Firebase Debug Info ===');
        console.log('Firebase API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Present' : 'Missing');
        console.log('Firebase Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Present' : 'Missing');
        console.log('Firebase Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Present' : 'Missing');
        console.log('All env vars:', {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
        console.log('=========================');
    }, []);

    return null;
}
