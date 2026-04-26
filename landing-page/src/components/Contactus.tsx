import { Mail, Phone, User } from 'lucide-react';

const ContactUs = () => {
	return (
		<section id="contact-us" className="container mx-auto px-4 py-20">
			{/* Header */}
			<div className="text-center mb-16">
				<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
					Contact{' '}
					<span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
						Us
					</span>
				</h2>
				<p className="text-xl text-gray-600 max-w-2xl mx-auto">
					We’d love to hear from you! Whether you have a question, feedback, or a partnership inquiry —
					the PropertyPulse team is here to help.
				</p>
			</div>

			{/* Centered Form */}
			<div className="flex justify-center">
				<div className="w-full md:w-2/3 lg:w-1/2 bg-white p-8 rounded-3xl shadow-lg border border-gray-200">
					<form className="space-y-6">
						<div>
							<label className="block text-gray-700 font-medium mb-2">Name</label>
							<input
								type="text"
								placeholder="Your Name"
								className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:outline-none"
							/>
						</div>

						<div>
							<label className="block text-gray-700 font-medium mb-2">Phone Number</label>
							<input
								type="tel"
								placeholder="+44 123 456 789"
								className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:outline-none"
							/>
						</div>

						<div>
							<label className="block text-gray-700 font-medium mb-2">Email Address</label>
							<input
								type="email"
								placeholder="you@example.com"
								className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:outline-none"
							/>
						</div>

						<div>
							<label className="block text-gray-700 font-medium mb-2">Message</label>
							<textarea
								placeholder="Write your message..."
								className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:outline-none h-32 resize-none"
							></textarea>
						</div>

						<button
							type="submit"
							className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex justify-center items-center gap-2"
						>
							Send Message
						</button>
					</form>
				</div>
			</div>
		</section>
	);
};

export default ContactUs;
