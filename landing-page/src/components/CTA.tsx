import { Button } from '@/components/ui/button';
import { handleGettingStart } from '@/lib/utils';
import { ArrowRight, Star } from 'lucide-react';

const CTA = () => {
	return (
		<section className="container mx-auto px-4 py-20">
			<div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
				{/* Background decoration */}
				<div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] opacity-20"></div>
				<div className="absolute top-10 right-10 text-white/20">
					<Star className="h-32 w-32" />
				</div>
				<div className="absolute bottom-10 left-10 text-white/20">
					<Star className="h-24 w-24" />
				</div>

				<div className="relative z-10 max-w-3xl mx-auto">
					<h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Find Your Perfect Property?</h2>
					<p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
						Join thousands of satisfied users who found their dream homes through authentic reviews and trusted
						insights.
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						<Button
							size="lg"
							className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-4 h-auto font-semibold"
							onClick={handleGettingStart}
						>
							Start Your Search
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
						<Button
							size="lg"
							variant="ghost"
							className="text-white border-2 border-white/30 hover:bg-white/10 text-lg px-8 py-4 h-auto"
							onClick={handleGettingStart}
						>
							Write a Review
						</Button>
					</div>

					<div className="mt-8 text-white/80">
						<p className="text-sm">⭐ 4.9/5 rating from 10,000+ reviews • Free to join</p>
					</div>
				</div>
			</div>
		</section>
	);
};

export default CTA;
