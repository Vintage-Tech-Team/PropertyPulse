import React from 'react';
import { ConfigProvider } from 'antd';
import styles from './AuthLayout.module.css';

const heroImage = `${process.env.PUBLIC_URL}/images/login-hero.jpg`;

const theme = {
	token: {
		colorPrimary: '#2e8b6a',
		borderRadius: 6,
		fontFamily: "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
		controlHeightLG: 48,
	},
};

const LogoMark = () => (
	<svg className={styles.logoMark} viewBox="0 0 32 32" fill="none" aria-hidden="true">
		<path d="M3 14 16 4l13 10v14H3V14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
		<path d="M7 21h5l2-5 3 8 2-5h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

const ShieldIcon = () => (
	<svg className={styles.shieldIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
		<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
		<path d="m8.8 12 2.2 2.2 4.2-4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

const Brand = ({ className }) => (
	<span className={className}>
		<LogoMark />
		<span>
			Property<span className={styles.brandAccent}>Pulse</span>
		</span>
	</span>
);

// Two-panel layout shared by the Login and Register pages: photo panel on the left,
// heading + form (children) + switch link + privacy note on the right.
const AuthLayout = ({ eyebrow, title, subtitle, switchLink, children }) => (
	<div className={styles.container}>
		{/* Left Side - Photo panel (hidden on small screens) */}
		<aside className={styles.hero} style={{ '--hero-image': `url(${heroImage})` }}>
			<div className={styles.heroTop}>
				<Brand className={styles.brand} />
				<span className={styles.heroTag}>Real Estate Intelligence</span>
			</div>

			<div className={styles.heroBody}>
				<p className={styles.eyebrowLight}>A clearer view of property</p>
				<h1 className={styles.heroTitle}>
					See the value
					<br />
					in every address.
				</h1>
				<p className={styles.heroSubtitle}>Your trusted partner in real estate analytics.</p>
			</div>

			<div className={styles.heroBottom}>
				<span>Local insight. Bigger picture.</span>
				<span className={styles.liveStatus}>
					<span className={styles.liveDot} />
					Market data live
				</span>
			</div>
		</aside>

		{/* Right Side - Form */}
		<main className={styles.formSection}>
			<div className={styles.formWrapper}>
				<Brand className={styles.mobileBrand} />

				<p className={styles.eyebrow}>{eyebrow}</p>
				<h2 className={styles.title}>{title}</h2>
				<p className={styles.subtitle}>{subtitle}</p>

				<ConfigProvider theme={theme}>
					<div className={styles.form}>{children}</div>
				</ConfigProvider>

				<p className={styles.switchLink}>{switchLink}</p>

				<div className={styles.divider}>
					<span>Private by design</span>
				</div>

				<div className={styles.privacyCard}>
					<ShieldIcon />
					<div>
						<p className={styles.privacyTitle}>Your insights stay yours</p>
						<p className={styles.privacyText}>Your account and property research are protected.</p>
					</div>
				</div>
			</div>

			<footer className={styles.footer}>
				© {new Date().getFullYear()} PropertyPulse <span aria-hidden="true">·</span> Property decisions, made clearer.
			</footer>
		</main>
	</div>
);

export const authStyles = styles;
export default AuthLayout;
