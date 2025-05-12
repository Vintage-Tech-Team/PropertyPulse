import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
	const [userID, setUserID] = useState(null);

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token) {
			try {
				const decoded = jwtDecode(token);
				setUserID(decoded.id || decoded._id || decoded.userId || decoded.sub);
			} catch (error) {
				console.error('Failed to decode token:', error);
			}
		}
	}, [isAuthenticated]);

	const login = (token) => {
		localStorage.setItem('token', token);
		setIsAuthenticated(true);
		try {
			const decoded = jwtDecode(token);
			setUserID(decoded.id || decoded._id || decoded.userId || decoded.sub);
		} catch (error) {
			console.error('Failed to decode token:', error);
		}
	};

	const logout = () => {
		localStorage.removeItem('token');
		setIsAuthenticated(false);
		setUserID(null);
	};

	const getUserID = () => userID;

	return (
		<AuthContext.Provider value={{ isAuthenticated, login, logout, userID, getUserID }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
