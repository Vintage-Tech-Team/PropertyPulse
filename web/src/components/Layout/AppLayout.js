import React, { useMemo, useState } from 'react';
import { Drawer, Dropdown } from 'antd';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import styles from './AppLayout.module.css';

const HomeIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
		<path d="M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4v-9.5Z" />
	</svg>
);

const CompassIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
		<circle cx="12" cy="12" r="9" />
		<path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" strokeLinejoin="round" />
	</svg>
);

const InfoIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
		<circle cx="12" cy="12" r="9" />
		<path d="M12 11v5M12 8h.01" />
	</svg>
);

const ChevronIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
		<path d="m6 9 6 6 6-6" />
	</svg>
);

const ThemeIcon = ({ dark }) =>
	dark ? (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
		</svg>
	) : (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
			<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
		</svg>
	);

const MenuIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
		<path d="M4 7h16M4 12h16M4 17h16" />
	</svg>
);

const infoLinks = [
	{ to: '/about', label: 'About' },
	{ to: '/contact', label: 'Contact' },
	{ to: '/privacy-policy', label: 'Privacy Policy' },
	{ to: '/terms', label: 'Terms & Conditions' },
];

const navClass = ({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`;

const AppLayout = ({ children }) => {
	const { isAuthenticated, logout } = useAuth();
	const { isDarkMode, toggleTheme } = useTheme();
	const navigate = useNavigate();
	const [drawerOpen, setDrawerOpen] = useState(false);

	// The JWT carries the user's name, so the header doesn't need an extra request
	const userName = useMemo(() => {
		const token = isAuthenticated && localStorage.getItem('token');
		if (!token) return null;
		try {
			return jwtDecode(token)?.name || 'Account';
		} catch {
			return 'Account';
		}
	}, [isAuthenticated]);

	const handleLogout = () => {
		logout();
		setDrawerOpen(false);
		navigate('/login');
	};

	const go = (path) => {
		setDrawerOpen(false);
		navigate(path);
	};

	const userMenu = {
		items: [
			{ key: '/profile', label: 'Profile' },
			{ type: 'divider' },
			...infoLinks.map(({ to, label }) => ({ key: to, label })),
			{ type: 'divider' },
			{ key: 'logout', label: 'Log out', danger: true },
		],
		onClick: ({ key }) => (key === 'logout' ? handleLogout() : navigate(key)),
	};

	return (
		<div className={styles.layout}>
			<header className={styles.header}>
				<Link to="/properties" className={styles.brand}>
					<span className={styles.brandTile}>
						<HomeIcon />
					</span>
					<span>
						Property<span className={styles.brandAccent}>Pulse</span>
					</span>
				</Link>

				<nav className={styles.nav}>
					<NavLink to="/properties" className={navClass}>
						<CompassIcon />
						Discover
					</NavLink>
					<NavLink to="/about" className={navClass}>
						<InfoIcon />
						About
					</NavLink>
				</nav>

				<div className={styles.actions}>
					<button
						type="button"
						className={styles.iconButton}
						onClick={toggleTheme}
						aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
					>
						<ThemeIcon dark={isDarkMode} />
					</button>
					{isAuthenticated ? (
						<Dropdown menu={userMenu} trigger={['click']} placement="bottomRight">
							<button type="button" className={styles.userButton}>
								<span className={styles.avatar}>{userName.charAt(0).toUpperCase()}</span>
								{userName}
								<ChevronIcon />
							</button>
						</Dropdown>
					) : (
						<>
							<Link to="/login" className={styles.textLink}>
								Log in
							</Link>
							<Link to="/register" className={styles.primaryLink}>
								Sign up
							</Link>
						</>
					)}
				</div>

				<button
					type="button"
					className={`${styles.iconButton} ${styles.menuButton}`}
					onClick={() => setDrawerOpen(true)}
					aria-label="Open menu"
				>
					<MenuIcon />
				</button>
			</header>

			<Drawer title="Menu" placement="right" width={260} open={drawerOpen} onClose={() => setDrawerOpen(false)}>
				<div className={styles.drawerLinks}>
					<button type="button" onClick={() => go('/properties')}>
						Discover
					</button>
					{infoLinks.map(({ to, label }) => (
						<button key={to} type="button" onClick={() => go(to)}>
							{label}
						</button>
					))}
					<button type="button" onClick={toggleTheme}>
						{isDarkMode ? 'Light mode' : 'Dark mode'}
					</button>
					<div className={styles.drawerDivider} />
					{isAuthenticated ? (
						<>
							<button type="button" onClick={() => go('/profile')}>
								Profile
							</button>
							<button type="button" onClick={handleLogout}>
								Log out
							</button>
						</>
					) : (
						<>
							<button type="button" onClick={() => go('/login')}>
								Log in
							</button>
							<button type="button" onClick={() => go('/register')}>
								Sign up
							</button>
						</>
					)}
				</div>
			</Drawer>

			<main className={styles.content}>{children}</main>
		</div>
	);
};

export default AppLayout;
