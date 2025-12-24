import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
    const { isAuth } = useAuth();

    if (!isAuth) {
        // Якщо не авторизований — кидаємо на вхід
        return <Navigate to="/auth" replace />;
    }

    return children;
};

export default ProtectedRoute;