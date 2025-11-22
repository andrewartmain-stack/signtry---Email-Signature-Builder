'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle } from '@/components/ui/alert'

import { createClient } from '../../utils/supabase/client'

import logo from '../../../../public/logo-full.png';

export default function ResetPage() {

    const [password, setPassword] = useState<string>('');
    const [confrimedPassword, setConfrimedPassword] = useState<string>('');
    const [errorAlertMessage, setErrorAlertMessage] = useState<string>('');
    const [successAlertMessage, setSuccessAlertMessage] = useState<string>('');

    // const redirectUserIfLoggedIn = async () => {
    //     const supabase = await createClient();

    //     const {
    //         data: { user },
    //     } = await supabase.auth.getUser();

    //     if (user) {
    //         window.location.href = '/'
    //     }
    // }

    // redirectUserIfLoggedIn();

    const handleShowErrorAlert = (message: string) => {
        setErrorAlertMessage(message);
        setTimeout(() => setErrorAlertMessage(''), 3000);
    }

    const handleShowSuccessAlert = (message: string) => {
        setSuccessAlertMessage(message);
        setTimeout(() => setSuccessAlertMessage(''), 3000);
    }

    const confirmNewPassword = async () => {

        if (password.length < 8) {
            handleShowErrorAlert("Password needs to be 8 characters minimum");
            return;
        }

        if (password !== confrimedPassword) {
            handleShowErrorAlert("Passwords are not the same");
            return;
        }

        const supabase = await createClient();

        const { error } = await supabase.auth.updateUser({ password: password });

        if (error) {
            handleShowErrorAlert(error.message);
            return;
        }

        handleShowSuccessAlert("Password was updated");

        redirect('/');
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
                                Reset Failed: {errorAlertMessage}
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
                confirmNewPassword();
            }} className="bg-white p-10 rounded-lg w-lg flex flex-col items-center gap-3 shadow-lg">
                <img src={logo.src} width={200} alt="logo" />
                <div className="w-full">
                    <Label htmlFor="password" className="mb-3">Password:</Label>
                    <Input id="password" name="password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} />
                </div>
                <div className="w-full">
                    <Label htmlFor="password" className="mb-3">Confirm Password:</Label>
                    <Input id="password" name="password" type="password" required value={confrimedPassword} onChange={(event) => setConfrimedPassword(event.target.value)} />
                </div>
                <div className="w-full flex gap-4">
                    <Button className="cursor-pointer flex-1" type="submit">Confirm Password</Button>
                </div>
                <Link href="/login" className="underline text-xs">Back to login</Link>
            </form>
        </div>
    )
}