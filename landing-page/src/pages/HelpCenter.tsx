import { User, Home, Shield, MapPin, CreditCard, BookOpen } from 'lucide-react';
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

	return (
		<section className="container mx-auto px-4 py-20">
			<Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-8 font-medium">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Home
					</Link>
			{/* Hero Section */}
			<div className="text-center mb-16">
				<h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
					Help Center
				</h1>
				<p className="text-xl text-gray-600 max-w-2xl mx-auto">
					Find answers to your questions and get support quickly. Explore our help topics or contact support if you need assistance.
				</p>
			</div>

			{/* Categories Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
				{categories.map((category, index) => (
					<div
						key={index}
						className="group p-8 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-2xl transition-transform duration-300 hover:-translate-y-2"
					>
						<div className="inline-flex p-4 rounded-full bg-white/20 mb-6 group-hover:scale-110 transition-transform duration-300">
							<category.icon className="h-7 w-7 text-white" />
						</div>
						<h3 className="text-2xl font-semibold mb-3">{category.title}</h3>
						<p className="leading-relaxed text-white/90">{category.description}</p>
					</div>
				))}
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
