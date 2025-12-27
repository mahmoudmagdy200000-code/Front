import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import { loginApi, googleLoginApi } from '../api/auth';

// Enhanced auth context with additional user fields
export interface AuthContextType {
    token: string | null;
    userId: string | null;
    username: string | null;
    email: string | null;
    fullName: string | null;
    role: string | null;
    phoneNumber: string | null;
    login: (emailOrUsername: string, password: string) => Promise<void>;
    googleLogin: (idToken: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [fullName, setFullName] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const savedToken = localStorage.getItem('token');
            const savedUserId = localStorage.getItem('userId');
            const savedUsername = localStorage.getItem('username');
            const savedEmail = localStorage.getItem('email');
            const savedFullName = localStorage.getItem('fullName');
            const savedRole = localStorage.getItem('role');

            if (savedToken && savedUserId && savedUsername) {
                setToken(savedToken);
                setUserId(savedUserId);
                setUsername(savedUsername);
                setEmail(savedEmail);
                setFullName(savedFullName);
                setRole(savedRole);
                setPhoneNumber(localStorage.getItem('phoneNumber'));
            }
        } catch (error) {
            console.error('Error loading auth state:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
            localStorage.removeItem('email');
            localStorage.removeItem('fullName');
            localStorage.removeItem('role');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (emailOrUsername: string, password: string) => {
        const response = await loginApi(emailOrUsername, password);

        setToken(response.Token);
        setUserId(response.UserId);
        setUsername(response.Username);
        setEmail(response.Email);
        setFullName(response.FullName);
        setRole(response.Role);
        setPhoneNumber(response.PhoneNumber || null);

        localStorage.setItem('token', response.Token);
        localStorage.setItem('userId', response.UserId);
        localStorage.setItem('username', response.Username);
        localStorage.setItem('email', response.Email);
        localStorage.setItem('fullName', response.FullName);
        localStorage.setItem('role', response.Role);
        if (response.PhoneNumber) localStorage.setItem('phoneNumber', response.PhoneNumber);
    };

    const googleLogin = async (idToken: string) => {
        const response = await googleLoginApi(idToken);

        setToken(response.Token);
        setUserId(response.UserId);
        setUsername(response.Username);
        setEmail(response.Email);
        setFullName(response.FullName);
        setRole(response.Role);
        setPhoneNumber(response.PhoneNumber || null);

        localStorage.setItem('token', response.Token);
        localStorage.setItem('userId', response.UserId);
        localStorage.setItem('username', response.Username);
        localStorage.setItem('email', response.Email);
        localStorage.setItem('fullName', response.FullName);
        localStorage.setItem('role', response.Role);
        if (response.PhoneNumber) localStorage.setItem('phoneNumber', response.PhoneNumber);
    };

    const logout = () => {
        setToken(null);
        setUserId(null);
        setUsername(null);
        setEmail(null);
        setFullName(null);
        setRole(null);
        setPhoneNumber(null);

        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        localStorage.removeItem('fullName');
        localStorage.removeItem('role');
        localStorage.removeItem('phoneNumber');
    };

    const isAuthenticated = !!token;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ token, userId, username, email, fullName, role, phoneNumber, login, googleLogin, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
