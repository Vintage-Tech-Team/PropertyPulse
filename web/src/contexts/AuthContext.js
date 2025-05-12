import React, { createContext, useContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
	const [auth, setAuth] = useState({
		isAuthenticated: !!localStorage.getItem('token'),
		userId: null, // Add userId to the auth state
	});

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token) {
			try {
				const decodedToken = jwtDecode(token);
				setAuth((prevAuth) => ({
					...prevAuth,
					userId: decodedToken?.id || null,
				}));
			} catch (err) {
				console.error('Failed to decode token', err);
			}
		}
	}, []);

	const logout = () => {
		localStorage.removeItem('token');
		setAuth({ isAuthenticated: false, userId: null });
	};

	return <AuthContext.Provider value={{ ...auth, setAuth, logout }}>{children}</AuthContext.Provider>;
};
