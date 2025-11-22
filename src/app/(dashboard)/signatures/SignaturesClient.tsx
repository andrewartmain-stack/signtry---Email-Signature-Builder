"use client"

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react';

import Link from 'next/link';
import { Alert, AlertTitle } from '@/components/ui/alert';
import Title from '../../components/Title';
import Signature from '../../components/Signature';
import CardSkeleton from '../../components/CardSkeleton';
import DeleteSignatureButton from '../../components/DeleteSignatureButton';
import CopySignatureButton from '../../components/CopySignatureButton';
import { Button } from '@/components/ui/button';

import { copySignature } from '../../utils/copySignature';

import { deleteSignature, fetchSignatures } from '../../services/api';

import { SavedSignatureDataInterface } from '../../types';

export default function Signatures({ initialSignatures }: { initialSignatures: SavedSignatureDataInterface[] }) {
    const [signatures, setSignatures] = useState<SavedSignatureDataInterface[]>(initialSignatures);
    const [isLoading, setIsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [showCopyAlert, setShowCopyAlert] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [removingId, setRemovingId] = useState<number | null>(null);

    const handleShowDeleteAlert = () => {
        setShowDeleteAlert(true);
        setTimeout(() => setShowDeleteAlert(false), 3000);
    };

    const handleShowCopyAlert = () => {
        setShowCopyAlert(true);
        setTimeout(() => setShowCopyAlert(false), 3000);
    };

    async function handleFetchSignatures() {
        setIsLoading(true);
        try {
            const signatures = await fetchSignatures();
            setSignatures(signatures);
        } catch (error) {
            console.error('Error fetching signatures:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDeleteSignature(id: number) {
        setDeletingId(id);
        setRemovingId(id);

        // Wait for exit animation to complete before actual deletion
        setTimeout(async () => {
            try {
                await deleteSignature(id);
                await handleFetchSignatures();
                handleShowDeleteAlert();
            } catch (error) {
                console.error('Error deleting signature:', error);
                setRemovingId(null);
            } finally {
                setDeletingId(null);
            }
        }, 300);
    }

    async function handleCopySignature(html: string) {
        try {
            await copySignature(html);
            handleShowCopyAlert();
        } catch (error) {
            console.error('Error copying signature:', error);
        }
    }

    function checkDeletingButton(id: number) {
        return id === deletingId;
    }

    return (
        <div className="relative p-6 md:p-8 flex flex-col w-full gap-6 overflow-y-auto">
            {/* Enhanced Notifications with Better Animations */}
            <AnimatePresence>
                {showDeleteAlert && (
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
                        <Alert className="bg-blue-400 text-white border-none shadow-lg w-fit min-w-[300px] backdrop-blur-sm">
                            <AlertTitle className="font-semibold flex items-center gap-2">
                                <motion.svg
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.1, type: "spring" }}
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </motion.svg>
                                Signature deleted successfully
                            </AlertTitle>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showCopyAlert && (
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
                        <Alert className="bg-green-500 text-white border-none shadow-lg w-fit min-w-[300px] backdrop-blur-sm">
                            <AlertTitle className="font-semibold flex items-center gap-2">
                                <motion.svg
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.1, type: "spring" }}
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </motion.svg>
                                Copied to clipboard!
                            </AlertTitle>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col gap-2">
                <Title text="Signatures" highlightedText="Saved" tag="h2" />
                <p className="text-gray-600 text-sm">
                    {signatures.length} saved signature{signatures.length !== 1 ? 's' : ''}
                </p>
            </div>

            <div className="flex flex-wrap gap-4 w-full justify-start">
                <AnimatePresence>
                    {signatures.length > 0 &&
                        signatures.map((signature) => (
                            <motion.div
                                key={signature.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                transition={{
                                    duration: 0.3,       // smooth and complete
                                    ease: "easeInOut",   // no abrupt spring
                                }}
                                className="relative bg-white w-52 h-36 shadow-md rounded-md border border-gray-200 hover:shadow-lg hover:scale-[1.03] transition-transform duration-200 cursor-pointer p-3"
                            >
                                {/* Buttons stay fixed to card corners */}
                                <div className="absolute flex flex-col gap-2 top-1 right-1 z-10">
                                    <CopySignatureButton
                                        handleCopySignature={() => handleCopySignature(signature.html)}
                                    />
                                    <DeleteSignatureButton
                                        isDeleting={checkDeletingButton(signature.id)}
                                        handleDeleteSignature={() => handleDeleteSignature(signature.id)}
                                    />
                                </div>

                                {/* Scrollable signature content */}
                                <div className="scrollable w-full h-full pr-2">
                                    <div className="w-[500px] h-[500px]">
                                        <Signature
                                            className="pointer-events-none scale-80 origin-top-left"
                                            html={signature.html}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                </AnimatePresence>

                {/* Loading State */}
                {isLoading && Array.from({ length: 10 }).map((_, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <CardSkeleton />
                    </motion.div>
                ))}

                {/* Empty State */}
                {!isLoading && signatures.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="col-span-full flex flex-col items-center justify-center py-16 text-center w-full"
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                            className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6"
                        >
                            <svg
                                className="w-10 h-10 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                />
                            </svg>
                        </motion.div>
                        <motion.h3
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg font-semibold text-gray-900 mb-2"
                        >
                            No signatures yet
                        </motion.h3>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-500 max-w-sm mb-6"
                        >
                            Create your first email signature to get started.
                        </motion.p>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link href="/generateSignature">
                                <Button variant="outline" className="cursor-pointer" size="lg">
                                    Create Signature
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}