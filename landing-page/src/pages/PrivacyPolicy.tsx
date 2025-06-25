import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
			<Header />

			<div className="container mx-auto px-4 py-20">
				<div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
					<Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-8 font-medium">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Home
					</Link>

					<h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
					<p className="text-gray-600 mb-8">Last updated: June 20, 2025</p>

					<div className="prose prose-lg max-w-none">
						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
							<p className="text-gray-600 leading-relaxed mb-4">
								We collect information you provide directly to us, such as when you create an account, write reviews, or
								contact us for support. This may include your name, email address, and review content.
							</p>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
							<p className="text-gray-600 leading-relaxed mb-4">We use the information we collect to:</p>
							<ul className="list-disc pl-6 text-gray-600 mb-4">
								<li>Provide, maintain, and improve our services</li>
								<li>Process transactions and send related information</li>
								<li>Send you technical notices and support messages</li>
								<li>Respond to your comments and questions</li>
								<li>Monitor and analyze trends and usage</li>
							</ul>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
							<p className="text-gray-600 leading-relaxed mb-4">
								We do not sell, trade, or otherwise transfer your personal information to third parties without your
								consent, except as described in this policy. We may share information in the following circumstances:
							</p>
							<ul className="list-disc pl-6 text-gray-600 mb-4">
								<li>With your consent</li>
								<li>For legal reasons or to protect rights</li>
								<li>In connection with a business transfer</li>
								<li>With service providers who assist our operations</li>
							</ul>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
							<p className="text-gray-600 leading-relaxed mb-4">
								We implement appropriate security measures to protect your personal information against unauthorized
								access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is
								100% secure.
							</p>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookies and Tracking</h2>
							<p className="text-gray-600 leading-relaxed mb-4">
								We use cookies and similar tracking technologies to track activity on our service and hold certain
								information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being
								sent.
							</p>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
							<p className="text-gray-600 leading-relaxed mb-4">
								You have the right to access, update, or delete your personal information. You may also opt out of
								certain communications from us. To exercise these rights, please contact us using the information below.
							</p>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Changes to This Policy</h2>
							<p className="text-gray-600 leading-relaxed mb-4">
								We may update this Privacy Policy from time to time. We will notify you of any changes by posting the
								new Privacy Policy on this page and updating the "Last updated" date.
							</p>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
							<p className="text-gray-600 leading-relaxed">
								If you have any questions about this Privacy Policy, please contact us at:
								<br />
								Email: privacy@propertypulse.com
								<br />
								Phone: +1 (555) 123-4567
								<br />
								Address: San Francisco, CA
							</p>
						</section>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	);
};

export default PrivacyPolicy;
