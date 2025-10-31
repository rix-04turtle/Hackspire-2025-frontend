// /context/GlobalContext.jsx

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState
} from "react";
import { useRouter } from "next/router";

// It's good practice to keep constants like this in a separate config file
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export const ROLES = {
    ADMIN: "admin",
    FARMER: "farmer",
    EXPERT: "expert",
    PARTICIPANT: "participant"
};

const GlobalContext = createContext(undefined);

export function GlobalContextProvider({
    children,
}) {
    const [user, setUser] = useState(null);
    // We don't need the 'session' state from your original file for this flow
    // const [session, setSession] = useState(null); 
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const router = useRouter();

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem("authToken");
        router.push("/login");
    }, [router]);

    const checkAuth = useCallback(async () => {
        setIsCheckingAuth(true);
        try {
            const token = localStorage.getItem("authToken");

            // If no token is found, there's no user.
            if (!token) {
                setUser(null);
                setIsCheckingAuth(false);
                return;
            }

            // We have a token, let's verify it with the backend
            const response = await fetch(`${BASE_URL}/auth/me`, {
                method: "POST", // As you specified
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const userData = await response.json();
                if (userData.status === "success" && userData.user)
                    setUser(userData.user);
                else
                    setUser(null);

            } else {
                // The token was invalid (e.g., expired)
                // so we clear the user and the token.
                logout();
            }

        } catch (error) {
            // This could happen if the backend is down
            console.error("Auth check error:", error);
            setUser(null);
        } finally {
            setIsCheckingAuth(false);
        }
    }, [logout]); // Added logout as a dependency

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <GlobalContext.Provider
            value={{
                user,
                setUser,
                checkAuth,
                isCheckingAuth,
                logout, // Provide the logout function to the rest of the app
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
}

export function useGlobalContext() {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error(
            "useGlobalContext must be used within a GlobalContextProvider"
        );
    }
    return context;
}

export default GlobalContext;