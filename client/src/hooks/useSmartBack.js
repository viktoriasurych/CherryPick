import { useNavigate } from 'react-router-dom';

export const useSmartBack = () => {
    const navigate = useNavigate();

    const goBack = (fallbackPath = '/') => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate(fallbackPath);
        }
    };

    return goBack;
};