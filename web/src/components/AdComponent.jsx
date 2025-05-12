import React, { useEffect, useRef } from 'react';

// Regular AdSense Component
const AdSense = () => {
	const adRef = useRef(null);

	useEffect(() => {
		// Load AdSense script if not already loaded
		const existingScript = document.querySelector('script[src*="adsbygoogle"]');
		if (!existingScript) {
			const script = document.createElement('script');
			script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5204282066520456';
			script.async = true;
			script.crossOrigin = 'anonymous';
			document.head.appendChild(script);
		}

		// Initialize the ad
		try {
			if (adRef.current) {
				(window.adsbygoogle = window.adsbygoogle || []).push({});
			}
		} catch (error) {
			console.error('AdSense error:', error);
		}
	}, []);

	return (
		<ins
			ref={adRef}
			className="adsbygoogle"
			style={{ display: 'block' }}
			data-ad-client="ca-pub-5204282066520456"
			data-ad-slot="7537506446"
			data-ad-format="auto"
			data-full-width-responsive="true"
		/>
	);
};

export default AdSense;
