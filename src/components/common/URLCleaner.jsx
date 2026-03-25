import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function URLCleaner() {
    const location = useLocation();
    const navigate = useNavigate();
    const rawBase = import.meta.env.BASE_URL || '/';
    const base = (rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase) || '';

    useEffect(() => {
        const path = window.location.pathname;
        if (base && path.startsWith(base) && !window.location.hash) {
            const routeToRestore = path.slice(base.length);
            const currentSearch = window.location.search;
            if (routeToRestore && routeToRestore !== '/') {
                setTimeout(() => {
                    navigate(routeToRestore + currentSearch, { replace: true });
                }, 0);
            }
        }
    }, [navigate, base]);

    useEffect(() => {
        const internalPath = location.pathname + location.search;
        const cleanUrl = base + internalPath;

        if (window.location.pathname !== cleanUrl) {
            window.history.replaceState(null, '', cleanUrl);
        }
    }, [location, base]);

    return null;
}