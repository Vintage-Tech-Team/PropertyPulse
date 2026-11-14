import React, { Suspense, lazy, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { getAntdTheme } from './theme/antdTheme';
import AppLayout from './components/Layout/AppLayout';

const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/Auth/VerifyEmail'));
const PropertyListing = lazy(() => import('./pages/Property/PropertyListing'));
const PropertyDetails = lazy(() => import('./pages/Property/PropertyDetails'));
const AddProperty = lazy(() => import('./pages/Property/AddProperty'));
const EditProperty = lazy(() => import('./pages/Property/EditProperty'));
const Profile = lazy(() => import('./pages/User/Profile'));
const AboutUs = lazy(() => import('./pages/AboutUs/AboutUs'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsConditions/TermsConditions'));
const ContactUs = lazy(() => import('./pages/ContactUs/ContactUs'));

const PageLoader = () => (
	<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
		<Spin size="large" />
	</div>
);

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
						<Suspense fallback={<PageLoader />}>
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
						</Suspense>
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
