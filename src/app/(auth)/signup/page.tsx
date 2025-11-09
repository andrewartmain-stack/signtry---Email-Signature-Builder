'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle } from '@/components/ui/alert'

import { createClient } from '../../utils/supabase/client'

import logo from "../../../../public/logo.svg";

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
                <Image src={logo} alt="logo" width={200} />
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