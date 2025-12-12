import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactElement } from 'react';

interface ProtectedRouteProps {
    children: ReactElement;
    requireOwner?: boolean;
}

const ProtectedRoute = ({ children, requireOwner = true }: ProtectedRouteProps) => {
    const { isAuthenticated, role } = useAuth();

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/owner/login" replace />;
    }

    // If this route requires Owner role, check it
    if (requireOwner && role !== 'Owner') {
        // Client trying to access owner-only page - redirect to home
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
