const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, text) => {
	try {
		const response = await resend.emails.send({
			from: process.env.EMAIL_USER,
			to,
			subject,
			html: `<p>${text}</p>`, // Resend requires `html`
		});

		console.log('Email sent:', response);
	} catch (error) {
		console.error('Failed to send email:', error);
	}
};

module.exports = sendEmail;
