import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { ROLES } from '../utils/permissions';

/**
 * Protected Route wrapper
 * Redirects to login if not authenticated
 * Redirects to unauthorized if role doesn't match
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}

/**
 * Redirect authenticated users from login page
 */
export function PublicRoute({ children }) {
    const { isAuthenticated, user } = useAuthStore();

    if (isAuthenticated && user) {
        // Redirect based on role
        if (user.role === ROLES.KAPRODI) {
            return <Navigate to="/kaprodi/dashboard" replace />;
        } else if (user.role === ROLES.DOSEN) {
            return <Navigate to="/dosen/dashboard" replace />;
        } else if (user.role === ROLES.MAHASISWA) {
            return <Navigate to="/mahasiswa/dashboard" replace />;
        } else {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
}
