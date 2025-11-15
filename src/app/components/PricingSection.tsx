'use client';

import { useState, useTransition } from 'react';
import { subscribeAction } from '../utils/stripe/subscribeAction';
import { useRouter } from 'next/navigation';

export default function PricingSection({ userId }: { userId: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isYearly, setIsYearly] = useState(false);

    const handleClickSubscribeButton = async (priceId: string) => {
        startTransition(async () => {
            const url = await subscribeAction({ userId, priceId })
            if (url) {
                router.push(url);
            } else {
                console.error("Failed to create subscription session")
            }
        }
        )
    }

    const planBasicMonthly = process.env.NEXT_PUBLIC_PRICE_ID_BASIC_MONTHLY as string;
    const planBasicYearly = process.env.NEXT_PUBLIC_PRICE_ID_BASIC_YEARLY as string;
    const planProfessionalMonthly = process.env.NEXT_PUBLIC_PRICE_ID_PROFESSIONAL_MONTHLY as string;
    const planProfessionalYearly = process.env.NEXT_PUBLIC_PRICE_ID_PROFESSIONAL_YEARLY as string;

    return (
        <section className="py-24" id="pricing">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Choose Your Plan to Get Started
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
                        Choose the plan that&apos;s right for you. Cancel anytime
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <span
                            className={`font-semibold ${!isYearly ? 'text-blue-400' : 'text-gray-500'
                                }`}
                        >
                            Monthly
                        </span>
                        <div className="relative inline-block w-16 h-8">
                            <input
                                type="checkbox"
                                id="billing-toggle"
                                className="sr-only"
                                checked={isYearly}
                                onChange={(e) => setIsYearly(e.target.checked)}
                            />
                            <label
                                htmlFor="billing-toggle"
                                className={`block w-full h-8 rounded-full cursor-pointer transition-colors ${isYearly ? 'bg-blue-400' : 'bg-gray-300'
                                    }`}
                            >
                                <span
                                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${isYearly ? 'transform translate-x-8' : ''
                                        }`}
                                />
                            </label>
                        </div>
                        <span
                            className={`font-semibold flex items-center gap-2 ${isYearly ? 'text-blue-400' : 'text-gray-500'
                                }`}
                        >
                            Yearly
                            <span className="bg-blue-400 text-white text-xs px-2 py-1 rounded-full font-bold">
                                Save 30%
                            </span>
                        </span>
                    </div>
                </div>

                <div className="flex gap-10">
                    {/* Basic Plan */}
                    <div className="relative w-96 p-10 bg-white rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                        <div className="text-center mb-8 pb-8 border-b border-gray-200">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Basic</h3>
                            <div className="mb-2">
                                {!isYearly ? (
                                    <div className="flex items-baseline justify-center">
                                        <span className="text-2xl font-bold text-gray-400">$</span>
                                        <span className="text-5xl font-extrabold text-gray-900 mx-1">9</span>
                                        <span className="text-lg text-gray-400">/month</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-baseline justify-center">
                                            <span className="text-2xl font-bold text-gray-400">$</span>
                                            <span className="text-5xl font-extrabold text-gray-900 mx-1">6.30</span>
                                            <span className="text-lg text-gray-400">/month</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-400">Perfect for individuals / small teams</p>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center text-gray-900">
                                <span className="text-blue-400 font-bold mr-3">✓</span>
                                5 email signatures
                            </li>
                            <li className="flex items-center text-gray-900">
                                <span className="text-blue-400 font-bold mr-3">✓</span>
                                Analytics Dashboard
                            </li>
                            <li className="flex items-center text-gray-900">
                                <span className="text-blue-400 font-bold mr-3">✓</span>
                                Email Support
                            </li>
                            <li className="flex items-center text-gray-900">
                                <span className="text-blue-400 font-bold mr-3">✓</span>
                                Verified Badges
                            </li>
                        </ul>
                        <button disabled={isPending} onClick={() => handleClickSubscribeButton(isYearly ? planBasicYearly : planBasicMonthly)} className="w-full py-3 px-6 bg-white text-gray-900 border-2 border-gray-300 rounded-lg font-semibold hover:border-blue-400 hover:-translate-y-1 transition-all duration-300 shadow-sm cursor-pointer">
                            Get Started
                        </button>
                    </div>

                    {/* Professional Plan */}
                    <div className="relative w-96 p-10 bg-white rounded-2xl border-2 border-blue-400 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-400 to-blue-700 text-white text-sm font-bold px-4 py-1 rounded-full">
                            Most Popular
                        </div>
                        <div className="text-center mb-8 pb-8 border-b border-gray-200">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Professional</h3>
                            <div className="mb-2">
                                {!isYearly ? (
                                    <div className="flex items-baseline justify-center">
                                        <span className="text-2xl font-bold text-gray-400">$</span>
                                        <span className="text-5xl font-extrabold text-gray-900 mx-1">29</span>
                                        <span className="text-lg text-gray-400">/month</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-baseline justify-center">
                                            <span className="text-2xl font-bold text-gray-400">$</span>
                                            <span className="text-5xl font-extrabold text-gray-900 mx-1">20.30</span>
                                            <span className="text-lg text-gray-400">/month</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-400">For growing businesses</p>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center text-gray-900">
                                <span className="text-blue-400 font-bold mr-3">✓</span>
                                Everything in Basic
                            </li>
                            <li className="flex items-center text-gray-900">
                                <span className="text-blue-400 font-bold mr-3">✓</span>
                                Up to 50 signatures
                            </li>
                            <li className="flex items-center text-gray-900">
                                <span className="text-blue-400 font-bold mr-3">✓</span>
                                Advanced analytics
                            </li>
                            <li className="flex items-center text-gray-900">
                                <span className="text-blue-400 font-bold mr-3">✓</span>
                                Priority support
                            </li>
                        </ul>
                        <button className="w-full py-3 px-6 bg-blue-400 text-white rounded-lg font-semibold hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300 shadow-lg cursor-pointer" onClick={() => handleClickSubscribeButton(isYearly ? planProfessionalYearly : planProfessionalMonthly)}>
                            Get Started
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}