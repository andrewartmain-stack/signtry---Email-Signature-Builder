'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

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
import { useToast } from './Toast';

type UserProfile = {
    id: string | null;
    fullName: string | null;
    avatarUrl: string | null;
    email: string | null
};

export function SettingsModal({ userProfile, isOpen, setIsOpen, fetchAuthenticatedUserData }: { userProfile: UserProfile, isOpen: boolean, setIsOpen: React.Dispatch<React.SetStateAction<boolean>>, fetchAuthenticatedUserData: () => void }) {

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const toast = useToast();

    const updateUserData = async (formData: FormData) => {
        const response = await fetch('/api/updateUserData', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json().catch(() => ({}));
        const messages: string[] = Array.isArray(data.message) ? data.message : [data.message].filter(Boolean);

        if (response.ok) {
            toast('success', messages.join(' ') || 'Saved');
        } else {
            toast('error', messages.join(' ') || 'Could not save changes');
        }
    }

    const deleteUserAccount = async () => {
        setIsDeleting(true);
        const response = await fetch(`/api/delete-user?user_id=${userProfile.id}`, {
            method: 'DELETE',
        })

        if (response.ok) {
            window.location.href = '/login';
        } else {
            const data = await response.json().catch(() => ({}));
            toast('error', data.message || 'Could not delete your account');
            setIsDeleting(false);
        }
    }

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget)

        setIsSubmitting(true);
        try {
            await updateUserData(formData);
            fetchAuthenticatedUserData();
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Update your profile and sign-in details.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="profile">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <form onSubmit={onSubmit} className="flex flex-col gap-4 pt-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="fullname">Full name</Label>
                                <Input id="fullname" name="fullname" defaultValue={userProfile.fullName || ''} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="avatar">Avatar</Label>
                                <Input id="avatar" name="avatar" type="file" accept="image/*" className="h-auto py-1.5" />
                            </div>
                            <Button type="submit" className="w-fit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="animate-spin" />} Save changes
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="security">
                        <form onSubmit={onSubmit} className="flex flex-col gap-4 pt-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" defaultValue={userProfile.email || ''} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="password">New password</Label>
                                <Input id="password" name="password" type="password" placeholder="Leave blank to keep the current one" autoComplete="new-password" />
                            </div>
                            <Button type="submit" className="w-fit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="animate-spin" />} Update sign-in details
                            </Button>
                        </form>

                        <form
                            onSubmit={(e) => { e.preventDefault(); deleteUserAccount(); }}
                            className="mt-6 flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/[0.03] p-4"
                        >
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-ink">Delete account</span>
                                <span className="text-[13px] text-muted-foreground">Permanently removes your account and signatures. Type DELETE to confirm.</span>
                            </div>
                            <Input value={deleteConfirmation} onChange={(e) => setDeleteConfirmation(e.target.value)} aria-label="Type DELETE to confirm" placeholder="DELETE" />
                            <Button type="submit" variant="destructive" className="w-fit" disabled={deleteConfirmation !== 'DELETE' || isDeleting}>
                                {isDeleting && <Loader2 className="animate-spin" />} Delete account
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
