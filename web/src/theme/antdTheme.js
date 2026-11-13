import { theme } from 'antd';

// Ant Design theme matching the app's design (see AppLayout / PropertyListing styles).
// Applied app-wide in App.js, including to static Modal.confirm / message calls.

const FONT = "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const light = {
	ink: '#10262b',
	inkHover: '#1d3d43',
	green: '#2e8b6a',
	muted: '#5b6b70',
	line: '#e2e8ea',
	surface: '#ffffff',
	page: '#f1f6f7',
};

const dark = {
	ink: '#e8f0f1',
	inkHover: '#3fa57f',
	green: '#5cc29a',
	muted: '#9db0b4',
	line: '#26343a',
	surface: '#141c1f',
	page: '#0d1416',
};

export const getAntdTheme = (isDarkMode) => {
	const c = isDarkMode ? dark : light;
	// Primary buttons use the brand green in both themes
	const buttonPrimary = '#2e8b6a';
	const buttonPrimaryHover = isDarkMode ? '#3fa57f' : '#26775a';

	return {
		algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
		token: {
			colorPrimary: c.green,
			colorLink: c.green,
			colorText: c.ink,
			colorTextSecondary: c.muted,
			colorBorder: isDarkMode ? '#33444a' : '#cfd6d4',
			colorBorderSecondary: c.line,
			colorBgLayout: c.page,
			colorBgContainer: c.surface,
			colorBgElevated: c.surface,
			fontFamily: FONT,
			borderRadius: 8,
			borderRadiusLG: 14,
			controlHeight: 38,
			controlHeightLG: 46,
		},
		components: {
			Button: {
				colorPrimary: buttonPrimary,
				colorPrimaryHover: buttonPrimaryHover,
				colorPrimaryActive: buttonPrimary,
				primaryShadow: 'none',
				defaultShadow: 'none',
				fontWeight: 600,
			},
			Card: {
				headerFontSize: 16,
				headerHeight: 56,
			},
			Modal: {
				titleFontSize: 18,
				headerBg: c.surface,
				contentBg: c.surface,
				footerBg: c.surface,
			},
			Message: {
				contentBg: c.surface,
			},
			Form: {
				labelColor: c.ink,
				labelFontSize: 13,
			},
			Upload: {
				colorFillAlter: isDarkMode ? '#1a2427' : '#f5f9fa',
			},
		},
	};
};
