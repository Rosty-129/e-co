
import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback
} from 'react';

const AuthContext = createContext(null);

const API_URL = 'https://e-co-plao.vercel.app/auth';

const IDLE_TIMEOUT = 15 * 60 * 1000;
const ACTIVITY_SYNC_INTERVAL = 60 * 1000;
const ACTIVITY_BROADCAST_INTERVAL = 2000;

const ACTIVITY_KEY = 'e-co-last-activity';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user')) || null;
        } catch {
            return null;
        }
    });

    // CLEAR LOCAL AUTHENTICATION
    const clearAuth = useCallback(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('authtoken');

        setUser(null);
    }, []);

    // CHECK SERVER SESSION
    const checkSession = async () => {
        const token = localStorage.getItem('authtoken');

        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/activity`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                clearAuth();
            }

        } catch (error) {
            console.error('SESSION CHECK ERROR:', error);
        }
    };

    // LOGIN
    const login = async (email, password, turnstileToken) => {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password,
                turnstileToken
            })
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Login failed');

            if (data.code === 'UNVERIFIED') {
                error.code = 'UNVERIFIED';
            }

            throw error;
        }

        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('authtoken', data.token);

        setUser(data.user);

        return data;
    };

    // REGISTER
    const register = async (payload) => {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        return data;
    };

    // VERIFY EMAIL
    const verifyEmail = async (payload) => {
        const response = await fetch(`${API_URL}/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Verification failed');
        }

        if (data.user && data.token) {
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('authtoken', data.token);

            setUser(data.user);
        }

        return data;
    };

    // RESEND VERIFICATION CODE
    const resendCode = async (email) => {
        const response = await fetch(`${API_URL}/resend-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to resend code');
        }

        return data;
    };

    // FORGOT PASSWORD
    const forgotPassword = async (email, turnstileToken) => {
        const response = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                turnstileToken
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to send reset code');
        }

        return data;
    };

    // RESET PASSWORD
    const resetPassword = async (payload) => {
        const response = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to reset password');
        }

        if (data.user && data.token) {
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('authtoken', data.token);

            setUser(data.user);
        }

        return data;
    };

    // LOGOUT
    const logout = async () => {
        const token = localStorage.getItem('authtoken');

        try {
            if (token) {
                await fetch(`${API_URL}/logout`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            console.error('LOGOUT ERROR:', error);
        } finally {
            clearAuth();
        }
    };

    // UPDATE USER
    const updateUser = (partial) => {
        setUser((prev) => {
            const next = { ...(prev || {}), ...partial };

            localStorage.setItem('user', JSON.stringify(next));

            return next;
        });
    };

    // INACTIVITY AND SESSION MANAGEMENT
    useEffect(() => {
        if (!user) return;

        let inactivityTimer;
        let lastBroadcast = 0;

        let lastActivityPing = 0;
        let pingInProgress = false;

        let active = true;

        const token = localStorage.getItem('authtoken');

        if (!token) {
            clearAuth();
            return;
        }

        // LOGOUT AFTER INACTIVITY
        const handleInactivity = () => {
            if (active) {
                logout();
            }
        };

        // RESET LOCAL INACTIVITY TIMER
        const resetTimer = () => {
            clearTimeout(inactivityTimer);

            inactivityTimer = setTimeout(
                handleInactivity,
                IDLE_TIMEOUT
            );
        };

        // SEND ACTIVITY TO BACKEND
        const sendActivity = async () => {
            const now = Date.now();

            if (
                pingInProgress ||
                now - lastActivityPing < ACTIVITY_SYNC_INTERVAL
            ) {
                return;
            }

            pingInProgress = true;
            lastActivityPing = now;

            try {
                const response = await fetch(`${API_URL}/activity`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.status === 401) {
                    active = false;
                    clearTimeout(inactivityTimer);
                    clearAuth();
                }

            } catch (error) {
                console.error('ACTIVITY REQUEST ERROR:', error);
            } finally {
                pingInProgress = false;
            }
        };

        // HANDLE USER ACTIVITY
        const handleActivity = () => {
            if (!active) return;

            resetTimer();

            const now = Date.now();

            // Notify other browser tabs
            if (now - lastBroadcast >= ACTIVITY_BROADCAST_INTERVAL) {
                lastBroadcast = now;

                localStorage.setItem(
                    ACTIVITY_KEY,
                    String(now)
                );
            }

            // Notify backend
            sendActivity();
        };

        // HANDLE ACTIVITY FROM OTHER TABS
        const handleStorage = (event) => {
            if (
                event.key === ACTIVITY_KEY &&
                event.newValue
            ) {
                resetTimer();
                sendActivity();
            }

            // Another tab logged out
            if (
                event.key === 'authtoken' ||
                event.key === 'user'
            ) {
                if (!localStorage.getItem('authtoken')) {
                    active = false;
                    clearTimeout(inactivityTimer);
                    setUser(null);
                }
            }
        };

        const activityEvents = [
            'mousemove',
            'mousedown',
            'keydown',
            'scroll',
            'touchstart',
            'click'
        ];

        activityEvents.forEach((event) => {
            window.addEventListener(event, handleActivity, {
                passive: true
            });
        });

        window.addEventListener('storage', handleStorage);

        // Start timer and validate existing session
        resetTimer();
        sendActivity();

        return () => {
            active = false;

            clearTimeout(inactivityTimer);

            activityEvents.forEach((event) => {
                window.removeEventListener(event, handleActivity);
            });

            window.removeEventListener('storage', handleStorage);
        };

    }, [user, clearAuth]);

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                verifyEmail,
                resendCode,
                forgotPassword,
                resetPassword,
                logout,
                updateUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }

    return context;
}
