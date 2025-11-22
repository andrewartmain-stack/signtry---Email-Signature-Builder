'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle } from '@/components/ui/alert'

import logo from '../../../../public/logo-full.png';

import { createClient } from '../../utils/supabase/client'
// import { login } from '../actions'

export default function LoginPage() {

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorAlertMessage, setErrorAlertMessage] = useState<string>('');
    const [successAlertMessage, setSuccessAlertMessage] = useState<string>('');
    const [isReset, setIsReset] = useState<boolean>(false);

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

    const login = async (email: string, password: string) => {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            }),
        });

        if (response.ok) {
            window.location.href = '/';
        } else {
            const data = await response.json();
            console.error('Login Failed: ', data.message);
            handleShowErrorAlert(data.message);
        }
    }

    const sendResetPassword = async () => {
        const response = await fetch('/api/send-reset-password-link', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email
            }),
        })

        if (response.ok) {
            const { message } = await response.json();
            handleShowSuccessAlert(message);
        } else {
            const { message } = await response.json();
            handleShowErrorAlert(message);
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
                                Login Failed: {errorAlertMessage}
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
                                {successAlertMessage}
                            </AlertTitle>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-white p-10 rounded-lg w-lg shadow-lg">
                {!isReset ? <form onSubmit={(event) => {
                    event.preventDefault();
                    login(email, password)
                }} className="flex flex-col items-center gap-3 mb-5">
                    <img src={logo.src} width={200} alt="logo" />
                    <div className="w-full">
                        <Label htmlFor="email" className="mb-3">Email:</Label>
                        <Input id="email" name="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
                    </div>
                    <div className="w-full">
                        <Label htmlFor="password" className="mb-3">Password:</Label>
                        <Input id="password" name="password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} />
                    </div>
                    <div className="w-full flex gap-4 mt-8">
                        <Button className="cursor-pointer flex-1" type="submit">Log in</Button>
                    </div>
                </form> : <form onSubmit={(event) => {
                    event.preventDefault();
                    sendResetPassword();
                }} className="flex flex-col items-center gap-3 mb-5">
                    <img src={logo.src} width={200} alt="logo" />
                    <div className="w-full">
                        <Label htmlFor="email" className="mb-3">Email:</Label>
                        <Input id="email" name="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
                    </div>
                    <div className="w-full flex gap-4">
                        <Button className="cursor-pointer flex-1" type="submit">Send Reset Link</Button>
                    </div>
                </form>}
                <div className="text-center flex justify-between">
                    <Link href="/signup" className="underline text-xs">Click here to create new account</Link>
                    <p onClick={() => setIsReset(!isReset)} className="underline text-xs cursor-pointer">{!isReset ? "Forgot Password? Click here to reset" : "Back to login"}</p>
                </div>
            </div>
        </div>
    )
}