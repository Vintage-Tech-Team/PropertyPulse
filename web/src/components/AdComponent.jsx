import React, { useEffect } from 'react';

const AdComponent = () => {
	useEffect(() => {
		// Load AdSense script dynamically
		const script = document.createElement('script');
		script.async = true;
		script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
		script.setAttribute('data-ad-client', 'ca-pub-5204282066520456');
		script.crossOrigin = 'anonymous';
		document.body.appendChild(script);

		// Push ads configuration to AdSense
		const ads = document.getElementsByClassName('adsbygoogle');
		Array.from(ads).forEach((ad) => {
			try {
				(window.adsbygoogle = window.adsbygoogle || []).push({});
			} catch (e) {
				console.error('AdSense error:', e);
			}
		});
	}, []);

	return (
		<div style={{ margin: '10px 0' }}>
			<ins
				className="adsbygoogle"
				style={{ display: 'block' }}
				data-ad-client="ca-pub-5204282066520456"
				data-ad-slot="7537506446"
				data-ad-format="auto"
				data-full-width-responsive="true"
			></ins>
		</div>
	);
};

export default AdComponent;
