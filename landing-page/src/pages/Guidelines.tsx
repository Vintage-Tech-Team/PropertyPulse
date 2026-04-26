import { Shield, UserCheck, MapPin, BookOpen, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Guidelines = () => {
	const guidelines = [
		{
			icon: UserCheck,
			title: 'Be Honest',
			description:
				'Always provide accurate and truthful information about properties and landlords to help the community trust the platform.',
		},
		{
			icon: Shield,
			title: 'Respect Privacy',
			description:
				'Do not share personal contact info or sensitive details of landlords or other tenants.',
		},
		{
			icon: Home,
			title: 'Property Verification',
			description:
				'Ensure that the property you review is one you have actually lived in or rented.',
		},
		{
			icon: MapPin,
			title: 'Location Accuracy',
			description:
				'Provide precise location details and avoid misleading information about the property’s neighborhood.',
		},
		{
			icon: BookOpen,
			title: 'Follow Community Rules',
			description:
				'Adhere to the PropertyPulse community guidelines and report any violations you notice.',
		},
	];

	return (
		<section className="container mx-auto px-4 py-20 bg-gray-50">
					<Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-8 font-medium">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Home
					</Link>
			{/* Hero Section */}
			<div className="text-center mb-16">
				<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
					<span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
						Community Guidelines
					</span>
				</h2>
				<p className="text-xl text-gray-600 max-w-2xl mx-auto">
					To maintain a trustworthy and safe community, please follow these guidelines when adding reviews or interacting on PropertyPulse.
				</p>
			</div>

			{/* Guidelines Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{guidelines.map((guideline, index) => (
					<div
						key={index}
						className="group p-8 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-2xl transition-transform duration-300 hover:-translate-y-2"
					>
						<div className="inline-flex p-4 rounded-full bg-white/20 mb-6 group-hover:scale-110 transition-transform duration-300">
							<guideline.icon className="h-7 w-7 text-white" />
						</div>
						<h3 className="text-2xl font-semibold mb-3">{guideline.title}</h3>
						<p className="leading-relaxed text-white/90">{guideline.description}</p>
					</div>
				))}
			</div>
		</section>
	);
};

export default Guidelines;
