import { Search, Building2, MapPin, UserCheck, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { handleGettingStart } from '@/lib/utils';

const FindReviews = () => {
	const filters = [
		{
			icon: UserCheck,
			title: 'By Landlord Name',
			description: 'View all properties managed by a specific landlord and see what tenants have experienced.',
			color: 'text-blue-600',
		},
		{
			icon: Building2,
			title: 'By City',
			description: 'Explore reviews and ratings within your preferred city or region to find trusted properties.',
			color: 'text-purple-600',
		},
		{
			icon: Compass,
			title: 'Near Your Current Location',
			description: 'Use GPS-based search to discover properties close to you instantly.',
			color: 'text-green-600',
		},
		{
			icon: MapPin,
			title: 'Interactive Map Search',
			description: 'Visually browse through neighborhoods and find properties using our dynamic map view.',
			color: 'text-red-600',
		},
	];

	return (
		<section id="find-reviews" className="container mx-auto px-4 py-20">
			{/* Header */}
			<div className="text-center mb-16">
				<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
					Find{' '}
					<span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
						Reviews
					</span>
				</h2>
				<p className="text-xl text-gray-600 max-w-2xl mx-auto">
					Looking for a property? PropertyPulse offers powerful filters to help you find exactly what you need.
					Find verified reviews, insights, and ratings — all in one place.
				</p>
			</div>

			{/* Main Content: Cards + Map */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
				{/* Left Side: Vertical Cards */}
				<div className="lg:col-span-8 space-y-6">
					{filters.map((filter, index) => (
						<div
							key={index}
							className="group flex items-start p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
						>
							<div
								className={`inline-flex p-3 rounded-xl bg-gray-50 ${filter.color} mr-5 group-hover:scale-110 transition-transform duration-300`}
							>
								<filter.icon className="h-6 w-6" />
							</div>
							<div>
								<h3 className="text-xl font-semibold text-gray-900 mb-2">{filter.title}</h3>
								<p className="text-gray-600 leading-relaxed">{filter.description}</p>
							</div>
						</div>
					))}
				</div>

				{/* Right Side: Map Section */}
				<div className="lg:col-span-4">
					<div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md h-full flex flex-col justify-between">
						<div>
							<h3 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
								Explore Reviews on Map
							</h3>
							<div className="w-full h-80 bg-gray-200 rounded-xl mb-6 flex items-center justify-center text-gray-500">
								<MapPin className="h-6 w-6 mr-2" />
								Map Preview (Embed Google Map Here)
							</div>
						</div>

						<Button
							size="lg"
							className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-4 h-auto"
							onClick={handleGettingStart}
						>
						Start Finding Reviews
						<ArrowRight className="ml-2 h-5 w-5" />
					</Button>
					</div>
				</div>
			</div>
		</section>
	);
};

export default FindReviews;
