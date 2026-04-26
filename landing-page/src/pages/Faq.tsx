import { useState } from 'react';
import { User, Home, Shield, MapPin, CreditCard, BookOpen, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const HelpCenter = () => {
	
	const categories = [
		{
			icon: User,
			title: 'Account Issues',
			description: 'Registering, login problems, password reset, and account verification.',
		},
		{
			icon: Home,
			title: 'Property Reviews',
			description: 'Learn how to add, edit, or delete property reviews and ratings.',
		},
		{
			icon: Shield,
			title: 'Landlord Concerns',
			description: 'Report inaccurate information or resolve landlord disputes securely.',
		},
		{
			icon: MapPin,
			title: 'Search & Filters',
			description: 'Tips on using filters, map search, and location-based property discovery.',
		},
		{
			icon: CreditCard,
			title: 'Payments & Subscriptions',
			description: 'Guidance on subscription plans, coins, and redeeming rewards.',
		},
		{
			icon: BookOpen,
			title: 'Community Guidelines',
			description: 'Understand rules, privacy policies, and safety tips for tenants.',
		},
	];

	const faqs = [
		{
			question: 'How do I reset my password?',
			answer:
				'Go to your account settings, click "Change Password", and follow the instructions sent to your verified email.',
		},
		{
			question: 'How can I verify my property?',
			answer:
				'Submit property details including photos and landlord info. Once approved, your property will appear on PropertyPulse.',
		},
		{
			question: 'Can I edit a review I submitted?',
			answer:
				'Yes, you can edit your review from your account dashboard under "My Reviews".',
		},
		{
			question: 'How do I report a landlord issue?',
			answer:
				'Use the “Report Issue” option on the property page. Our support team will review and assist accordingly.',
		},
	];

	const [openIndex, setOpenIndex] = useState(null);

	const toggleFAQ = (index) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	return (
		<section className="container mx-auto px-4 py-20">
					<Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-8 font-medium">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Home
					</Link>

			{/* FAQ Accordion Section */}
			<div className="max-w-4xl mx-auto mb-16">
				<h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
					Frequently Asked Questions
				</h2>

				<div className="space-y-4">
					{faqs.map((faq, index) => (
						<div
							key={index}
							className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden"
						>
							<button
								onClick={() => toggleFAQ(index)}
								className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
							>
								<h3 className="font-semibold text-lg">{faq.question}</h3>
								<ChevronDown
									className={`h-5 w-5 transition-transform duration-300 ${
										openIndex === index ? 'rotate-180' : ''
									}`}
								/>
							</button>
							{openIndex === index && (
								<div className="p-6 border-t border-gray-200 text-gray-600">
									{faq.answer}
								</div>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Contact Support Section */}
			<div className="text-center">
				<h2 className="text-4xl font-bold text-gray-900 mb-6">Still Need Help?</h2>
				<p className="text-gray-600 mb-6">
					If you can't find the answer you’re looking for, contact our support team for assistance.
				</p>
				<Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4">
					Contact Support
				</Button>
			</div>
		</section>
		
	);
	
};

export default HelpCenter;
