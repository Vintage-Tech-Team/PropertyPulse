// pages/PrivacyPolicy.jsx
import React from 'react';
import LegalPage from '../../components/Legal/LegalPage';

const sections = [
	{
		id: 'information-we-collect',
		title: 'Information We Collect',
		body: (
			<ul>
				<li>Basic account info: Name, email, and profile details.</li>
				<li>Review content: Ratings, comments, uploaded media.</li>
				<li>Usage data: IP address, location (if granted), device/browser info.</li>
			</ul>
		),
	},
	{
		id: 'how-we-use-your-information',
		title: 'How We Use Your Information',
		body: (
			<ul>
				<li>To provide access to features and services.</li>
				<li>To display property reviews and ratings.</li>
				<li>To improve user experience and personalize listings.</li>
				<li>To comply with legal obligations and enforce our terms.</li>
			</ul>
		),
	},
	{
		id: 'third-party-services',
		title: 'Third-Party Services',
		body: (
			<p>
				We may use third-party services like Google Ads, analytics, and hosting providers. These platforms may use
				cookies and other technologies to improve your experience.
			</p>
		),
	},
	{
		id: 'your-rights',
		title: 'Your Rights',
		body: (
			<p>
				You may request to access, update, or delete your data by contacting us at{' '}
				<a href="mailto:support@propertypulse.app">support@propertypulse.app</a>.
			</p>
		),
	},
	{
		id: 'security',
		title: 'Security',
		body: <p>We follow industry best practices to protect your data, including HTTPS and encrypted storage.</p>,
	},
	{
		id: 'changes-to-this-policy',
		title: 'Changes to This Policy',
		body: <p>We may update this policy. Continued use implies acceptance of the current policy.</p>,
	},
];

const PrivacyPolicy = () => (
	<LegalPage
		eyebrow="Legal"
		title="Privacy Policy"
		date="Effective Date: June 4, 2025"
		intro={
			<>
				At <strong>PropertyPulse</strong>, your privacy is important to us. This policy outlines how we collect, use,
				and protect your information.
			</>
		}
		sections={sections}
		contactEmail="support@propertypulse.app"
	/>
);

export default PrivacyPolicy;
