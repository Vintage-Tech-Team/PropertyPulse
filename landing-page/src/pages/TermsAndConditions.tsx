import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsAndConditions = () => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
			<Header />

			<div className="container mx-auto px-4 py-20">
				<div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
					<Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-8 font-medium">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Home
					</Link>

					<h1 className="text-4xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>
					<p className="text-gray-600 mb-8">Last updated: June 20, 2025</p>

					<div className="prose prose-lg max-w-none">
						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
							<p className="text-gray-600 leading-relaxed mb-4">
								By accessing and using PropertyPulse, you accept and agree to be bound by the terms and provision of
								this agreement. If you do not agree to abide by the above, please do not use this service.
							</p>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
							<p className="text-gray-600 leading-relaxed mb-4">
								Permission is granted to temporarily download one copy of PropertyPulse's materials for personal,
								non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and
								under this license you may not:
							</p>
							<ul className="list-disc pl-6 text-gray-600 mb-4">
								<li>modify or copy the materials</li>
								<li>use the materials for any commercial purpose or for any public display</li>
								<li>attempt to reverse engineer any software contained on PropertyPulse's website</li>
								<li>remove any copyright or other proprietary notations from the materials</li>
							</ul>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Reviews and Content</h2>
							<p className="text-gray-600 leading-relaxed mb-4">
								Users may post reviews and content on PropertyPulse. By posting content, you grant PropertyPulse a
								non-exclusive, royalty-free, perpetual license to use, modify, and display such content. You are
								responsible for the accuracy and legality of your content.
							</p>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Privacy Policy</h2>
							<p className="text-gray-600 leading-relaxed mb-4">
								Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the
								service, to understand our practices.
							</p>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Disclaimer</h2>
							<p className="text-gray-600 leading-relaxed mb-4">
								The materials on PropertyPulse's website are provided on an 'as is' basis. PropertyPulse makes no
								warranties, expressed or implied, and hereby disclaims and negates all other warranties including
								without limitation, implied warranties or conditions of merchantability, fitness for a particular
								purpose, or non-infringement of intellectual property or other violation of rights.
							</p>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contact Information</h2>
							<p className="text-gray-600 leading-relaxed">
								If you have any questions about these Terms and Conditions, please contact us at:
								<br />
								Email: legal@propertypulse.com
								<br />
								Phone: +1 (555) 123-4567
							</p>
						</section>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	);
};

export default TermsAndConditions;
