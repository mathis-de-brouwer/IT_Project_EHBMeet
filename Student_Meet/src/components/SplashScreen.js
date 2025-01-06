import React, {
    useEffect
} from 'react';
import {
    useNavigate
} from 'react-native';

const SplashScreen = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/login');
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return ( < div style = {
            styles.container
        } > <
        img src = "/logo192.png"
        alt = "Logo"
        style = {
            styles.logo
        }
        /> <h1 style = {
        styles.title
    } > Student Meet < /h1> </div > );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#6aa6b8',
    },
    logo: {
        width: 150,
        height: 150,
    },
    title: {
        fontSize: '24px',
        color: '#fff',
    },
};

export default SplashScreen;