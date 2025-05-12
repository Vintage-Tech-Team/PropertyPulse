import React, { useState } from 'react';
import { Layout, Button, Drawer, Grid, Space } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MenuOutlined, BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';

const { Header, Content } = Layout;
const { useBreakpoint } = Grid;

const AppLayout = ({ children }) => {
	const { isAuthenticated, logout } = useAuth(); // Get authentication status
	const navigate = useNavigate();
	const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
	const screens = useBreakpoint();
	const isMobile = !screens.md; // md and above = desktop
	const { isDarkMode, toggleTheme } = useTheme();

	const themeColors = {
		background: isDarkMode ? '#141414' : '#f0f2f5',
		header: isDarkMode ? '#1f1f1f' : '#001529',
		text: isDarkMode ? '#ffffff' : '#000000',
	};

	const handleLogout = () => {
		logout();
		navigate('/login');
		setMobileMenuVisible(false);
	};

	const handleProfile = () => {
		navigate('/profile');
		setMobileMenuVisible(false);
	};

	return (
		<Layout style={{ minHeight: '100vh', background: themeColors.background }}>
			<Header
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					padding: '0 16px',
					background: themeColors.header,
					position: 'fixed',
					width: '100%',
					top: 0,
					zIndex: 1000,
					boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
				}}
			>
				{/* Logo */}
				<div
					style={{
						color: '#fff',
						fontSize: '20px',
						fontWeight: 'bold',
						flex: '1',
					}}
				>
					<Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>
						PropertyPulse
					</Link>
				</div>

				{/* Desktop Buttons */}
				{!isMobile && (
					<Space>
						<Button
							type="text"
							icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />}
							onClick={toggleTheme}
							style={{ color: '#fff' }}
						/>
						{isAuthenticated ? (
							<>
								<Button type="link" style={{ color: '#fff' }} onClick={handleProfile}>
									Profile
								</Button>
								<Button type="link" style={{ color: '#fff' }} onClick={handleLogout}>
									Logout
								</Button>
							</>
						) : (
							<>
								<Button type="link" style={{ color: '#fff' }} onClick={() => navigate('/login')}>
									Login
								</Button>
								<Button type="link" style={{ color: '#fff' }} onClick={() => navigate('/register')}>
									Register
								</Button>
							</>
						)}
					</Space>
				)}

				{/* Mobile Menu Button */}
				{isMobile && (
					<Button
						className="mobile-menu-button"
						type="text"
						icon={<MenuOutlined style={{ color: '#fff', fontSize: '20px' }} />}
						onClick={() => setMobileMenuVisible(true)}
					/>
				)}

				{/* Mobile Drawer */}
				{isMobile && (
					<Drawer
						title="Menu"
						placement="right"
						onClose={() => setMobileMenuVisible(false)}
						open={mobileMenuVisible}
						width={250}
					>
						<Space direction="vertical" size="large">
							{isAuthenticated ? (
								<>
									<Button type="primary" block onClick={handleProfile}>
										Profile
									</Button>
									<Button danger block onClick={handleLogout}>
										Logout
									</Button>
								</>
							) : (
								<>
									<Button type="primary" block onClick={() => navigate('/login')}>
										Login
									</Button>
									<Button block onClick={() => navigate('/register')}>
										Register
									</Button>
								</>
							)}
						</Space>
					</Drawer>
				)}
			</Header>

			<Content
				style={{
					padding: '20px',
					background: themeColors.background,
					marginTop: 64, // Height of header
					minHeight: 'calc(100vh - 64px)',
					overflow: 'auto',
				}}
			>
				{children}
			</Content>
		</Layout>
	);
};

export default AppLayout;
