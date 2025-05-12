import { jwtDecode } from 'jwt-decode';

export const getUserIdFromToken = () => {
	const token = localStorage.getItem('token'); // Get the token from localStorage
	if (!token) return null; // If no token, return null

	try {
		const decodedToken = jwtDecode(token); // Decode the token
		return decodedToken?.id || null; // Return the user ID if present
	} catch (err) {
		console.error('Failed to decode token', err);
		return null; // Return null if decoding fails
	}
};
