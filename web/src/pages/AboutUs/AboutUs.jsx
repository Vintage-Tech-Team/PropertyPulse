// pages/AboutUs.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AboutUs.module.css';

const heroImage = `${process.env.PUBLIC_URL}/images/login-hero.jpg`;

// The categories tenants rate in every review (see the Review model)
const RATED = ['Cleanliness', 'Communication', 'Location', 'Value for money', 'Water & plumbing', 'Electricity & wiring', 'Ventilation'];

const SearchIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
		<circle cx="11" cy="11" r="7" />
		<path d="m20 20-3.5-3.5" />
	</svg>
);

const ReviewIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
		<path d="M4 5h16v11H9l-5 4V5Z" />
		<path d="M8 9h8M8 12h5" strokeLinecap="round" />
	</svg>
);

const PenIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
		<path d="M4 20h4L19 9l-4-4L4 16v4Z" />
		<path d="m14 6 4 4" />
	</svg>
);

const CheckIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
		<path d="m5 12.5 4.5 4.5L19 7.5" />
	</svg>
);

const ArrowIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
		<path d="M5 12h14M13 6l6 6-6 6" />
	</svg>
);

const STEPS = [
	{
		icon: <SearchIcon />,
		title: 'Find a place',
		text: 'Search by name, area or address, or browse the map around you to see properties in your city.',
	},
	{
		icon: <ReviewIcon />,
		title: 'Read real reviews',
		text: 'See how former tenants rated everything from the plumbing and wiring to how responsive the owner was.',
	},
	{
		icon: <PenIcon />,
		title: 'Share your experience',
		text: 'Rate the place you lived in, write a detailed review and upload real photos to help the next tenant.',
	},
];

const AboutUs = () => (
	<div className={styles.page}>
		<section className={styles.hero}>
			<div>
				<p className={styles.eyebrow}>About PropertyPulse</p>
				<h1 className={styles.title}>Honest reviews for every rental.</h1>
				<p className={styles.lead}>
					<strong>PropertyPulse</strong> is your trusted platform for discovering rental property reviews, sharing tenant
					experiences, and making informed decisions before you sign a lease.
				</p>
				<div className={styles.buttons}>
					<Link to="/properties" className={styles.primaryButton}>
						Explore properties
						<ArrowIcon />
					</Link>
					<Link to="/contact" className={styles.secondaryButton}>
						Contact us
					</Link>
				</div>
			</div>
			<div className={styles.heroPhoto} style={{ backgroundImage: `url(${heroImage})` }}>
				<p className={styles.photoCaption}>
					<span>Built by renters</span>
					For renters, so you can explore with confidence.
				</p>
			</div>
		</section>

		<section className={styles.section}>
			<div className={styles.twoCol}>
				<div className={styles.card}>
					<h2 className={styles.cardTitle}>Our mission</h2>
					<p className={styles.cardText}>
						To bring transparency and trust to the rental experience, whether you’re a tenant searching for your next
						home or a property owner maintaining your reputation.
					</p>
				</div>
				<div className={styles.card}>
					<h2 className={styles.cardTitle}>Why we exist</h2>
					<p className={styles.cardText}>
						We believe renters deserve clarity before signing a lease. PropertyPulse gives a voice to tenants and
						accountability to landlords.
					</p>
				</div>
			</div>
		</section>

		<section className={styles.section}>
			<p className={styles.eyebrow}>How it works</p>
			<h2 className={styles.sectionTitle}>From search to signed lease, with eyes open.</h2>
			<p className={styles.sectionLead}>
				We empower tenants to rate properties, write detailed reviews, upload real images, and assess landlords and
				properties based on their real-world experience.
			</p>
			<div className={styles.steps}>
				{STEPS.map((step, index) => (
					<div key={step.title} className={styles.card}>
						<span className={styles.stepIcon}>{step.icon}</span>
						<p className={styles.stepNumber}>Step {index + 1}</p>
						<h3 className={styles.cardTitle}>{step.title}</h3>
						<p className={styles.cardText}>{step.text}</p>
					</div>
				))}
			</div>
		</section>

		<section className={styles.section}>
			<p className={styles.eyebrow}>What tenants rate</p>
			<h2 className={styles.sectionTitle}>The details listings leave out.</h2>
			<p className={styles.sectionLead}>Every review scores the things you only find out after moving in.</p>
			<div className={styles.categories}>
				{RATED.map((label) => (
					<span key={label} className={styles.category}>
						<CheckIcon />
						{label}
					</span>
				))}
			</div>
		</section>

		<section className={styles.cta}>
			<div>
				<h2 className={styles.ctaTitle}>Built by renters, for renters.</h2>
				<p className={styles.ctaText}>Find your next home, or help someone else find theirs.</p>
			</div>
			<div className={styles.buttons}>
				<Link to="/properties" className={styles.primaryButton}>
					Explore properties
					<ArrowIcon />
				</Link>
				<Link to="/contact" className={styles.secondaryButton}>
					Contact us
				</Link>
			</div>
		</section>
	</div>
);

export default AboutUs;
