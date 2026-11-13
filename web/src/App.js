import React, { useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { getAntdTheme } from './theme/antdTheme';
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
import AboutUs from './pages/AboutUs/AboutUs';
import PrivacyPolicy from './pages/PrivacyPolicy/PrivacyPolicy';
import TermsAndConditions from './pages/TermsConditions/TermsConditions';
import ContactUs from './pages/ContactUs/ContactUs';

// Applies the app's Ant Design theme (light/dark) to every component, including dialogs
// opened with static calls like Modal.confirm() and message.success()
const AntdThemeProvider = ({ children }) => {
	const { isDarkMode } = useTheme();
	const antdTheme = useMemo(() => getAntdTheme(isDarkMode), [isDarkMode]);

	useEffect(() => {
		ConfigProvider.config({
			holderRender: (holder) => <ConfigProvider theme={antdTheme}>{holder}</ConfigProvider>,
		});
	}, [antdTheme]);

	return <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>;
};

const App = () => {
	return (
		<AuthProvider>
			<ThemeProvider>
				<AntdThemeProvider>
					<Router>
						<Routes>
							{/* Public Routes */}
							<Route path="/login" element={<PublicRoute component={Login} />} />
							<Route path="/register" element={<PublicRoute component={Register} />} />
							<Route path="/verify/:token" element={<VerifyEmail />} />
							<Route path="/forgot-password" element={<ForgotPassword />} />
							<Route path="/reset-password/:token" element={<ResetPassword />} />
							<Route
								path="/about"
								element={
									<AppLayout>
										<AboutUs />
									</AppLayout>
								}
							/>
							<Route
								path="/contact"
								element={
									<AppLayout>
										<ContactUs />
									</AppLayout>
								}
							/>
							<Route
								path="/privacy-policy"
								element={
									<AppLayout>
										<PrivacyPolicy />
									</AppLayout>
								}
							/>
							<Route
								path="/terms"
								element={
									<AppLayout>
										<TermsAndConditions />
									</AppLayout>
								}
							/>

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
				</AntdThemeProvider>
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
