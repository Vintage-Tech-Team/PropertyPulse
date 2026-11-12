// Seeds a local database with sample users, addresses, properties and reviews.
// Usage: npm run seed (from backend/)
// Re-runnable: removes previously seeded records (emails @propertypulse.test, consumerIds SEED-*) first.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Address = require('../models/Address');
const Property = require('../models/Property');
const Review = require('../models/Review');

if (process.env.NODE_ENV === 'production') throw new Error('Refusing to seed with NODE_ENV=production');

const password = process.env.SEED_PASSWORD;
if (!password) throw new Error('SEED_PASSWORD missing from backend/.env');

// Dummy photos from Unsplash, one set per listing below (same order). The first photo is the card image.
const unsplash = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;
const photos = [
	['1545324418-cc1a3fa10c00', '1522708323590-d24dbb6b0267', '1484154218962-a197022b5858'],
	['1568605114967-8130f3a36994', '1600607687939-ce8a6c25118c', '1505691938895-1758d7feb511'],
	['1502672260266-1c1ef2d93688', '1616594039964-ae9021a400a0', '1595526114035-0d45ed16cfbf'],
	['1570129477492-45c003edd2be', '1493809842364-78817add7ffb', '1586023492125-27b2c045efd7'],
	['1600596542815-ffad4c1539a9', '1600566753190-17f0baa2a6c3', '1600210492486-724fe5c67fb0'],
	['1564013799919-ab600027ffc6', '1560448204-e02f11c3d0e2', '1499916078039-922301b0eb9b'],
	['1460317442991-0ec209397118', '1586023492125-27b2c045efd7', '1618221195710-dd6b41faaea6'],
	['1574362848149-11496d93a7c7', '1493809842364-78817add7ffb', '1505691938895-1758d7feb511'],
	['1580587771525-78b9dba3b914', '1600210492486-724fe5c67fb0', '1484154218962-a197022b5858'],
].map((ids) => ids.map(unsplash));

const users = [
	{ name: 'Admin User', email: 'admin@propertypulse.test', role: 'admin' },
	{ name: 'Ayesha Khan', email: 'ayesha@propertypulse.test' },
	{ name: 'Bilal Ahmed', email: 'bilal@propertypulse.test' },
	{ name: 'Sara Malik', email: 'sara@propertypulse.test' },
	{ name: 'Usman Tariq', email: 'usman@propertypulse.test' },
];

const listings = [
	{ name: 'Sunny 2-Bed Apartment', owner: 'Imran Qureshi', societyTown: 'F-10', block: 'Markaz', street: 'Street 12', houseNumber: '4A', city: 'Islamabad', state: 'Islamabad Capital Territory', lat: 33.6959, lng: 73.0135, description: 'Bright corner apartment near F-10 Markaz with backup power and covered parking.' },
	{ name: 'Family House with Lawn', owner: 'Nadia Hussain', societyTown: 'G-11', block: 'G-11/2', street: 'Street 45', houseNumber: '221', city: 'Islamabad', state: 'Islamabad Capital Territory', lat: 33.6688, lng: 72.9998, description: '3-bedroom house with a front lawn, gas connection and quiet street.' },
	{ name: 'Studio near Blue Area', owner: 'Faisal Raza', societyTown: 'F-6', block: 'Supermarket', street: 'Street 7', houseNumber: '19', apartmentNumber: '3B', city: 'Islamabad', state: 'Islamabad Capital Territory', lat: 33.7294, lng: 73.0757, description: 'Compact furnished studio, walking distance to Blue Area offices.' },
	{ name: 'Upper Portion, E-11', owner: 'Hina Javed', societyTown: 'E-11', block: 'E-11/3', street: 'Street 3', houseNumber: '88', city: 'Islamabad', state: 'Islamabad Capital Territory', lat: 33.6975, lng: 72.9772, description: 'Separate-entrance upper portion with two bedrooms and a terrace.' },
	{ name: 'Bahria Town Townhouse', owner: 'Kamran Shah', societyTown: 'Bahria Town Phase 4', block: 'Civic Center', street: 'Main Boulevard', houseNumber: '12', city: 'Rawalpindi', state: 'Punjab', lat: 33.5313, lng: 73.1123, description: 'Modern townhouse in a gated community with 24/7 security.' },
	{ name: 'DHA Phase 5 Portion', owner: 'Rabia Aslam', societyTown: 'DHA Phase 5', block: 'Block C', street: 'Street 9', houseNumber: '310', city: 'Lahore', state: 'Punjab', lat: 31.4627, lng: 74.4087, description: 'Ground floor portion with servant quarter and dedicated parking.' },
	{ name: 'Gulberg Office-Ready Flat', owner: 'Zain Abbasi', societyTown: 'Gulberg III', block: 'MM Alam Road', street: 'Main Road', houseNumber: '55', apartmentNumber: '7', city: 'Lahore', state: 'Punjab', lat: 31.5107, lng: 74.3519, description: 'Spacious flat on MM Alam Road, suitable for small offices.' },
	{ name: 'Clifton Sea-View Apartment', owner: 'Mehwish Siddiqui', societyTown: 'Clifton', block: 'Block 2', street: 'Khayaban-e-Roomi', houseNumber: '14', apartmentNumber: '11C', city: 'Karachi', state: 'Sindh', lat: 24.8138, lng: 67.0300, description: 'Sea-facing 3-bed apartment with lift and generator.' },
	{ name: 'Unverified Listing (pending)', owner: 'Test Owner', societyTown: 'I-8', block: 'I-8/4', street: 'Street 20', houseNumber: '5', city: 'Islamabad', state: 'Islamabad Capital Territory', lat: 33.6676, lng: 73.0758, description: 'Awaiting admin verification - should only appear in the admin panel.', verified: false },
];

const comments = [
	'Landlord was responsive and fixed issues quickly. Water pressure is great.',
	'Decent place but wiring is old; breakers trip when running two ACs.',
	'Very well ventilated, lots of sunlight. Neighbourhood is quiet.',
	'Value for money is good, though plumbing needed repairs twice.',
	'Clean when we moved in and the owner returned the deposit on time.',
	'Location is excellent but the building gets humid in summer.',
];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
	await mongoose.connect(process.env.MONGODB_URI);
	console.log('Connected to', process.env.MONGODB_URI);

	// Clean up previous seed run
	const oldProps = await Property.find({ consumerId: /^SEED-/ });
	await Review.deleteMany({ property: { $in: oldProps.map((p) => p._id) } });
	await Address.deleteMany({ _id: { $in: oldProps.map((p) => p.address) } });
	await Property.deleteMany({ _id: { $in: oldProps.map((p) => p._id) } });
	await User.deleteMany({ email: /@propertypulse\.test$/ });

	const createdUsers = [];
	for (const u of users) createdUsers.push(await User.create({ ...u, password, verified: true }));
	const tenants = createdUsers.filter((u) => u.role !== 'admin');

	let reviewCount = 0;
	for (const [i, l] of listings.entries()) {
		const address = await Address.create({
			street: l.street,
			houseNumber: l.houseNumber,
			apartmentNumber: l.apartmentNumber,
			societyTown: l.societyTown,
			block: l.block,
			city: l.city,
			state: l.state,
			country: 'Pakistan',
			location: { lat: l.lat, lng: l.lng },
		});
		const consumerId = `SEED-${String(1000 + i)}`;
		const property = await Property.create({
			name: l.name,
			description: l.description,
			owner: l.owner,
			address: address._id,
			verified: l.verified ?? true,
			imageUrls: photos[i],
			createdBy: tenants[i % tenants.length]._id,
			electricityBillImage: `https://picsum.photos/seed/bill${i}/600/800`,
			consumerId,
		});

		if (l.verified === false) continue;
		const reviewers = tenants.slice(0, rand(2, tenants.length));
		for (const [j, reviewer] of reviewers.entries()) {
			const r = () => rand(2, 5);
			const ratings = {
				cleanliness: r(), communication: r(), location: r(), valueForMoney: r(),
				waterPlumbing: r(), electricityWiring: r(), ventilation: r(),
			};
			const avg = Object.values(ratings).reduce((a, b) => a + b, 0) / 7;
			const months = rand(3, 24);
			const moveOut = new Date(2026, rand(0, 9), rand(1, 28));
			await Review.create({
				property: property._id,
				reviewer: reviewer._id,
				overallRating: Math.round(avg),
				ratings,
				comment: comments[(i + j) % comments.length],
				stayDuration: `${months} months`,
				moveInDate: new Date(moveOut.getFullYear(), moveOut.getMonth() - months, moveOut.getDate()),
				moveOutDate: moveOut,
				// One pending review per property so the admin moderation queue isn't empty
				status: j === reviewers.length - 1 ? 'pending' : 'approved',
				consumerId,
			});
			reviewCount++;
		}
	}

	console.log(`Seeded ${createdUsers.length} users, ${listings.length} properties, ${reviewCount} reviews.`);
	await mongoose.disconnect();
}

main().catch(async (err) => {
	console.error(err);
	await mongoose.disconnect();
	process.exit(1);
});
