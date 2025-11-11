'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { AnimatePresence, motion } from 'motion/react';
import CheckboxItem from './CheckboxItem';

type UserProfile = {
    id: string | null;
    fullName: string | null;
    avatarUrl: string | null;
    email: string | null
};

export function SettingsModal({ userProfile, isOpen, setIsOpen, fetchAuthenticatedUserData }: { userProfile: UserProfile, isOpen: boolean, setIsOpen: React.Dispatch<React.SetStateAction<boolean>>, fetchAuthenticatedUserData: () => void }) {

    const [errorAlertMessage, setErrorAlertMessage] = useState<string>('');
    const [successAlertMessages, setSuccessAlertMessages] = useState<string[]>([]);
    const [isDeleteConfirmed, setIsDeleteConfirmed] = useState<boolean>(false);

    const handleShowErrorAlert = (message: string) => {
        setErrorAlertMessage(message);
        setTimeout(() => setErrorAlertMessage(''), 3000);
    }

    const handleShowSuccessAlerts = (messages: string[] | string) => {
        if (typeof messages === 'string') {
            setSuccessAlertMessages([messages]);
        } else {
            setSuccessAlertMessages(messages);
        }

        setTimeout(() => setSuccessAlertMessages([]), 4000);
    };

    const updateUserData = async (formData: FormData) => {
        const response = await fetch('/api/updateUserData', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();


        if (response.ok) {
            handleShowSuccessAlerts(data.message);
        } else {
            handleShowErrorAlert(data.message);
            console.error('Signup Failed: ', data.message);
        }
    }

    const deleteUserAccount = async () => {
        const response = await fetch(`api/delete-user?user_id=${userProfile.id}`, {
            method: 'DELETE',
        })

        if (response.ok) {
            window.location.href = '/login';
        } else {
            const data = await response.json()
            console.error(data.message)
        }
    }

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget)

        await updateUserData(formData);

        fetchAuthenticatedUserData();
    }

    const onSubmitDelete = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        await deleteUserAccount();
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                        className="absolute top-4 right-4 z-100"
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
                {successAlertMessages.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.8 }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30
                        }}
                        className="absolute top-4 right-4 z-100 flex gap-3"
                    >
                        {successAlertMessages.map((msg, idx) => (
                            <Alert key={idx} className="bg-green-500 text-white border-none shadow-lg w-fit backdrop-blur-sm">
                                <AlertTitle className="font-semibold flex items-center gap-2">
                                    Success: {msg}
                                </AlertTitle>
                            </Alert>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="profile">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <form onSubmit={onSubmit} className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="fullname" className="mb-2">Full Name</Label>
                                <Input id="fullname" name="fullname" defaultValue={userProfile.fullName || ''} />
                            </div>
                            <div>
                                <Label htmlFor="avatar" className="mb-2">Avatar</Label>
                                <Input id="avatar" name="avatar" type="file" />
                                <p className="text-xs text-gray-500 mt-1">Upload a new image file.</p>
                            </div>
                            <Button type="submit" className="cursor-pointer">Save changes</Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="security">
                        <form onSubmit={onSubmit} className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="email" className="mb-2">Email</Label>
                                <Input id="email" name="email" type="email" defaultValue={userProfile.email || ''} />
                            </div>
                            <div>
                                <Label htmlFor="password" className="mb-2">New Password</Label>
                                <Input id="password" name="password" type="password" placeholder="Leave blank to keep the same" />
                            </div>
                            <Button type="submit" className="cursor-pointer">Update Credentials</Button>
                        </form>
                        <form onSubmit={onSubmitDelete} className="space-y-4 py-4">
                            <Label htmlFor="delete" className="mb-2">---Danger Zone---</Label>
                            <CheckboxItem id="delete" isChecked={isDeleteConfirmed} onCheckedChange={() => setIsDeleteConfirmed(!isDeleteConfirmed)} text="Delete Confirmation" />
                            <Button type="submit" disabled={!isDeleteConfirmed} variant="outline" className="cursor-pointer bg-red-100 border-red-400 hover:bg-red-200">Delete Account</Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}