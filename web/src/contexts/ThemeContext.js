import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
	const [isDarkMode, setIsDarkMode] = useState(() => {
		const saved = localStorage.getItem('darkMode');
		return saved ? JSON.parse(saved) : false;
	});

	useEffect(() => {
		localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
		document.body.classList.toggle('dark-theme', isDarkMode);
	}, [isDarkMode]);

	const toggleTheme = () => setIsDarkMode(!isDarkMode);

	return <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
