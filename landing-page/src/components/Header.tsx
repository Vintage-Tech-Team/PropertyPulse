import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Star } from 'lucide-react';
import { handleGettingStart, handleLogin } from '@/lib/utils';

const Header = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
							<Star className="h-6 w-6 text-white" />
						</div>
						<span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
							PropertyPulse
						</span>
					</div>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex items-center space-x-8">
						<a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">
							Features
						</a>
						<a href="#reviews" className="text-gray-600 hover:text-purple-600 transition-colors">
							Reviews
						</a>
						<a href="#about" className="text-gray-600 hover:text-purple-600 transition-colors">
							About
						</a>
						<a href="#contact" className="text-gray-600 hover:text-purple-600 transition-colors">
							Contact
						</a>
					</nav>

					<div className="hidden md:flex items-center space-x-4">
						<Button variant="ghost" className="text-gray-600 hover:text-purple-600" onClick={handleLogin}>
							Sign In
						</Button>
						<Button
							className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
							onClick={handleGettingStart}
						>
							Get Started
						</Button>
					</div>

					{/* Mobile Menu Button */}
					<button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
						{isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
					</button>
				</div>

				{/* Mobile Menu */}
				{isMenuOpen && (
					<div className="md:hidden mt-4 py-4 border-t border-gray-200">
						<nav className="flex flex-col space-y-4">
							<a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">
								Features
							</a>
							<a href="#reviews" className="text-gray-600 hover:text-purple-600 transition-colors">
								Reviews
							</a>
							<a href="#about" className="text-gray-600 hover:text-purple-600 transition-colors">
								About
							</a>
							<a href="#contact" className="text-gray-600 hover:text-purple-600 transition-colors">
								Contact
							</a>
							<div className="flex flex-col space-y-2 pt-4">
								<Button
									variant="ghost"
									className="text-gray-600 hover:text-purple-600 justify-start"
									onClick={handleLogin}
								>
									Sign In
								</Button>
								<Button
									className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 justify-start"
									onClick={handleGettingStart}
								>
									Get Started
								</Button>
							</div>
						</nav>
					</div>
				)}
			</div>
		</header>
	);
};

export default Header;
