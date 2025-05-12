import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import PropertyListing from './pages/Property/PropertyListing';
import PropertyDetails from './pages/Property/PropertyDetails';
import AddProperty from './pages/Property/AddProperty';
import EditProperty from './pages/Property/EditProperty';
import Profile from './pages/User/Profile';
import AppLayout from './components/Layout/AppLayout';
import VerifyEmail from './pages/Auth/VerifyEmail';

const App = () => {
	return (
		<AuthProvider>
			<ThemeProvider>
				<Router>
					<Routes>
						{/* Public Routes */}
						<Route path="/login" element={<PublicRoute component={Login} />} />
						<Route path="/register" element={<PublicRoute component={Register} />} />
						<Route path="/verify/:token" element={<VerifyEmail />} />
						<Route path="/forgot-password" element={<ForgotPassword />} />
						<Route path="/reset-password/:token" element={<ResetPassword />} />

						{/* Semi-Public Routes (wrapped in AppLayout) */}
						<Route
							path="/properties"
							element={
								<AppLayout>
									<PropertyListing />
								</AppLayout>
							}
						/>
						<Route
							path="/properties/:id"
							element={
								<AppLayout>
									<PropertyDetails />
								</AppLayout>
							}
						/>

						{/* Protected Routes */}
						<Route path="/add-property" element={<ProtectedRoute component={AddProperty} />} />
						<Route path="/edit-property/:id" element={<ProtectedRoute component={EditProperty} />} />
						<Route path="/profile" element={<ProtectedRoute component={Profile} />} />

						{/* Default Route */}
						<Route path="/" element={<Navigate to="/properties" />} />
					</Routes>
				</Router>
			</ThemeProvider>
		</AuthProvider>
	);
};

// Public Route Logic
const PublicRoute = ({ component: Component }) => {
	const { isAuthenticated } = useAuth();
	return isAuthenticated ? <Navigate to="/properties" /> : <Component />;
};

// Protected Route Logic
const ProtectedRoute = ({ component: Component }) => {
	const { isAuthenticated } = useAuth();
	return isAuthenticated ? (
		<AppLayout>
			<Component />
		</AppLayout>
	) : (
		<Navigate to="/login" />
	);
};

export default App;
