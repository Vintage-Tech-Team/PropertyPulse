import React from 'react';
import { Avatar } from 'antd';

const COLORS = ['#2e8b6a', '#3b7ea1', '#8a6bbf', '#c07a3a', '#4f7c5c', '#a85a6a'];

const colorFor = (name = '') => COLORS[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % COLORS.length];

const initialsFor = (name = '') => {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (!parts.length) return '?';
	return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
};

/**
 * Shows the user's picture when there is one; otherwise (or if it fails to load)
 * a coloured circle with their initials. The colour is stable per name.
 */
const UserAvatar = ({ name, src, size = 32, style }) => (
	<Avatar
		size={size}
		src={src || undefined}
		alt={name}
		style={{ background: colorFor(name), fontWeight: 600, fontSize: size * 0.38, flex: '0 0 auto', ...style }}
	>
		{initialsFor(name)}
	</Avatar>
);

export default UserAvatar;
