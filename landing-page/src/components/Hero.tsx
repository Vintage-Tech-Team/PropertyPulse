
import { Button } from "@/components/ui/button";
import { Star, ArrowRight, Play } from "lucide-react";

const Hero = () => {
  return (
    <section className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="h-4 w-4 mr-2" />
            Trusted by 50,000+ Property Seekers
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Discover Your
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent block">
              Perfect Property
            </span>
            Through Reviews
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Make informed property decisions with authentic reviews, detailed ratings, and insights from real residents. Find your dream home with confidence.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in">
          <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-4 h-auto">
            Start Exploring
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto border-2 hover:bg-gray-50">
            <Play className="mr-2 h-5 w-5" />
            Watch Demo
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold text-purple-600 mb-2">500K+</div>
            <div className="text-gray-600">Property Reviews</div>
          </div>
          <div className="p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold text-blue-600 mb-2">50K+</div>
            <div className="text-gray-600">Active Users</div>
          </div>
          <div className="p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
