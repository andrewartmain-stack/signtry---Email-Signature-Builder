"use client"

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
    Alert,
    AlertTitle,
} from "@/components/ui/alert";
import EmailPreview from "../../components/EmailPreview";
import SignatureBuilderForm from "../../components/SignatureBuilderForm";
import Title from '../../components/Title';
import TemplatesList from "../../components/TemplatesList";
import SignatureBuilderFormSkeleton from '../../components/SignatureBuilderFormSkeleton';
import EmailPreviewSkeleton from '../../components/EmailPreviewSkeleton';
import TemplateCardSkeleton from '../../components/TemplateCardSkeleton';

import { generateSignatureImage, saveSignature } from '../../services/api';

import { renderSignature } from "../../utils/renderSignature";
import { handleConfetti } from '../../utils/confetti';

import { DEMO_USER_DATA } from '../../demoData';

import { FormUserDataInterface, SignatureTemplateInterface } from '../../types';

export default function GenerateSignaturesClient({ demoUserData, templates, badgeTemplates, socialIcons }: { demoUserData: FormUserDataInterface, templates: SignatureTemplateInterface[], badgeTemplates: string[], socialIcons: { name: string, png: string, gif: string }[] }) {

    /*===========STATE============ */
    const [isSignatureChecked, setIsSignatureChecked] = useState(true);
    const [currentHtmlSignature, setCurrentHtmlSignature] = useState('');
    const [formUserData, setFormUserData] = useState<FormUserDataInterface | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [successAlertMessage, setSuccessAlertMessage] = useState("");
    const [errorAlertMessage, setErrorAlertMessage] = useState("");
    const [isSignatureValid, setIsSignatureValid] = useState(false);
    const [currentTemplatesCategory, setCurrentTemplateCategory] = useState("horizontal");

    const saveSignatureButtonRef = useRef<HTMLButtonElement>(null)

    const bucketName = 'images';

    /*=======FUNCTIONS=======*/
    const handleShow = (type: "success" | "error", message: string) => {
        if (type === "success") {
            setSuccessAlertMessage(message);
            setTimeout(() => setSuccessAlertMessage(""), 3000);
            return;
        }

        if (type === "error") {
            setErrorAlertMessage(message);
            setTimeout(() => setErrorAlertMessage(""), 3000);
            return;
        }
    };

    const handleSetFormUserData = (updatedUserData: FormUserDataInterface) => {
        setFormUserData({ ...updatedUserData });
    };

    const handleSetCurrentHtmlSignature = useCallback(
        (html: string) => setCurrentHtmlSignature(html),
        []
    );

    async function handleGenerateSignatureImage(fullName: string): Promise<string> {
        const url = await generateSignatureImage(fullName) as string;
        return url;
    }

    async function handleSaveSignature() {
        if (formUserData) {
            setIsLoading(true);
            const response = await saveSignature(formUserData, currentHtmlSignature, bucketName);

            if (response?.ok) {
                const responseData = await response?.json();
                setIsLoading(false);
                handleShow("success", responseData.message);

                if (saveSignatureButtonRef.current) handleConfetti(saveSignatureButtonRef.current)

            } else {
                const responseData = await response?.json();
                setIsLoading(false);
                handleShow("error", responseData.message);
            }
        }
    }

    useEffect(() => {
        setFormUserData({ ...demoUserData, badgeTemplate: badgeTemplates[0], [`${socialIcons[0].name}IconUrl`]: socialIcons[0].png, [`${socialIcons[1].name}IconUrl`]: socialIcons[1].png, [`${socialIcons[2].name}IconUrl`]: socialIcons[2].png, [`${socialIcons[3].name}IconUrl`]: socialIcons[3].png })
        setCurrentHtmlSignature(templates[0].html);
    }, []);

    useEffect(() => {
        if (formUserData && isSignatureChecked) {
            const fullName = formUserData.firstName + ' ' + formUserData.lastName
            handleGenerateSignatureImage(fullName).then(data => setFormUserData({ ...formUserData, signatureImageUrl: data }));
        }
    }, [formUserData?.firstName, formUserData?.lastName, isSignatureChecked])

    // Animation variants with proper TypeScript types
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    };

    const skeletonContainerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    return (
        <motion.div
            className="p-4 md:p-6 lg:p-8 xl:p-10 flex flex-col w-full gap-8 overflow-y-auto lg:overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Enhanced Alert matching Signatures page */}
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
                        className="fixed top-4 right-4 z-50"
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
                                {successAlertMessage}
                            </AlertTitle>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

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
                        className="fixed top-4 right-4 z-50"
                    >
                        <Alert className="bg-red-500 text-white border-none shadow-lg w-fit min-w-[300px] backdrop-blur-sm">
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
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </motion.svg>
                                {errorAlertMessage}
                            </AlertTitle>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Template Selection */}
            <motion.div
                className="flex flex-col gap-4 items-start"
                variants={itemVariants}
            >
                <Title highlightedText="1. Select" text="Template" tag="h2" />
                <div className="flex items-center gap-3">
                    <Title text="Category:" tag="h5" />
                    <Button size="sm" className={`cursor-pointer ${currentTemplatesCategory === "horizontal" ? "bg-blue-400" : "bg-black"}`} onClick={() => setCurrentTemplateCategory("horizontal")}>
                        Horizontal
                        {currentTemplatesCategory === "horizontal" && (
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </Button>
                    <Button size="sm" className={`cursor-pointer ${currentTemplatesCategory === "vertical" ? "bg-blue-400" : "bg-black"}`} onClick={() => setCurrentTemplateCategory("vertical")}>
                        Vertical
                        {currentTemplatesCategory === "vertical" && (
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </Button>
                </div>
                {(templates.length > 0) ? (
                    <TemplatesList
                        templates={templates}
                        currentTemplatesCategory={currentTemplatesCategory}
                        demoUserData={{
                            ...DEMO_USER_DATA,
                            badgeTemplate: badgeTemplates[0],
                            [`${socialIcons[0].name}IconUrl`]: socialIcons[0].png,
                            [`${socialIcons[1].name}IconUrl`]: socialIcons[1].png,
                            [`${socialIcons[2].name}IconUrl`]: socialIcons[2].png,
                            [`${socialIcons[3].name}IconUrl`]: socialIcons[3].png
                        }}
                        handleSetCurrentHtmlSignature={handleSetCurrentHtmlSignature}
                    />
                ) : (
                    <motion.div
                        className="flex flex-col items-start justify-center gap-5 w-full"
                        variants={skeletonContainerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <TemplateCardSkeleton />
                        <TemplateCardSkeleton />
                        <TemplateCardSkeleton />
                    </motion.div>
                )}
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-4 w-full">
                {/* Signature Adjustment */}
                <motion.div
                    className="flex flex-col gap-4 items-start flex-3/6"
                    variants={itemVariants}
                >
                    <Title highlightedText="2. Adjust" text="Signature" tag="h2" />
                    {(formUserData && badgeTemplates.length > 0) ? (
                        <SignatureBuilderForm
                            formUserData={formUserData}
                            isSignatureChecked={isSignatureChecked}
                            badgeTemplates={badgeTemplates}
                            socialIcons={socialIcons}
                            handleSetFormUserData={handleSetFormUserData}
                            handleGenerateSignatureImage={handleGenerateSignatureImage}
                            setIsSignatureChecked={setIsSignatureChecked}
                            handleShowAlert={handleShow}
                            setIsSignatureValid={setIsSignatureValid}
                        />
                    ) : (
                        <SignatureBuilderFormSkeleton />
                    )}
                </motion.div>

                {/* Preview & Save */}
                <motion.div
                    className="flex flex-col gap-4 items-start flex-3/6"
                    variants={itemVariants}
                >
                    <Title highlightedText="3. Save" text="Signature" tag="h2" />
                    {currentHtmlSignature ? (
                        <EmailPreview html={renderSignature(currentHtmlSignature, { ...formUserData })} />
                    ) : (
                        <EmailPreviewSkeleton />
                    )}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            ref={saveSignatureButtonRef}
                            className={`cursor-pointer transition-all duration-200 ${isLoading ? 'bg-gray-400' : 'bg-primary hover:bg-primary/90'}`}
                            onClick={handleSaveSignature}
                            disabled={isLoading || !isSignatureValid}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                    />
                                    Saving...
                                </span>
                            ) : (
                                "Save Signature"
                            )}
                        </Button>
                    </motion.div>
                </motion.div>
            </div>

        </motion.div>
    )
}