import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // <-- add useNavigate
import { verifyEmail } from '../../services/authService';

function VerifyEmail() {
	const { token } = useParams();
	const navigate = useNavigate(); // <-- initialize navigate
	const [message, setMessage] = useState('Verifying...');
	const [success, setSuccess] = useState(false); // <-- track success

	useEffect(() => {
		const verify = async () => {
			try {
				const data = await verifyEmail(token);
				setMessage(data.message);
				setSuccess(true);

				// After a delay, move to login
				setTimeout(() => {
					navigate('/login');
				}, 3000); // wait for 3 seconds
			} catch (error) {
				if (error.response?.data?.message === 'User already verified') {
					// After a delay, move to login
					setTimeout(() => {
						navigate('/login');
					}, 3000); // wait for 3 seconds
				} else {
					setMessage(error.response?.data?.message || 'Verification failed');
				}
			}
		};

		verify();
	}, [token, navigate]);

	return (
		<div className="verify-container">
			<h2>{message}</h2>
			{success && <p>Redirecting to login...</p>} {/* Show extra message */}
		</div>
	);
}

export default VerifyEmail;
