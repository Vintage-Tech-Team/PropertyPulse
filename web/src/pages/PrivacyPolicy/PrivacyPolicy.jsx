// pages/PrivacyPolicy.jsx
import React from 'react';

const PrivacyPolicy = () => (
	<div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
		<h1>Privacy Policy</h1>
		<p>Effective Date: June 4, 2025</p>
		<p>
			At <strong>PropertyPulse</strong>, your privacy is important to us. This policy outlines how we collect, use, and
			protect your information.
		</p>

		<h3>Information We Collect</h3>
		<ul>
			<li>Basic account info: Name, email, and profile details.</li>
			<li>Review content: Ratings, comments, uploaded media.</li>
			<li>Usage data: IP address, location (if granted), device/browser info.</li>
		</ul>

		<h3>How We Use Your Information</h3>
		<ul>
			<li>To provide access to features and services.</li>
			<li>To display property reviews and ratings.</li>
			<li>To improve user experience and personalize listings.</li>
			<li>To comply with legal obligations and enforce our terms.</li>
		</ul>

		<h3>Third-Party Services</h3>
		<p>
			We may use third-party services like Google Ads, analytics, and hosting providers. These platforms may use cookies
			and other technologies to improve your experience.
		</p>

		<h3>Your Rights</h3>
		<p>You may request to access, update, or delete your data by contacting us at support@propertypulse.app.</p>

		<h3>Security</h3>
		<p>We follow industry best practices to protect your data, including HTTPS and encrypted storage.</p>

		<h3>Changes to This Policy</h3>
		<p>We may update this policy. Continued use implies acceptance of the current policy.</p>

		<p>
			If you have questions, contact us at: <a href="mailto:support@propertypulse.app">support@propertypulse.app</a>
		</p>
	</div>
);

export default PrivacyPolicy;
