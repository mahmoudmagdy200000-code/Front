export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    userId: string;
    username: string;
}

export interface AuthContextType {
    token: string | null;
    userId: string | null;
    username: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}
