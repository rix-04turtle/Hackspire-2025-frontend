// /components/AuthHOC.js (or wherever you store it)

import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useGlobalContext, ROLES } from '@/context/GlobalContext';
import LoadingPage from './Loading'; 

const AuthHOC = (
    WrappedComponent,
    options = {} // e.g., { role: 'admin' } or { role: ['admin', 'organiser'] }
) => {
    const AuthComponent = (props) => {
        const { user, isCheckingAuth } = useGlobalContext();
        const router = useRouter();

        useEffect(() => {
            // First, we wait for the initial authentication check to complete.
            if (isCheckingAuth) {
                return;
            }

            // Get the roles required to access this page.
            const requiredRoles = options.role ? (Array.isArray(options.role) ? options.role : [options.role]) : [];

            // This page requires the user to be logged in.
            if (!user) {
                router.replace('/login');
                return;
            }

            // This page has specific role requirements.
            if (requiredRoles.length > 0) {
                // IMPORTANT: I'm assuming your user object has a `role` property.
                // If it's called something else (e.g., user.labels), change it here.
                const userRole = user.role;

                // An admin can access any page, so we let them through immediately.
                if (userRole === ROLES.ADMIN) {
                    return;
                }

                // Check if the user has at least one of the required roles.
                const hasRequiredRole = requiredRoles.includes(userRole);

                if (!hasRequiredRole) {
                    // If the user does not have the required role, redirect them.
                    // A profile page is a good, safe place to send them.
                    router.replace('/my-profile');
                }
            }
        }, [user, isCheckingAuth, router, options.role]);


        // --- Render Logic ---

        // 1. If we are still checking for auth, always show the loading page.
        if (isCheckingAuth) {
            return <LoadingPage />;
        }

        // 2. If the auth check is done and there is no user, a redirect is
        //    about to happen, so we show the loading page to prevent flashing
        //    the protected content for a split second.
        if (!user) {
            return <LoadingPage />;
        }

        // 3. If we get here, the user is authenticated and authorized.
        //    Render the actual page component.
        return <WrappedComponent {...props} />;
    };

    return AuthComponent;
};

export default AuthHOC;