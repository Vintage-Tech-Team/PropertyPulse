import React from 'react';
import { Button, Popconfirm, Tooltip } from 'antd';
import './IconAction.css';

/**
 * Compact icon-only row action with a tooltip and an optional confirm popup.
 * tone: 'approve' | 'warn' | 'danger' | 'neutral'
 */
const IconAction = ({ icon, label, tone = 'neutral', confirm, confirmDescription, okText = 'Yes', onConfirm, disabled }) => {
	const button = (
		<Button
			className={`pp-icon-action is-${tone}`}
			icon={icon}
			aria-label={label}
			disabled={disabled}
			onClick={confirm ? undefined : onConfirm}
		/>
	);

	const withTooltip = <Tooltip title={label}>{button}</Tooltip>;

	if (!confirm || disabled) return withTooltip;

	return (
		<Popconfirm
			title={confirm}
			description={confirmDescription}
			onConfirm={onConfirm}
			okText={okText}
			okButtonProps={tone === 'danger' ? { danger: true } : undefined}
			cancelText="Cancel"
		>
			{withTooltip}
		</Popconfirm>
	);
};

export default IconAction;
