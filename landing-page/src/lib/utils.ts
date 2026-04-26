import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const handleGettingStart = () => {
	window.location.href = 'https://propertypulse-web.vercel.app/properties';
	// Or if it's an internal route: navigate('/property');
};

export const handleLogin = () => {
	window.location.href = 'https://propertypulse-web.vercel.app/login';
	// Or if it's an internal route: navigate('/login');
};
export const handleRegister = () => {
	window.location.href = 'https://propertypulse-web.vercel.app/register';
	// Or if it's an internal route: navigate('/register');
};