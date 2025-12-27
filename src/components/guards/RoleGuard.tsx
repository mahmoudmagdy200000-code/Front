import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface RoleGuardProps {
    allowedRoles: string[]; // e.g. ['Owner'] or ['Admin', 'SuperAdmin']
    children: ReactElement;
}

/**
 * RoleGuard – a reusable route guard component.
 * It checks authentication and role membership before rendering children.
 *   • Unauthenticated → redirect to /owner/login (login page used globally).
 *   • Authenticated but role not allowed → redirect to home '/' .
 */
const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
    const { isAuthenticated, role } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/owner/login" replace />;
    }

    if (!role || !allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default RoleGuard;
