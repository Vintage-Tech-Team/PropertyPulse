import React, { useState } from 'react';
import { Button, Layout, Menu } from 'antd';
import { UserOutlined, HomeOutlined, SettingOutlined, FileTextOutlined } from '@ant-design/icons';
import { Link, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import UserManagement from './UserManagement';
import PropertyManagement from './PropertyManagement';
import ReviewManagement from './ReviewManagement';
import AddressManagement from './AddressManagement';
import { useAuth } from '../contexts/AuthContext';
import PropertyDetails from './ProperyDetails';

const { Header, Content, Sider } = Layout;

const Dashboard = () => {
	const [collapsed, setCollapsed] = useState(false);
	const { logout } = useAuth();

	const location = useLocation();

	// Menu Items
	const menuItems = [
		{ key: 'properties', label: 'Properties', icon: <HomeOutlined />, link: '/dashboard/properties' },
		{ key: 'users', label: 'Users', icon: <UserOutlined />, link: '/dashboard/users' },
		{ key: 'addresses', label: 'Addresses', icon: <SettingOutlined />, link: '/dashboard/addresses' },
		{ key: 'reviews', label: 'Reviews', icon: <FileTextOutlined />, link: '/dashboard/reviews' },
	];

	// Determine Selected Menu Key
	const selectedKey = menuItems.find((item) => location.pathname.startsWith(item.link))?.key || 'properties';

	return (
		<Layout style={{ height: '100vh' }}>
			{/* Header */}
			<Header
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					color: '#fff',
					position: 'fixed',
					width: '100%',
					top: 0,
					zIndex: 1,
					padding: '0 24px',
				}}
			>
				<div style={{ fontSize: '20px', fontWeight: 'bold' }}>Property Pulse Admin</div>
				<Button type="primary" onClick={logout}>
					Logout
				</Button>
			</Header>

			{/* Body Layout */}
			<Layout style={{ marginTop: 64 }}>
				{/* Sidebar */}
				<Sider
					collapsible
					collapsed={collapsed}
					onCollapse={(value) => setCollapsed(value)}
					style={{
						backgroundColor: '#001529',
						position: 'fixed',
						left: 0,
						height: 'calc(100vh - 64px)',
						zIndex: 1,
					}}
				>
					<Menu theme="dark" mode="inline" selectedKeys={[selectedKey]}>
						{menuItems.map((item) => (
							<Menu.Item key={item.key} icon={item.icon}>
								<Link to={item.link}>{item.label}</Link>
							</Menu.Item>
						))}
					</Menu>
				</Sider>

				{/* Main Content */}
				<Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
					<Content
						style={{
							margin: '24px',
							padding: '24px',
							background: '#fff',
							minHeight: 'calc(100vh - 112px)',
							overflow: 'auto',
						}}
					>
						<Routes>
							<Route path="users" element={<UserManagement />} />
							<Route path="properties" element={<PropertyManagement />} />
							<Route path="properties/:id" element={<PropertyDetails />} />
							<Route path="addresses" element={<AddressManagement />} />
							<Route path="reviews" element={<ReviewManagement />} />

							{/* Redirect from /dashboard to /dashboard/properties */}
							<Route path="/" element={<Navigate to="/dashboard/properties" />} />
						</Routes>
					</Content>
				</Layout>
			</Layout>
		</Layout>
	);
};

export default Dashboard;
