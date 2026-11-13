// pages/TermsAndConditions.jsx
import React from 'react';
import LegalPage from '../../components/Legal/LegalPage';

const sections = [
	{
		id: 'acceptance-of-terms',
		title: '1. Acceptance of Terms',
		body: (
			<p>
				By accessing or using <strong>PropertyPulse</strong>, you agree to be bound by these terms. If you disagree,
				please do not use the service.
			</p>
		),
	},
	{
		id: 'user-responsibilities',
		title: '2. User Responsibilities',
		body: (
			<ul>
				<li>Provide accurate information when registering and posting reviews.</li>
				<li>Do not post false, defamatory, or unlawful content.</li>
				<li>Respect others' privacy and intellectual property.</li>
			</ul>
		),
	},
	{
		id: 'content-ownership',
		title: '3. Content Ownership',
		body: (
			<p>
				You retain rights to your content but grant us a license to display, modify, and distribute it for platform
				purposes.
			</p>
		),
	},
	{
		id: 'account-termination',
		title: '4. Account Termination',
		body: <p>We reserve the right to suspend or delete accounts that violate our policies or legal regulations.</p>,
	},
	{
		id: 'limitation-of-liability',
		title: '5. Limitation of Liability',
		body: (
			<p>PropertyPulse is not responsible for user-generated content or any damages resulting from use of the platform.</p>
		),
	},
	{
		id: 'changes-to-terms',
		title: '6. Changes to Terms',
		body: <p>We may update these terms at any time. Continued use signifies acceptance of changes.</p>,
	},
];

const TermsAndConditions = () => (
	<LegalPage
		eyebrow="Legal"
		title="Terms and Conditions"
		date="Last Updated: June 4, 2025"
		sections={sections}
		contactEmail="legal@propertypulse.app"
	/>
);

export default TermsAndConditions;
