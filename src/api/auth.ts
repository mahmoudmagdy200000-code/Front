import axiosInstance from './axios';

// Login Request & Response
export interface LoginRequest {
    emailOrUsername: string; // Can be email or username
    password: string;
}

export interface LoginResponse {
    Token: string;
    UserId: string;
    Username: string;
    Email: string;
    FullName: string;
    Role: string;
    EmailConfirmed: boolean;
    Message: string;
}

// Register Request & Response
export interface RegisterRequest {
    fullName: string;
    username: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
    // Note: Role removed - backend assigns 'Client' automatically
}

export interface RegisterResponse {
    UserId: string;
    Username: string;
    Email: string;
    FullName: string;
    Role: string;
    Token: string; // Empty on registration
    EmailConfirmed: boolean;
    Message: string;
}

// API Functions
export const loginApi = async (emailOrUsername: string, password: string): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('/auth/login', {
        emailOrUsername,
        password,
    });
    return response.data;
};

export const registerApi = async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await axiosInstance.post<RegisterResponse>('/auth/register', data);
    return response.data;
};

// Legacy function for backward compatibility (deprecated)
export const login = async (username: string, password: string): Promise<LoginResponse> => {
    return loginApi(username, password);
};
