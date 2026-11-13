import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import theme from './theme';

const App = () => {
	return (
		<ConfigProvider theme={theme}>
			<AuthProvider>
				<Router>
					<Routes>
						{/* Redirect to /dashboard if logged in, else show Login */}
						<Route path="/" element={<PublicRoute />} />
						<Route path="/dashboard/*" element={<ProtectedRoute component={Dashboard} />} />
					</Routes>
				</Router>
			</AuthProvider>
		</ConfigProvider>
	);
};

// Public Route Logic
const PublicRoute = () => {
	const { isAuthenticated } = useAuth();
	return isAuthenticated ? <Navigate to="/dashboard" /> : <Login />;
};

// Protected Route Logic
const ProtectedRoute = ({ component: Component }) => {
	const { isAuthenticated } = useAuth();
	return isAuthenticated ? <Component /> : <Navigate to="/" />;
};

export default App;
