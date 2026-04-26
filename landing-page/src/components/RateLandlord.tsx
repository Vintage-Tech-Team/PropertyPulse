import { UserCheck, Home, Star } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { handleLogin } from '@/lib/utils';

const RateLandlord = () => {
	const steps = [
		{
			icon: UserCheck,
			title: 'Register as a User',
			description:
				'Create your free account and verify your email to get started. Verified users ensure a trusted and secure review community.',
		},
		{
			icon: Home,
			title: 'Add Your Property Details',
			description:
				'Enter details of the property you’re currently renting or living in. Once approved, your property will be visible to others for future reference.',
		},
		{
			icon: Star,
			title: 'Write a Review',
			description:
				'Share your genuine experience — rate the landlord, management, amenities, and neighborhood. Help others make informed property decisions with your honest feedback.',
		},
	];

	return (
		<section id="rate-landlord" className="container mx-auto px-4 py-20">
			<div className="text-center mb-16">
				<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
					Rate{' '}
					<span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
						Landlord
					</span>
				</h2>
				<p className="text-xl text-gray-600 max-w-2xl mx-auto">
					Finding and reviewing your property on PropertyPulse is simple and transparent.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
				{steps.map((step, index) => (
					<div
						key={index}
						className="group p-8 rounded-3xl bg-white text-gray-900 shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
					>
						<div className="inline-flex p-4 rounded-full bg-purple-100 mb-6 group-hover:scale-110 transition-transform duration-300">
							<step.icon className="h-7 w-7 text-purple-600" />
						</div>
						<h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
						<p className="leading-relaxed text-gray-700">{step.description}</p>
					</div>
				))}
			</div>

			<div className="text-center">
				<Button
					size="lg"
					className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-4 h-auto"
					onClick={handleLogin}
				>
					Rate LandLord
					<ArrowRight className="ml-2 h-5 w-5" />
				</Button>
			</div>
		</section>
	);
};

export default RateLandlord;
