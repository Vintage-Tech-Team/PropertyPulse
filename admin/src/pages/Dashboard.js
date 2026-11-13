import React, { useState } from 'react';
import { Avatar, Dropdown, Layout, Menu, Tooltip } from 'antd';
import {
	HomeOutlined,
	TeamOutlined,
	EnvironmentOutlined,
	StarOutlined,
	MessageOutlined,
	LogoutOutlined,
	LeftOutlined,
	RightOutlined,
	DownOutlined,
	ArrowLeftOutlined,
} from '@ant-design/icons';
import { Link, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import UserManagement from './UserManagement';
import PropertyManagement from './PropertyManagement';
import ReviewManagement from './ReviewManagement';
import AddressManagement from './AddressManagement';
import { useAuth } from '../contexts/AuthContext';
import PropertyDetails from './PropertyDetails';
import QueryManagement from './QueryManagement';
import LogoMark from '../components/LogoMark';
import './Dashboard.css';

const { Header, Content, Sider } = Layout;

const SIDER_WIDTH = 240;
const SIDER_COLLAPSED = 80;

const menuItems = [
	{
		key: 'properties',
		label: 'Properties',
		icon: <HomeOutlined />,
		link: '/dashboard/properties',
		subtitle: 'Review, verify and manage every listing',
	},
	{ key: 'users', label: 'Users', icon: <TeamOutlined />, link: '/dashboard/users', subtitle: 'Tenants and admin accounts' },
	{
		key: 'addresses',
		label: 'Addresses',
		icon: <EnvironmentOutlined />,
		link: '/dashboard/addresses',
		subtitle: 'Locations properties can be listed under',
	},
	{ key: 'reviews', label: 'Reviews', icon: <StarOutlined />, link: '/dashboard/reviews', subtitle: 'Moderate tenant reviews' },
	{
		key: 'queries',
		label: 'Queries',
		icon: <MessageOutlined />,
		link: '/dashboard/queries',
		subtitle: 'Messages sent through the contact form',
	},
];

// Wraps pages that don't handle their own padding and scrolling.
const Scroll = ({ children }) => <div className="pp-scroll">{children}</div>;

const Dashboard = () => {
	const [collapsed, setCollapsed] = useState(false);
	const { logout } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();

	const current = menuItems.find((item) => location.pathname.startsWith(item.link)) || menuItems[0];
	const isDetail = /^\/dashboard\/properties\/[^/]+/.test(location.pathname);

	// Return to the list the user came from; fall back to it on a direct visit.
	const goBack = () => (location.key !== 'default' ? navigate(-1) : navigate('/dashboard/properties'));

	return (
		<Layout className="pp-shell">
			<Sider
				className="pp-sider"
				width={SIDER_WIDTH}
				collapsedWidth={SIDER_COLLAPSED}
				collapsed={collapsed}
				trigger={null}
				collapsible
			>
				<div className="pp-sider__brand">
					<LogoMark />
					{!collapsed && (
						<div>
							PropertyPulse
							<small>Admin</small>
						</div>
					)}
				</div>

				{!collapsed && <div className="pp-sider__section">Manage</div>}

				<Menu
					theme="dark"
					mode="inline"
					selectedKeys={[current.key]}
					items={menuItems.map((item) => ({
						key: item.key,
						icon: item.icon,
						label: <Link to={item.link}>{item.label}</Link>,
					}))}
				/>

				<Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
					<button
						type="button"
						className="pp-sider__toggle"
						onClick={() => setCollapsed((c) => !c)}
						aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
					>
						{collapsed ? <RightOutlined /> : <LeftOutlined />}
					</button>
				</Tooltip>
			</Sider>

			<Layout className="pp-main" style={{ marginLeft: collapsed ? SIDER_COLLAPSED : SIDER_WIDTH }}>
				<Header className="pp-topbar">
					<div className="pp-topbar__title">
						{isDetail && (
							<button type="button" className="pp-back" onClick={goBack}>
								<ArrowLeftOutlined />
								<span>Back</span>
							</button>
						)}
						<div>
							{isDetail && (
								<div className="pp-crumbs">
									<Link to="/dashboard/properties">Properties</Link>
									<span>/</span>
									<span>Details</span>
								</div>
							)}
							<h1>{isDetail ? 'Property details' : current.label}</h1>
							{!isDetail && <p>{current.subtitle}</p>}
						</div>
					</div>

					<Dropdown
						trigger={['click']}
						placement="bottomRight"
						menu={{
							items: [{ key: 'logout', icon: <LogoutOutlined />, label: 'Log out', danger: true }],
							onClick: ({ key }) => key === 'logout' && logout(),
						}}
					>
						<div className="pp-user">
							<Avatar style={{ background: '#2e8b6a', fontWeight: 600 }}>A</Avatar>
							<div className="pp-user__meta">
								<div className="pp-user__name">Admin</div>
								<div className="pp-user__role">Administrator</div>
							</div>
							<DownOutlined style={{ fontSize: 10, color: '#9db0b4' }} />
						</div>
					</Dropdown>
				</Header>

				<Content className="pp-content">
					<div className="pp-card">
						<Routes>
							<Route path="users" element={<UserManagement />} />
							<Route path="properties" element={<PropertyManagement />} />
							<Route
								path="properties/:id"
								element={
									<Scroll>
										<PropertyDetails />
									</Scroll>
								}
							/>
							<Route path="addresses" element={<AddressManagement />} />
							<Route path="reviews" element={<ReviewManagement />} />
							<Route
								path="queries"
								element={
									<Scroll>
										<QueryManagement />
									</Scroll>
								}
							/>

							{/* Redirect from /dashboard to /dashboard/properties */}
							<Route path="/" element={<Navigate to="/dashboard/properties" />} />
						</Routes>
					</div>
				</Content>
			</Layout>
		</Layout>
	);
};

export default Dashboard;
