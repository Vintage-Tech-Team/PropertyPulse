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
import AboutUs from './pages/AboutUs/AboutUs';
import PrivacyPolicy from './pages/PrivacyPolicy/PrivacyPolicy';
import TermsAndConditions from './pages/TermsConditions/TermsConditions';
import ContactUs from './pages/ContactUs/ContactUs';
import ParkingList from './pages/Parking/ParkingList';
// import ParkingDetails from './pages/Parking/ParkingDetails';
// import AddParking from './pages/Parking/AddParking';
// import EditParking from './pages/Parking/EditParking';

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
						<Route path="/about" element={<AboutUs />} />
						<Route path="/contact" element={<ContactUs />} />
						<Route path="/privacy-policy" element={<PrivacyPolicy />} />
						<Route path="/terms" element={<TermsAndConditions />} />

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
							path="/parkings"
							element={
								<AppLayout>
									<ParkingList />
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
						{/* <Route
							path="/parkings/:id"
							element={
								<AppLayout>
									<ParkingDetails />
								</AppLayout>
							}
						/> */}

						{/* Protected Routes */}
						<Route path="/add-property" element={<ProtectedRoute component={AddProperty} />} />
						{/* <Route path="/add-parking" element={<ProtectedRoute component={AddParking} />} /> */}
						<Route path="/edit-property/:id" element={<ProtectedRoute component={EditProperty} />} />
						{/* <Route path="/edit-parking/:id" element={<ProtectedRoute component={EditParking} />} /> */}
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
