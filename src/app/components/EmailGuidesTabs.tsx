'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';

const emailProviders = [
    { id: 'gmail', name: 'Gmail', icon: '📧' },
    { id: 'outlook', name: 'Outlook', icon: '📨' },
    { id: 'yahoo', name: 'Yahoo Mail', icon: '✉️' },
    { id: 'apple', name: 'Apple Mail', icon: '🍎' },
    { id: 'thunderbird', name: 'Thunderbird', icon: '🐦' },
    { id: 'zoho', name: 'Zoho Mail', icon: '⚡' },
];

const guideContent = {
    gmail: {
        title: "Setting up your signature in Gmail",
        steps: [
            {
                title: "Copy your signature",
                content: "Go to the 'Signatures' tab in SignTry, select your signature and click 'Copy HTML'."
            },
            {
                title: "Open Gmail Settings",
                content: "Click the gear icon in the top right corner and select 'See all settings'."
            },
            {
                title: "Navigate to Signature",
                content: "Go to the 'General' tab and scroll down to the 'Signature' section."
            },
            {
                title: "Create new signature",
                content: "Click 'Create new', give it a name, and paste your copied signature into the text box."
            },
            {
                title: "Set as default",
                content: "Select your new signature as the default for new emails and replies, then click 'Save Changes'."
            }
        ],
        tips: [
            "Make sure to paste as HTML to preserve formatting",
            "Test your signature by sending an email to yourself",
            "The signature will appear in both web and mobile versions"
        ]
    },
    outlook: {
        title: "Setting up your signature in Outlook",
        steps: [
            {
                title: "Copy your signature",
                content: "In SignTry, go to 'Signatures' and copy your signature HTML code."
            },
            {
                title: "Open Outlook Settings",
                content: "Click 'File' > 'Options' > 'Mail' > 'Signatures...'"
            },
            {
                title: "Create new signature",
                content: "Click 'New', enter a name, and paste your signature in the editing box."
            },
            {
                title: "Format as HTML",
                content: "Make sure the signature is formatted as HTML to preserve links and styling."
            },
            {
                title: "Assign to account",
                content: "Set it as the default for new messages and replies, then click 'OK'."
            }
        ],
        tips: [
            "Works with both Outlook desktop and web versions",
            "HTML formatting ensures social icons display correctly",
            "You can have different signatures for different email accounts"
        ]
    },
    yahoo: {
        title: "Setting up your signature in Yahoo Mail",
        steps: [
            {
                title: "Copy your signature",
                content: "Copy the HTML signature from your SignTry dashboard."
            },
            {
                title: "Open Yahoo Settings",
                content: "Click the gear icon and select 'More Settings'."
            },
            {
                title: "Find Writing email",
                content: "Navigate to 'Writing email' in the left sidebar."
            },
            {
                title: "Enable signature",
                content: "Toggle the signature switch on and paste your signature in the text box."
            },
            {
                title: "Save changes",
                content: "Scroll down and click 'Save' to apply your new signature."
            }
        ],
        tips: [
            "Yahoo supports HTML signatures with images",
            "The signature will appear on all devices",
            "You can disable it anytime by toggling the switch"
        ]
    },
    apple: {
        title: "Setting up your signature in Apple Mail",
        steps: [
            {
                title: "Copy your signature",
                content: "Copy your HTML signature from SignTry."
            },
            {
                title: "Open Mail Preferences",
                content: "Go to 'Mail' > 'Preferences' in the top menu."
            },
            {
                title: "Select Signatures tab",
                content: "Click the 'Signatures' tab and select your email account."
            },
            {
                title: "Create signature",
                content: "Click the '+' button, name your signature, and paste the HTML."
            },
            {
                title: "Apply to account",
                content: "Drag the signature to your email account to set it as default."
            }
        ],
        tips: [
            "Works on both Mac and iOS devices",
            "You can have different signatures for different accounts",
            "The signature syncs across your Apple devices"
        ]
    },
    thunderbird: {
        title: "Setting up your signature in Thunderbird",
        steps: [
            {
                title: "Copy your signature",
                content: "Copy the HTML code from your SignTry signature."
            },
            {
                title: "Open Account Settings",
                content: "Go to 'Tools' > 'Account Settings'."
            },
            {
                title: "Select your account",
                content: "Choose the email account you want to add the signature to."
            },
            {
                title: "Attach signature",
                content: "Check 'Attach the signature from a file' and paste your HTML."
            },
            {
                title: "Use HTML format",
                content: "Make sure to select HTML format to preserve the design."
            }
        ],
        tips: [
            "Thunderbird supports rich HTML signatures",
            "You can set different signatures for different identities",
            "The signature will appear in both new emails and replies"
        ]
    },
    zoho: {
        title: "Setting up your signature in Zoho Mail",
        steps: [
            {
                title: "Copy your signature",
                content: "Copy the HTML signature from SignTry."
            },
            {
                title: "Open Settings",
                content: "Click the gear icon and go to 'Mail Settings'."
            },
            {
                title: "Select Composer",
                content: "Navigate to the 'Composer' section."
            },
            {
                title: "Paste signature",
                content: "Scroll to 'Signature' and paste your HTML signature."
            },
            {
                title: "Save settings",
                content: "Click 'Save' to apply your new signature."
            }
        ],
        tips: [
            "Zoho supports full HTML signatures",
            "The signature appears in all outgoing emails",
            "You can enable/disable it anytime in settings"
        ]
    }
};

export default function EmailGuidesTabs() {
    const [activeProvider, setActiveProvider] = useState('gmail');

    return (
        <div className="w-full max-w-6xl mx-auto">
            {/* Provider Tabs */}
            <div className="border-b border-gray-200 mb-8">
                <nav className="-mb-px flex space-x-4 overflow-x-auto">
                    {emailProviders.map((provider) => (
                        <button
                            key={provider.id}
                            onClick={() => setActiveProvider(provider.id)}
                            className={`flex items-center whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm transition-colors cursor-pointer ${activeProvider === provider.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <span className="mr-2 text-lg">{provider.icon}</span>
                            {provider.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Guide Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {guideContent[activeProvider as keyof typeof guideContent].title}
                </h2>

                {/* Steps */}
                <div className="space-y-6">
                    {guideContent[activeProvider as keyof typeof guideContent].steps.map((step, index) => (
                        <div key={index} className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{step.content}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tips */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Pro Tips</h3>
                    <ul className="space-y-2">
                        {guideContent[activeProvider as keyof typeof guideContent].tips.map((tip, index) => (
                            <li key={index} className="text-blue-800 flex items-start">
                                <span className="mr-2">•</span>
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Call to Action */}
                <div className="mt-8 text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Ready to create your signature?
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Go to the Signatures tab in your dashboard to copy your HTML signature code.
                    </p>
                    <Link href="/signatures">
                        <Button
                            className="bg-blue-400 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors cursor-pointer"
                        >
                            Go to Signatures
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}