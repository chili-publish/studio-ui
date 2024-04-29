import { Button } from '@chili-publish/grafx-shared-components';
import React from 'react';

// Define prop types for icons using TypeScript interfaces
interface IconProps {
    className?: string;
}

interface InputSwitcherProps {
    state: 'form' | 'genie';
    onSwitch: (mode: 'form' | 'genie') => void;
}

function BotIcon(props: IconProps) {
    const { className } = props;
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
        </svg>
    );
}

function ManualIcon(props: IconProps) {
    const { className } = props;
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
            <path d="M18 14h-8" />
            <path d="M15 18h-5" />
            <path d="M10 6h8v4h-8V6Z" />
        </svg>
    );
}

export function InputSwitcher(props: InputSwitcherProps) {
    const { state, onSwitch } = props;
    return (
        <div className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow">
            <div className="flex items-center space-x-2">
                <Button
                    styles={{
                        backgroundColor: state === 'form' ? '#ffffff' : '#f5f5f5',
                        color: state === 'form' ? '#2c2c2c' : '#6e6e6e',
                    }}
                    onClick={() => onSwitch('form')}
                    type="button"
                    icon={<ManualIcon />}
                    label="Form"
                />
                <Button
                    onClick={() => onSwitch('genie')}
                    styles={{
                        backgroundColor: state === 'genie' ? '#ffffff' : '#f5f5f5',
                        color: state === 'genie' ? '#2c2c2c' : '#6e6e6e',
                    }}
                    type="button"
                    icon={<BotIcon />}
                    label="Genie"
                />
            </div>
        </div>
    );
}

export default InputSwitcher;
