import React from 'react';
import { Link } from 'react-router-dom';
import styles from './LegalPage.module.css';

// Shared layout for the Privacy Policy and Terms pages: header, a sticky
// section index on wide screens, the sections in a card, and a contact box.
const LegalPage = ({ eyebrow, title, date, intro, sections, contactEmail }) => (
	<div className={styles.page}>
		<p className={styles.eyebrow}>{eyebrow}</p>
		<h1 className={styles.title}>{title}</h1>
		<p className={styles.date}>{date}</p>

		<div className={styles.body}>
			<nav className={styles.toc} aria-label="On this page">
				<p className={styles.tocTitle}>On this page</p>
				<ol>
					{sections.map(({ id, title: sectionTitle }) => (
						<li key={id}>
							<a href={`#${id}`}>{sectionTitle}</a>
						</li>
					))}
				</ol>
			</nav>

			<div>
				<article className={styles.content}>
					{intro && <p className={styles.intro}>{intro}</p>}
					{sections.map(({ id, title: sectionTitle, body }) => (
						<section key={id} id={id} className={styles.section}>
							<h2 className={styles.sectionTitle}>{sectionTitle}</h2>
							{body}
						</section>
					))}
				</article>

				<div className={styles.contactCard}>
					<div>
						<p className={styles.contactTitle}>Questions about this page?</p>
						<p className={styles.contactText}>
							Email us at <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
						</p>
					</div>
					<Link to="/contact" className={styles.contactButton}>
						Contact us
					</Link>
				</div>
			</div>
		</div>
	</div>
);

export default LegalPage;
