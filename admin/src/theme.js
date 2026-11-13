// PropertyPulse brand palette, shared with the web app.
export const brand = {
	ink: '#10262b',
	ink2: '#1a2427',
	green: '#2e8b6a',
	mint: '#5cc29a',
	muted: '#5b6b70',
	subtle: '#9db0b4',
	line: '#e2e8ea',
	bg: '#f5f9fa',
};

const theme = {
	token: {
		colorPrimary: brand.green,
		colorLink: brand.green,
		colorText: brand.ink,
		colorTextSecondary: brand.muted,
		colorTextPlaceholder: brand.subtle,
		colorBorder: brand.line,
		colorBorderSecondary: '#edf2f3',
		colorBgLayout: brand.bg,
		borderRadius: 10,
		fontSize: 14,
	},
	components: {
		Layout: { siderBg: brand.ink, headerBg: '#ffffff', bodyBg: brand.bg },
		Menu: {
			darkItemBg: brand.ink,
			darkItemColor: '#9db0b4',
			darkItemHoverColor: '#ffffff',
			darkItemHoverBg: 'rgba(255, 255, 255, 0.06)',
			darkItemSelectedBg: 'rgba(92, 194, 154, 0.16)',
			darkItemSelectedColor: brand.mint,
			itemBorderRadius: 10,
			itemHeight: 44,
			itemMarginInline: 12,
			iconSize: 16,
		},
		Table: {
			headerBg: '#f8fbfb',
			headerColor: brand.muted,
			headerSplitColor: 'transparent',
			rowHoverBg: '#f3f8f7',
			cellPaddingBlock: 14,
		},
		Button: { primaryShadow: '0 4px 12px rgba(46, 139, 106, 0.22)', fontWeight: 500 },
		Segmented: { itemSelectedColor: brand.ink, trackBg: '#eef3f4' },
	},
};

export default theme;
