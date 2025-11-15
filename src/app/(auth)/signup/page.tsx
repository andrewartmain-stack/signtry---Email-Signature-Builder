'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle } from '@/components/ui/alert'

import { createClient } from '../../utils/supabase/client'

export default function SignupPage() {

    const [fullName, setFullName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorAlertMessage, setErrorAlertMessage] = useState<string>('');
    const [successAlertMessage, setSuccessAlertMessage] = useState<string>('');

    const redirectUserIfLoggedIn = async () => {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (user) {
            window.location.href = '/'
        }
    }

    redirectUserIfLoggedIn()


    const handleShowErrorAlert = (message: string) => {
        setErrorAlertMessage(message);
        setTimeout(() => setErrorAlertMessage(''), 3000);
    }

    const handleShowSuccessAlert = (message: string) => {
        setSuccessAlertMessage(message);
        setTimeout(() => setSuccessAlertMessage(''), 3000);
    }

    const signup = async (fullName: string, email: string, password: string) => {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fullName: fullName,
                email: email,
                password: password
            }),
        });

        const data = await response.json();

        if (response.ok) {
            handleShowSuccessAlert(data.message);
        } else {
            console.error('Signup Failed: ', data.message);
            handleShowErrorAlert(data.message);
        }
    }


    return (
        <div className="relative w-full h-full flex justify-center items-center">

            <AnimatePresence>
                {errorAlertMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.8 }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30
                        }}
                        className="absolute top-4 right-4 z-50"
                    >
                        <Alert className="bg-red-500 text-white border-none shadow-lg w-fit backdrop-blur-sm">
                            <AlertTitle className="font-semibold flex items-center gap-2">
                                Signup Failed: {errorAlertMessage}
                            </AlertTitle>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {successAlertMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.8 }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30
                        }}
                        className="absolute top-4 right-4 z-50"
                    >
                        <Alert className="bg-green-500 text-white border-none shadow-lg w-fit backdrop-blur-sm">
                            <AlertTitle className="font-semibold flex items-center gap-2">
                                Success: {successAlertMessage}
                            </AlertTitle>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={(event) => {
                event.preventDefault();
                signup(fullName, email, password)
            }} className="bg-white p-10 rounded-lg w-lg flex flex-col items-center gap-3 shadow-lg">
                <div className="max-w-[200px]">
                    <svg className="w-full" data-logo="logo" viewBox="0 0 164 50">
                        <g id="logogram" transform="translate(0, 5) rotate(0) "><path d="M13.7544 6.5C13.7544 4.77609 13.0696 3.12278 11.8506 1.90381C10.6316 0.684818 8.9783 0 7.25439 0C5.53048 0 3.87719 0.684818 2.6582 1.90381C1.43921 3.12278 0.754395 4.77609 0.754395 6.5V26.1553L6.10734 29.9908V39.3346H8.40145V29.9908L13.7544 26.1553V6.5ZM11.4603 17.4926L8.40145 20.5515V17.6838L11.4603 14.625V17.4926ZM3.09631 14.625L6.15513 17.6838V20.5515L3.09631 17.4926V14.625ZM11.4603 11.375L7.25439 15.5809L3.04851 11.2794V8.41177L7.25439 12.6176L11.4603 8.41177V11.375ZM7.25439 2.29412C8.17939 2.2982 9.07754 2.60541 9.81126 3.16867C10.545 3.73192 11.0739 4.52016 11.3169 5.41268L7.25439 9.46323L3.19189 5.41268C3.42601 4.51129 3.95107 3.71235 4.68562 3.13985C5.42016 2.56733 6.32311 2.25324 7.25439 2.24631V2.29412ZM3.04851 24.9963V20.6949L6.10734 23.7537V27.171L3.04851 24.9963ZM8.40145 27.1829V23.7537L11.4603 20.6949V24.9844L8.40145 27.1829Z" fill="#51A2FF" /></g>
                        <g id="logotype" transform="translate(20, 1)"><path fill="#111111" d="M17.06 38.24Q14.37 38.24 12.23 37.37Q10.10 36.49 8.82 34.78Q7.54 33.06 7.47 30.65L7.47 30.65L13.84 30.65Q13.98 32.02 14.79 32.73Q15.59 33.45 16.89 33.45L16.89 33.45Q18.22 33.45 18.98 32.84Q19.76 32.23 19.76 31.14L19.76 31.14Q19.76 30.23 19.14 29.63Q18.53 29.04 17.64 28.66Q16.75 28.27 15.10 27.78L15.10 27.78Q12.72 27.04 11.21 26.31Q9.71 25.57 8.63 24.14Q7.54 22.70 7.54 20.39L7.54 20.39Q7.54 16.96 10.03 15.02Q12.51 13.08 16.50 13.08L16.50 13.08Q20.56 13.08 23.05 15.02Q25.53 16.96 25.71 20.43L25.71 20.43L19.23 20.43Q19.16 19.24 18.36 18.56Q17.55 17.87 16.29 17.87L16.29 17.87Q15.21 17.87 14.54 18.45Q13.88 19.03 13.88 20.11L13.88 20.11Q13.88 21.30 15.00 21.97Q16.12 22.63 18.50 23.41L18.50 23.41Q20.88 24.21 22.36 24.95Q23.85 25.68 24.94 27.08Q26.02 28.48 26.02 30.68L26.02 30.68Q26.02 32.78 24.95 34.50Q23.89 36.22 21.86 37.23Q19.83 38.24 17.06 38.24L17.06 38.24ZM32.71 16.44Q31.13 16.44 30.13 15.51Q29.14 14.58 29.14 13.22L29.14 13.22Q29.14 11.82 30.13 10.89Q31.13 9.96 32.71 9.96L32.71 9.96Q34.25 9.96 35.24 10.89Q36.24 11.82 36.24 13.22L36.24 13.22Q36.24 14.58 35.24 15.51Q34.25 16.44 32.71 16.44L32.71 16.44ZM29.70 18.47L35.68 18.47L35.68 38L29.70 38L29.70 18.47ZM47.44 18.19Q49.51 18.19 51.06 19.03Q52.62 19.87 53.46 21.23L53.46 21.23L53.46 18.47L59.45 18.47L59.45 37.97Q59.45 40.66 58.38 42.85Q57.31 45.04 55.12 46.33Q52.94 47.63 49.68 47.63L49.68 47.63Q45.34 47.63 42.65 45.58Q39.95 43.53 39.57 40.03L39.57 40.03L45.48 40.03Q45.76 41.15 46.81 41.80Q47.86 42.45 49.40 42.45L49.40 42.45Q51.26 42.45 52.36 41.38Q53.46 40.31 53.46 37.97L53.46 37.97L53.46 35.20Q52.59 36.56 51.05 37.42Q49.51 38.28 47.44 38.28L47.44 38.28Q45.03 38.28 43.07 37.04Q41.11 35.80 39.97 33.50Q38.83 31.21 38.83 28.20L38.83 28.20Q38.83 25.19 39.97 22.91Q41.11 20.64 43.07 19.41Q45.03 18.19 47.44 18.19L47.44 18.19ZM53.46 28.23Q53.46 25.99 52.22 24.70Q50.98 23.41 49.19 23.41L49.19 23.41Q47.41 23.41 46.16 24.68Q44.92 25.96 44.92 28.20L44.92 28.20Q44.92 30.44 46.16 31.75Q47.41 33.06 49.19 33.06L49.19 33.06Q50.98 33.06 52.22 31.77Q53.46 30.48 53.46 28.23L53.46 28.23ZM75.69 18.26Q79.12 18.26 81.16 20.48Q83.21 22.70 83.21 26.59L83.21 26.59L83.21 38L77.26 38L77.26 27.39Q77.26 25.43 76.25 24.35Q75.23 23.27 73.52 23.27L73.52 23.27Q71.80 23.27 70.78 24.35Q69.77 25.43 69.77 27.39L69.77 27.39L69.77 38L63.79 38L63.79 18.47L69.77 18.47L69.77 21.06Q70.68 19.76 72.22 19.01Q73.76 18.26 75.69 18.26L75.69 18.26ZM86.05 13.43L105.05 13.43L105.05 18.22L98.54 18.22L98.54 38L92.56 38L92.56 18.22L86.05 18.22L86.05 13.43ZM114.05 21.72Q115.10 20.11 116.67 19.19Q118.25 18.26 120.17 18.26L120.17 18.26L120.17 24.59L118.53 24.59Q116.29 24.59 115.17 25.56Q114.05 26.52 114.05 28.93L114.05 28.93L114.05 38L108.06 38L108.06 18.47L114.05 18.47L114.05 21.72ZM136.52 18.47L142.99 18.47L130.74 47.27L124.30 47.27L128.78 37.34L120.84 18.47L127.52 18.47L132.04 30.68L136.52 18.47Z" /></g>

                    </svg>
                </div>
                <div className="w-full">
                    <Label htmlFor="fullName" className="mb-3">Full Name:</Label>
                    <Input id="fullName" name="fullName" type="text" required value={fullName} onChange={(event) => setFullName(event.target.value)} />
                </div>
                <div className="w-full">
                    <Label htmlFor="email" className="mb-3">Email:</Label>
                    <Input id="email" name="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
                </div>
                <div className="w-full">
                    <Label htmlFor="password" className="mb-3">Password:</Label>
                    <Input id="password" name="password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} />
                </div>
                <div className="w-full flex gap-4 mt-8">
                    <Button className="cursor-pointer flex-1" type="submit">Sign Up</Button>
                </div>
                <Link href="/login" className="underline text-xs">Already have an account? Login</Link>
            </form>
        </div>
    )
}