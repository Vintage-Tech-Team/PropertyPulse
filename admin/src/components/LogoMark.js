import React from 'react';

const LogoMark = ({ house = '#ffffff', pulse = '#5cc29a', ...props }) => (
	<svg viewBox="20 60 160 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
		<g fill="none" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
			<polygon stroke={house} points="50,100 70,80 90,100 90,140 50,140" />
			<polygon stroke={house} points="80,90 100,70 120,90 120,140 80,140" />
			<polygon stroke={house} points="110,100 130,80 150,100 150,140 110,140" />
			<polyline stroke={pulse} points="30,120 60,120 70,100 85,140 100,80 115,120 170,120" />
		</g>
	</svg>
);

export default LogoMark;
