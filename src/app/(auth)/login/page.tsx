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
// import { login } from '../actions'

import logo from "../../../../public/logo.svg";

export default function LoginPage() {

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorAlertMessage, setErrorAlertMessage] = useState<string>('');

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

            <form onSubmit={(event) => {
                event.preventDefault();
                login(email, password)
            }} className="bg-white p-10 rounded-lg w-lg flex flex-col items-center gap-3 shadow-lg">
                <Image src={logo} alt="logo" width={200} />
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
                <Link href="/signup" className="underline text-xs">Click here to create new account</Link>
            </form>
        </div>
    )
}