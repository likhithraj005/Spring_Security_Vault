import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useContext } from 'react';

const OAuthSuccess = () => {
    const { getAuthStatus } = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            await getAuthStatus(); // re-check session
            navigate('/'); // redirect to homepage
        })();
    }, []);

    return <p>Redirecting...</p>;
};

export default OAuthSuccess;
