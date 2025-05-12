import api from './api';

export const updateUserProfile = async (formData) => {
	const response = await api.put('users/profile/update', formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});
	return response.data;
};

export const updateUserPassword = async (passwordData) => {
	const response = await api.put('users/profile/password', passwordData);
	return response.data;
};
