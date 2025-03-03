// routes/login/+page.server.ts
import type { Actions } from './$types';
import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';

export const prerender = false;

export const actions: Actions = {
    default: async (event) => {
        const data = await event.request.formData();
        const username = data.get('username');
        const password = data.get('password');

        if (!username || !password) {
            return fail(400, { 
                success: false, 
                message: 'Username and password are required' 
            });
        }

        try {
            const { token, session, user } = await auth.login(username.toString(), password.toString());
            
            // Set the session cookie
            auth.setSessionTokenCookie(event, token, session.expiresAt);
            
            // Return token and expiration info for client-side storage
            return { 
                success: true, 
                token, 
                expiresAt: session.expiresAt.toISOString(),
                user: {
                    username: user.username,
                    isAdmin: user.isAdmin
                }
            };
        } catch (error) {
            console.error('Login error:', error);
            return fail(400, { 
                success: false, 
                message: error instanceof Error ? error.message : 'Authentication failed'
            });
        }
    }
};