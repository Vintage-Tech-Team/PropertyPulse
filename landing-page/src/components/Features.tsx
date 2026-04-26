import { Shield, Users, MapPin, Star, TrendingUp, Clock } from 'lucide-react';

const Features = () => {
	const features = [
		{
			icon: Shield,
			title: 'Verified Reviews',
			description: 'All reviews are verified from real residents to ensure authenticity and trustworthiness.',
		},
		{
			icon: Star,
			title: 'Detailed Ratings',
			description: 'Comprehensive ratings covering location, amenities, management, and overall satisfaction.',
		},
		{
			icon: Users,
			title: 'Community Insights',
			description: 'Connect with current and former residents to get insider perspectives on properties.',
		},
		{
			icon: MapPin,
			title: 'Location Analysis',
			description: 'Detailed neighborhood information including safety, convenience, and local amenities.',
		},
		{
			icon: TrendingUp,
			title: 'Market Trends',
			description: 'Stay updated with real-time market trends and property value insights.',
		},
		{
			icon: Clock,
			title: 'Real-time Updates',
			description: 'Get instant notifications about new reviews and property updates in your area.',
		},
	];

	return (
		<section id="features" className="container mx-auto px-4 py-20">
			<div className="text-center mb-16">
				<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
					Why Choose{' '}
					<span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
						PropertyPulse
					</span>
				</h2>
				<p className="text-xl text-gray-600 max-w-2xl mx-auto">
					Discover the features that make PropertyPulse the most trusted platform for property reviews and insights.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{features.map((feature, index) => (
					<div
						key={index}
						className="group p-8 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
					>
						<div className="inline-flex p-3 rounded-xl bg-white/20 mb-6 group-hover:scale-110 transition-transform duration-300">
							<feature.icon className="h-6 w-6 text-white" />
						</div>
						<h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
						<p className="leading-relaxed text-white/90">{feature.description}</p>
					</div>
				))}
			</div>
		</section>
	);
};

export default Features;
