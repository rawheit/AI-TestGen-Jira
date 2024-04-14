import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BlankLayout from './components/layout/blank';
import Home from './components/home'; // Import if needed
import Settings from './components/settings';
import TestCases from './components/testcases';
import XRayFields from './components/addfields';
import Success from './components/success';

const routes = [
    {
        path: '/',
        exact: true,
        element: <Home />, // Assuming Home is a component
    },
    {
        path: '/settings',
        exact: true,
        element: <Settings />,
    },
    {
        path: '/testcases',
        exact: true,
        element: <TestCases />,
    },
    {
        path: '/add-fields',
        exact: true,
        element: <XRayFields />,
    },
    {
        path: '/success',
        exact: true,
        element: <Success />,
    }
    // Add other routes as needed
];

const AppRouter = () => {
    return (
        <Router>
            <BlankLayout>
                <Routes>
                    {routes.map((route, index) => (
                        <Route key={index} {...route} />
                    ))}
                    <Route path="*" element={<Navigate replace to="/" />} /> {/* Catch-all route */}
                </Routes>
            </BlankLayout>
        </Router>
    );
};

export default AppRouter;
