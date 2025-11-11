"use client"

import React, { FC, useEffect, useState } from 'react'
import { Image as ImageIcon, Info, Share2, PencilRulerIcon } from 'lucide-react'

import { Input } from '@/components/ui/input'
import InputFile from './InputFile'
import CheckboxItem from './CheckboxItem'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import MiniWrapper from './MiniWrapper'

import { normalizeUrl } from '../utils/normalizeUrl'
import { convertImageToBase64 } from '../utils/convertImageToBase64'

import { FormUserDataInterface } from '../types'

import { DEMO_BANNER, DEMO_COMPANY_LOGO_URL } from '../base64Images'

const tabs = ['images', 'information', 'social', 'styles'];

const SignatureBuilderForm: FC<{
    formUserData: FormUserDataInterface;
    isSignatureChecked: boolean;
    badgeTemplates: string[];
    socialIcons: { name: string, png: string, gif: string }[];
    setIsSignatureChecked: (isChecked: boolean) => void;
    handleGenerateSignatureImage: (fullName: string) => Promise<string>;
    handleSetFormUserData: (updatedUserData: FormUserDataInterface) => void;
    handleShowAlert: (type: "success" | "error", message: string) => void;
    setIsSignatureValid: (value: boolean) => void;
}> = ({ formUserData, isSignatureChecked, badgeTemplates, socialIcons, handleSetFormUserData, setIsSignatureChecked, handleShowAlert, setIsSignatureValid }) => {

    const [signatureBuilderFormData, setSignatureBuilderFormData] = useState<FormUserDataInterface>({ ...formUserData });

    const [isCheckboxSignatureChecked, setIsCheckboxSignatureChecked] = useState<boolean>(isSignatureChecked);

    const [isCheckboxBannerChecked, setIsCheckboxBannerChecked] = useState<boolean>(false);

    const [isCheckboxAnimateIconsChecked, setIsCheckboxAnimateIconsChecked] = useState<boolean>(false);

    const [isCheckboxButtonsChecked, setIsCheckboxButtonsChecked] = useState<boolean>(false);

    const [isCheckboxSocialIconsChecked, setIsCheckboxSocialIconsChecked] = useState<boolean>(true);

    const [isCheckboxCompanyLogoChecked, setIsCheckboxCompanyLogoChecked] = useState<boolean>(false);

    const [selectedSocialIcons, setSelectedSocialIcons] = useState<Array<Record<string, string>>>([])

    const [currentTab, setCurrentTab] = useState<string>(tabs[0]);

    useEffect(() => {
        setSignatureBuilderFormData({ ...formUserData });
        if (isCheckboxAnimateIconsChecked) {
            const userSocialIcons = Object.entries(formUserData).filter(([key]) => key.endsWith('IconUrl'));
            const updatedArray = userSocialIcons.map(icon => {
                return {
                    [icon[0]]: icon[1] ? icon[1].slice(0, -3) + 'gif' : ''
                }
            });
            setSelectedSocialIcons(updatedArray);
        } else {
            const userSocialIcons = Object.entries(formUserData).filter(([key]) => key.endsWith('IconUrl'));
            const updatedArray = userSocialIcons.map(icon => {
                return {
                    [icon[0]]: icon[1] ? icon[1].slice(0, -3) + 'png' : ''
                }
            });
            setSelectedSocialIcons(updatedArray);
        }
    }, [formUserData, isCheckboxAnimateIconsChecked]);


    //====ВЫНЕСТИ_ФУНККИЮ_В_УТИЛС=====
    async function handleFileUpload(file: File | null, userDataProperty: "photoUrl" | "bannerUrl" | "companyLogoUrl") {

        if (!file) {
            return;
        }

        // const imageSizeValidator = async (file: File) => {
        //     const image = new Image();
        //     image.src = URL.createObjectURL(file);


        //     const promise = new Promise(resolve => {
        //         image.onload = () => {
        //             if (image.width !== 500 || image.height !== 160) {
        //                 resolve(false);
        //             } else {
        //                 resolve(true);
        //             }
        //         }

        //         image.onerror = () => resolve(false); // important for broken files
        //     });

        //     const result = await promise;

        //     return result;

        // }

        // const isValid = await imageSizeValidator(file);

        // if (!isValid && userDataProperty === "bannerUrl") {
        //     handleShowAlert("error");
        //     return;
        // };

        const formData = new FormData();
        formData.append("file", file);

        const base64String = await convertImageToBase64(formData);

        if (base64String) setSignatureBuilderFormData({ ...signatureBuilderFormData, [userDataProperty]: base64String })
    }

    function renderTab() {
        switch (currentTab) {
            case tabs[0]:
                return <div className="flex flex-col items-start gap-5 w-full">
                    <CheckboxItem id="signature" isChecked={isCheckboxSignatureChecked} onCheckedChange={() => setIsCheckboxSignatureChecked(!isCheckboxSignatureChecked)} text="Signature" />
                    <CheckboxItem id="Banner" isChecked={isCheckboxBannerChecked} onCheckedChange={() => setIsCheckboxBannerChecked(!isCheckboxBannerChecked)} text="Banner" />
                    {isCheckboxBannerChecked && <>
                        <InputFile label="Banner - 500x160px is required (PNG, JPG, JPEG)" userDataProperty="bannerUrl" onFileChange={handleFileUpload} />
                        <div>
                            <img
                                src={signatureBuilderFormData.bannerUrl || DEMO_BANNER}
                                alt="Current"
                                className="w-[200px] rounded-md object-cover flex-1/2"
                            />
                        </div>
                        <Input className="text-black focus-visible:ring-0" placeholder="banner link (optional)" value={signatureBuilderFormData.bannerLink} onChange={(e) => setSignatureBuilderFormData({ ...signatureBuilderFormData, bannerLink: e.target.value })} type="text" />
                    </>}
                    <CheckboxItem id="CompanyLogo" isChecked={isCheckboxCompanyLogoChecked} onCheckedChange={() => setIsCheckboxCompanyLogoChecked(!isCheckboxCompanyLogoChecked)} text="Company Logo" />
                    {isCheckboxCompanyLogoChecked && <>
                        <InputFile label="Company Logo Image (PNG, JPG, JPEG)" userDataProperty="companyLogoUrl" onFileChange={handleFileUpload} />
                        <div>
                            <img
                                src={signatureBuilderFormData.companyLogoUrl || DEMO_COMPANY_LOGO_URL}
                                alt="Current"
                                className="w-[100px] rounded-md object-cover flex-1/2"
                            />
                        </div>
                    </>}
                    <div>
                        <Label htmlFor='badges' className="mb-2">Badges</Label>
                        <div id="badges" className="flex gap-3 w-[300px] flex-wrap">
                            {badgeTemplates.map(badge => <MiniWrapper key={badge} isChecked={badge === signatureBuilderFormData.badgeTemplate} onClick={() => {
                                if (badge === signatureBuilderFormData.badgeTemplate) {
                                    setSignatureBuilderFormData({ ...signatureBuilderFormData, badgeTemplate: '' })
                                } else {
                                    setSignatureBuilderFormData({ ...signatureBuilderFormData, badgeTemplate: badge })
                                }
                            }}>
                                <img src={badge} alt="badge" />
                            </MiniWrapper>
                            )}
                        </div>
                    </div>
                    <InputFile label="Profile Picture - 1:1 aspect ratio is required (PNG, JPG, JPEG)" userDataProperty="photoUrl" onFileChange={handleFileUpload} />
                    <div className="flex gap-5 items-center">
                        <div>
                            <img
                                src={signatureBuilderFormData.photoUrl}
                                alt="Current"
                                className="w-16 h-16 rounded-lg object-cover border flex-1/2"
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="border-radius" className="mb-2">photo size</Label>
                        <div id="border-radius" className="flex flex-wrap gap-1">
                            <Button type="button" variant="outline" size="sm" className={`text-black text-xs  ${signatureBuilderFormData.photoSize === "40" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, photoSize: "40" })}>40px</Button>
                            <Button type="button" variant="outline" size="sm" className={`text-black text-xs  ${signatureBuilderFormData.photoSize === "50" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, photoSize: "50" })}>50px</Button>
                            <Button type="button" variant="outline" size="sm" className={`text-black text-xs  ${signatureBuilderFormData.photoSize === "60" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, photoSize: "60" })}>60px</Button>
                            <Button type="button" variant="outline" size="sm" className={`text-black text-xs  ${signatureBuilderFormData.photoSize === "70" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, photoSize: "70" })}>70px</Button>
                            <Button type="button" variant="outline" size="sm" className={`text-black text-xs  ${signatureBuilderFormData.photoSize === "80" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, photoSize: "80" })}>80px</Button>
                            <Button type="button" variant="outline" size="sm" className={`text-black text-xs  ${signatureBuilderFormData.photoSize === "90" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, photoSize: "90" })}>90px</Button>
                            <Button type="button" variant="outline" size="sm" className={`text-black text-xs  ${signatureBuilderFormData.photoSize === "100" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, photoSize: "100" })}>100px</Button>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="border-radius" className="mb-2">border radius</Label>
                        <div id="border-radius" className="flex flex-wrap gap-1">
                            <Button type="button" variant="outline" size="sm" className={`text-black text-xs ${signatureBuilderFormData.photoBorderRadius === "" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, photoBorderRadius: "" })}>none</Button>
                            <Button type="button" variant="outline" size="sm" className={`text-black text-xs  ${signatureBuilderFormData.photoBorderRadius === "border-radius: 5px !important;" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, photoBorderRadius: "border-radius: 5px !important;" })}>5px</Button>
                            <Button type="button" variant="outline" size="sm" className={`text-black text-xs ${signatureBuilderFormData.photoBorderRadius === "border-radius: 10px !important;" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, photoBorderRadius: "border-radius: 10px !important;" })}>10px</Button>
                            <Button type="button" variant="outline" size="sm" className={`text-black text-xs ${signatureBuilderFormData.photoBorderRadius === "border-radius: 15px !important;" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, photoBorderRadius: "border-radius: 15px !important;" })}>15px</Button>
                            <Button type="button" variant="outline" size="sm" className={`text-black text-xs  ${signatureBuilderFormData.photoBorderRadius === "border-radius: 20px !important;" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, photoBorderRadius: "border-radius: 20px !important;" })}>20px</Button>
                            <Button type="button" variant="outline" size="sm" className={`text-black text-xs ${signatureBuilderFormData.photoBorderRadius === "border-radius: 25px !important;" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, photoBorderRadius: "border-radius: 25px !important;" })}>25px</Button>
                            <Button type="button" variant="outline" size="sm" className={`text-black text-xs ${signatureBuilderFormData.photoBorderRadius === "border-radius: 50% !important;" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, photoBorderRadius: "border-radius: 50% !important;" })}>full</Button>
                        </div>
                    </div>
                    <Input className="text-black focus-visible:ring-0" placeholder="photo link (optional)" value={signatureBuilderFormData.photoLink} onChange={(e) => setSignatureBuilderFormData({ ...signatureBuilderFormData, photoLink: e.target.value })} type="text" />
                    <div className="flex w-full justify-end">
                        <Button type="submit" className="cursor-pointer transition">Update</Button>
                    </div>
                </div>

            case tabs[1]:
                return <div className="flex flex-col items-start gap-5 w-full">
                    <div className="flex items-center gap-5">
                        <div className="flex flex-col gap-4 flex-1/2">
                            <Input className="text-black focus-visible:ring-0" placeholder="first name *" value={signatureBuilderFormData.firstName} onChange={(e) => setSignatureBuilderFormData({ ...signatureBuilderFormData, firstName: e.target.value })} type="text" />
                            <Input className="text-black focus-visible:ring-0" placeholder="last name" value={signatureBuilderFormData.lastName} onChange={(e) => setSignatureBuilderFormData({ ...signatureBuilderFormData, lastName: e.target.value })} type="text" />
                        </div>
                        <div className="flex-1/2">
                            <div className="mb-1">
                                <div className="flex gap-1">
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs ${signatureBuilderFormData.nameFontSize === "10px" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, nameFontSize: "10px" })}>sm</Button>
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs ${signatureBuilderFormData.nameFontSize === "12px" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, nameFontSize: "12px" })}>md</Button>
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs ${signatureBuilderFormData.nameFontSize === "15px" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, nameFontSize: "15px" })}>lg</Button>
                                </div>
                            </div>
                            <div>
                                <div className="flex gap-1">
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs font-extrabold ${signatureBuilderFormData.nameFontStyle === "font-weight: bold;" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, nameFontStyle: "font-weight: bold;" })}>bold</Button>
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs italic ${signatureBuilderFormData.nameFontStyle === "font-style: italic;" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, nameFontStyle: "font-style: italic;" })}>italic</Button>
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs ${signatureBuilderFormData.nameFontStyle === "" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, nameFontStyle: "" })}>normal</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-5">
                        <Input className="text-black focus-visible:ring-0 flex-1/2" placeholder="email" value={signatureBuilderFormData.email} onChange={(e) => setSignatureBuilderFormData({ ...signatureBuilderFormData, email: e.target.value })} type="email" />
                        <div className="flex-1/2">
                            <div className="mb-1">
                                <div className="flex gap-1">
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs ${signatureBuilderFormData.emailFontSize === "10px" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, emailFontSize: "10px" })}>sm</Button>
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs ${signatureBuilderFormData.emailFontSize === "12px" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, emailFontSize: "12px" })}>md</Button>
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs ${signatureBuilderFormData.emailFontSize === "15px" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, emailFontSize: "15px" })}>lg</Button>
                                </div>
                            </div>
                            <div>
                                <div className="flex gap-1">
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs font-extrabold ${signatureBuilderFormData.emailFontStyle === "font-weight: bold;" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, emailFontStyle: "font-weight: bold;" })}>bold</Button>
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs italic ${signatureBuilderFormData.emailFontStyle === "font-style: italic;" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, emailFontStyle: "font-style: italic;" })}>italic</Button>
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs ${signatureBuilderFormData.emailFontStyle === "" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, emailFontStyle: "" })}>normal</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-5">
                        <Input className="text-black focus-visible:ring-0 flex-1/2" placeholder="phone number" value={signatureBuilderFormData.phone} onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9+]/g, "");
                            setSignatureBuilderFormData({ ...signatureBuilderFormData, phone: value });
                        }} type="text" pattern="\+?[0-9]+" inputMode="numeric" />
                        <div className="flex-1/2">
                            <div className="mb-1">
                                <div className="flex gap-1">
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs ${signatureBuilderFormData.phoneFontSize === "10px" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, phoneFontSize: "10px" })}>sm</Button>
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs ${signatureBuilderFormData.phoneFontSize === "12px" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, phoneFontSize: "12px" })}>md</Button>
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs ${signatureBuilderFormData.phoneFontSize === "15px" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, phoneFontSize: "15px" })}>lg</Button>
                                </div>
                            </div>
                            <div>
                                <div className="flex gap-1">
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs font-extrabold ${signatureBuilderFormData.phoneFontStyle === "font-weight: bold;" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, phoneFontStyle: "font-weight: bold;" })}>bold</Button>
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs italic ${signatureBuilderFormData.phoneFontStyle === "font-style: italic;" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, phoneFontStyle: "font-style: italic;" })}>italic</Button>
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs ${signatureBuilderFormData.phoneFontStyle === "" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, phoneFontStyle: "" })}>normal</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-5">
                        <Input className="text-black focus-visible:ring-0 flex-1/2" placeholder="position" value={signatureBuilderFormData.jobTitle} onChange={(e) => setSignatureBuilderFormData({ ...signatureBuilderFormData, jobTitle: e.target.value })} type="text" />
                        <div className="flex-1/2">
                            <div className="mb-1">
                                <div className="flex gap-1">
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs ${signatureBuilderFormData.jobTitleFontSize === "10px" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, jobTitleFontSize: "10px" })}>sm</Button>
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs ${signatureBuilderFormData.jobTitleFontSize === "12px" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, jobTitleFontSize: "12px" })}>md</Button>
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs ${signatureBuilderFormData.jobTitleFontSize === "15px" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, jobTitleFontSize: "15px" })}>lg</Button>
                                </div>
                            </div>
                            <div>
                                <div className="flex gap-1">
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs font-extrabold ${signatureBuilderFormData.jobTitleFontStyle === "font-weight: bold;" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, jobTitleFontStyle: "font-weight: bold;" })}>bold</Button>
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs italic ${signatureBuilderFormData.jobTitleFontStyle === "font-style: italic;" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, jobTitleFontStyle: "font-style: italic;" })}>italic</Button>
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs ${signatureBuilderFormData.jobTitleFontStyle === "" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, jobTitleFontStyle: "" })}>normal</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-5">
                        <Input className="text-black focus-visible:ring-0 flex-1/2" placeholder="company" value={signatureBuilderFormData.company} onChange={(e) => setSignatureBuilderFormData({ ...signatureBuilderFormData, company: e.target.value })} type="text" />
                        <div className="flex-1/2">
                            <div className="mb-1">
                                <div className="flex gap-1">
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs ${signatureBuilderFormData.companyFontSize === "10px" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, companyFontSize: "10px" })}>sm</Button>
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs ${signatureBuilderFormData.companyFontSize === "12px" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, companyFontSize: "12px" })}>md</Button>
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs ${signatureBuilderFormData.companyFontSize === "15px" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, companyFontSize: "15px" })}>lg</Button>
                                </div>
                            </div>
                            <div>
                                <div className="flex gap-1">
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs font-extrabold ${signatureBuilderFormData.companyFontStyle === "font-weight: bold;" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, companyFontStyle: "font-weight: bold;" })}>bold</Button>
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs italic ${signatureBuilderFormData.companyFontStyle === "font-style: italic;" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, companyFontStyle: "font-style: italic;" })}>italic</Button>
                                    <Button type="button" variant="outline" size="sm" className={`text-black text-xs ${signatureBuilderFormData.companyFontStyle === "" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, companyFontStyle: "" })}>normal</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex w-full justify-end">
                        <Button type="submit" className="cursor-pointer transition">Update</Button>
                    </div>
                </div>

            case tabs[2]:
                return <div className="flex flex-col items-start gap-5 w-full">
                    <div>
                        <Label htmlFor="signatureAlignment" className="mb-2">Signature Alignment (This applies only to horizontal layout signatures)</Label>
                        <div id="signatureAlignment" className="flex flex-wrap gap-1">
                            <Button type="button" variant="outline" size="sm" className={`text-black text-xs  ${signatureBuilderFormData.signatureAlignment === "middle" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, signatureAlignment: "middle" })}>middle</Button>
                            <Button type="button" variant="outline" size="sm" className={`text-black text-xs  ${signatureBuilderFormData.signatureAlignment === "top" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, signatureAlignment: "top" })}>top</Button>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="signatureBackgroundColor" className="mb-2">Signature Background Color</Label>
                        <div id="signatureBackgroundColor" className="flex flex-wrap gap-1">
                            <Input type="color" defaultValue={signatureBuilderFormData.signatureBackgroundColor} onChange={(e) => setSignatureBuilderFormData({ ...signatureBuilderFormData, signatureBackgroundColor: e.target.value + " !important" })} />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="signatureBorderRadius" className="mb-2">Signature Border Radius</Label>
                        <div id="signatureBorderRadius" className="flex flex-wrap gap-1">
                            <Button type="button" variant="outline" size="sm" className={`text-black text-xs  ${signatureBuilderFormData.signatureBorderRadius === "5px" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, signatureBorderRadius: "5px" })}>5px</Button>
                            <Button type="button" variant="outline" size="sm" className={`text-black text-xs  ${signatureBuilderFormData.signatureBorderRadius === "10px" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, signatureBorderRadius: "10px" })}>10px</Button>
                            <Button type="button" variant="outline" size="sm" className={`text-black text-xs  ${signatureBuilderFormData.signatureBorderRadius === "15px" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, signatureBorderRadius: "15px" })}>15px</Button>
                            <Button type="button" variant="outline" size="sm" className={`text-black text-xs  ${signatureBuilderFormData.signatureBorderRadius === "20px" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, signatureBorderRadius: "20px" })}>20px</Button>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="signaturePadding" className="mb-2">Signature Padding</Label>
                        <div id="signaturePadding" className="flex flex-wrap gap-1">
                            <Button type="button" variant="outline" size="sm" className={`text-black text-xs  ${signatureBuilderFormData.signaturePadding === "5px" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, signaturePadding: "5px" })}>5px</Button>
                            <Button type="button" variant="outline" size="sm" className={`text-black text-xs  ${signatureBuilderFormData.signaturePadding === "10px" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, signaturePadding: "10px" })}>10px</Button>
                            <Button type="button" variant="outline" size="sm" className={`text-black text-xs  ${signatureBuilderFormData.signaturePadding === "15px" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, signaturePadding: "15px" })}>15px</Button>
                            <Button type="button" variant="outline" size="sm" className={`text-black text-xs  ${signatureBuilderFormData.signaturePadding === "20px" && "bg-blue-50"}`} onClick={() => setSignatureBuilderFormData({ ...signatureBuilderFormData, signaturePadding: "20px" })}>20px</Button>
                        </div>
                    </div>
                    <div className="flex w-full justify-end">
                        <Button type="submit" className="cursor-pointer transition">Update</Button>
                    </div>
                </div>

            case tabs[3]:
                return <div className="flex flex-col items-start gap-5 w-full">
                    <CheckboxItem id="isSocialIconsActive" isChecked={isCheckboxSocialIconsChecked} onCheckedChange={() => setIsCheckboxSocialIconsChecked(!isCheckboxSocialIconsChecked)} text="Add Social Icons" />
                    {isCheckboxSocialIconsChecked && <div>
                        <Label htmlFor='social-icons' className="mb-3">select up to 5 social icons</Label>
                        <div id='social-icons' className="flex flex-wrap gap-3">
                            {socialIcons.map(icon => <MiniWrapper key={icon.png} isChecked={selectedSocialIcons.map(obj => Object.values(obj)[0]).includes(isCheckboxAnimateIconsChecked ? icon.gif : icon.png)} onClick={() => {

                                const currentIconUrl = isCheckboxAnimateIconsChecked ? icon.gif : icon.png;

                                if (selectedSocialIcons.map(obj => Object.values(obj)[0]).includes(isCheckboxAnimateIconsChecked ? icon.gif : icon.png)) {

                                    const filterArray = selectedSocialIcons.filter(item => {
                                        const key = Object.keys(item)[0];
                                        return item[key] !== currentIconUrl
                                    })

                                    setSignatureBuilderFormData({ ...signatureBuilderFormData, [`${icon.name}IconUrl`]: '' });
                                    setSelectedSocialIcons([...filterArray]);

                                    return;
                                }

                                const updatedSelectedSocialIcons = selectedSocialIcons.filter(item => {
                                    const key = Object.keys(item)[0];

                                    return item[key] !== '';
                                })

                                if (updatedSelectedSocialIcons.length < 5) {
                                    setSelectedSocialIcons([...selectedSocialIcons, { [`${icon.name}IconUrl`]: isCheckboxAnimateIconsChecked ? icon.gif : icon.png }]);

                                    setSignatureBuilderFormData({ ...signatureBuilderFormData, [`${icon.name}IconUrl`]: isCheckboxAnimateIconsChecked ? icon.gif : icon.png });
                                }
                            }
                            }>
                                <img src={isCheckboxAnimateIconsChecked ? icon.gif : icon.png} alt="social icon" />
                            </MiniWrapper>)}
                        </div>
                    </div>}
                    {isCheckboxSocialIconsChecked && <div className="flex flex-col items-start gap-5 w-full">
                        <CheckboxItem id="animatedSocialIcons" isChecked={isCheckboxAnimateIconsChecked} onCheckedChange={() => setIsCheckboxAnimateIconsChecked(!isCheckboxAnimateIconsChecked)} text="Animate Social Icons" />
                        {signatureBuilderFormData.instagramIconUrl && <Input className="text-black focus-visible:ring-0" placeholder="instagram url *" value={signatureBuilderFormData.instagramLink} onChange={(e) => setSignatureBuilderFormData({ ...signatureBuilderFormData, instagramLink: e.target.value })} type="text" />}
                        {signatureBuilderFormData.facebookIconUrl && <Input className="text-black focus-visible:ring-0" placeholder="facebook url *" value={signatureBuilderFormData.facebookLink} onChange={(e) => setSignatureBuilderFormData({ ...signatureBuilderFormData, facebookLink: e.target.value })} type="text" />}
                        {signatureBuilderFormData.whatsappIconUrl && <Input className="text-black focus-visible:ring-0" placeholder="whatsapp url *" value={signatureBuilderFormData.whatsappLink} onChange={(e) => setSignatureBuilderFormData({ ...signatureBuilderFormData, whatsappLink: e.target.value })} type="text" />}
                        {signatureBuilderFormData.linkedinIconUrl && <Input className="text-black focus-visible:ring-0" placeholder="linkedin url *" value={signatureBuilderFormData.linkedinLink} onChange={(e) => setSignatureBuilderFormData({ ...signatureBuilderFormData, linkedinLink: e.target.value })} type="text" />}
                        {signatureBuilderFormData.xIconUrl && <Input className="text-black focus-visible:ring-0" placeholder="x (twitter) url *" value={signatureBuilderFormData.xLink} onChange={(e) => setSignatureBuilderFormData({ ...signatureBuilderFormData, xLink: e.target.value })} type="text" />}
                        {signatureBuilderFormData.githubIconUrl && <Input className="text-black focus-visible:ring-0" placeholder="github url *" value={signatureBuilderFormData.githubLink} onChange={(e) => setSignatureBuilderFormData({ ...signatureBuilderFormData, githubLink: e.target.value })} type="text" />}
                        {signatureBuilderFormData.youtubeIconUrl && <Input className="text-black focus-visible:ring-0" placeholder="youtube url *" value={signatureBuilderFormData.youtubeLink} onChange={(e) => setSignatureBuilderFormData({ ...signatureBuilderFormData, youtubeLink: e.target.value })} type="text" />}
                        {signatureBuilderFormData.tiktokIconUrl && <Input className="text-black focus-visible:ring-0" placeholder="tiktok url *" value={signatureBuilderFormData.tiktokLink} onChange={(e) => setSignatureBuilderFormData({ ...signatureBuilderFormData, tiktokLink: e.target.value })} type="text" />}
                        {signatureBuilderFormData.websiteIconUrl && <Input className="text-black focus-visible:ring-0" placeholder="website url *" value={signatureBuilderFormData.websiteLink} onChange={(e) => setSignatureBuilderFormData({ ...signatureBuilderFormData, websiteLink: e.target.value })} type="text" />}
                    </div>}
                    <CheckboxItem id="useCustomButtons" isChecked={isCheckboxButtonsChecked} onCheckedChange={() => setIsCheckboxButtonsChecked(!isCheckboxButtonsChecked)} text="Use Custom Buttons (to activate button provide text for a button, link is required)" />
                    {isCheckboxButtonsChecked && <>
                        <div className="flex w-full gap-3">
                            <Input className="text-black focus-visible:ring-0" placeholder="first button text *" value={signatureBuilderFormData.button1Text} onChange={(e) => setSignatureBuilderFormData({ ...signatureBuilderFormData, button1Text: e.target.value })} type="text" />
                            <Input className="text-black focus-visible:ring-0" placeholder="first button link *" value={signatureBuilderFormData.button1Link} onChange={(e) => setSignatureBuilderFormData({ ...signatureBuilderFormData, button1Link: e.target.value })} type="text" />
                        </div>
                        <div className="flex w-full gap-3">
                            <Input className="text-black focus-visible:ring-0" placeholder="second button text *" value={signatureBuilderFormData.button2Text} onChange={(e) => setSignatureBuilderFormData({ ...signatureBuilderFormData, button2Text: e.target.value })} type="text" />
                            <Input className="text-black focus-visible:ring-0" placeholder="second button link *" value={signatureBuilderFormData.button2Link} onChange={(e) => setSignatureBuilderFormData({ ...signatureBuilderFormData, button2Link: e.target.value })} type="text" />
                        </div>
                    </>}
                    <div className="flex w-full justify-end">
                        <Button type="submit" className="cursor-pointer transition">Update</Button>
                    </div>
                </div>
        }
    }

    return (
        <div className="bg-white px-4 pb-4 text-sm text-gray-400 rounded-lg shadow-xl w-full h-[600px] border-gray-400 border-1 scrollable relative">
            <nav className="mb-5 sticky top-0 left-0 bg-white w-full py-2">
                <ul className="flex justify-around">
                    <li className={`text-md text-black flex items-center gap-1 p-4 ${currentTab === tabs[0] ? "bg-blue-50" : ''} rounded-md cursor-pointer transition-all hover:scale-105`} onClick={() => setCurrentTab(tabs[0])}>
                        <ImageIcon size="20" color="#000" /> images
                    </li>
                    <li className={`text-md text-black flex items-center gap-1 p-4 ${currentTab === tabs[1] ? "bg-blue-50" : ''} rounded-md cursor-pointer transition-all hover:scale-105`} onClick={() => setCurrentTab(tabs[1])}>
                        <Info size="20" color="#000" /> information
                    </li>
                    <li className={`text-md text-black flex items-center gap-1 p-4 ${currentTab === tabs[2] ? "bg-blue-50" : ''} rounded-md cursor-pointer transition-all hover:scale-105`} onClick={() => setCurrentTab(tabs[2])}>
                        <PencilRulerIcon size="20" color="#000" /> styles
                    </li>
                    <li className={`text-md text-black flex items-center gap-1 p-4 ${currentTab === tabs[3] ? "bg-blue-50" : ''} rounded-md cursor-pointer transition-all hover:scale-105`} onClick={() => setCurrentTab(tabs[3])}>
                        <Share2 size="20" color="#000" /> social
                    </li>
                </ul>
            </nav>
            <form className="flex justify-start gap-5 w-full p-4" onSubmit={(e) => {
                e.preventDefault();

                setIsSignatureChecked(isCheckboxSignatureChecked);

                let updatedForm = { ...signatureBuilderFormData };

                if (!isCheckboxBannerChecked) {
                    updatedForm = { ...updatedForm, bannerUrl: '' }
                }

                if (isCheckboxCompanyLogoChecked && signatureBuilderFormData.companyLogoUrl === '') {
                    updatedForm = { ...updatedForm, companyLogoUrl: DEMO_COMPANY_LOGO_URL }
                }

                if (isCheckboxCompanyLogoChecked && signatureBuilderFormData.companyLogoUrl !== '') {
                    updatedForm = { ...updatedForm, companyLogoUrl: signatureBuilderFormData.companyLogoUrl }
                }

                if (isCheckboxBannerChecked && signatureBuilderFormData.bannerUrl === '') {
                    updatedForm = { ...updatedForm, bannerUrl: DEMO_BANNER }
                }

                if (isCheckboxBannerChecked && signatureBuilderFormData.bannerUrl !== '') {
                    updatedForm = { ...updatedForm, bannerUrl: signatureBuilderFormData.bannerUrl }
                }

                selectedSocialIcons.forEach(item => {
                    const key = Object.keys(item)[0];
                    updatedForm = { ...updatedForm, [key]: item[key] }
                })

                updatedForm = { ...updatedForm, buttons: isCheckboxButtonsChecked ? '1' : '' };

                updatedForm = { ...updatedForm, isSocialIconsActive: isCheckboxSocialIconsChecked ? "1" : '' }

                updatedForm = { ...updatedForm, companyLogo: isCheckboxCompanyLogoChecked ? "1" : '' }

                const filteredSocialIconsLinks: string[] = [];

                selectedSocialIcons.forEach(icon => {
                    Object.entries(icon).forEach(([key, value]) => value !== "" && filteredSocialIconsLinks.push(key));
                })

                const newKeys = filteredSocialIconsLinks.map(key =>
                    key.replace(/IconUrl$/, "Link")
                );

                const updatedLinks = newKeys.reduce((acc, key) => {
                    acc[key] = normalizeUrl(signatureBuilderFormData[key as keyof FormUserDataInterface] as string);
                    return acc;
                }, {} as Record<string, string>)

                console.log(updatedLinks);

                if (isCheckboxSocialIconsChecked && Object.values(updatedLinks).some(link => link.trim() === "")) {
                    handleShowAlert("error", "Missing Urls for social icons");
                    setIsSignatureValid(false);
                    return;
                }

                if (isCheckboxButtonsChecked && signatureBuilderFormData.button1Text && !signatureBuilderFormData.button1Link) {
                    handleShowAlert("error", "Missing Link for first button");
                    setIsSignatureValid(false);
                    return;
                }

                if (isCheckboxButtonsChecked && signatureBuilderFormData.button2Text && !signatureBuilderFormData.button2Link) {
                    handleShowAlert("error", "Missing Link for second button");
                    setIsSignatureValid(false);
                    return;
                }

                if (signatureBuilderFormData.firstName === "") {
                    handleShowAlert("error", "Missing First Name");
                    setIsSignatureValid(false);
                    return;
                }



                handleSetFormUserData({
                    ...updatedForm,
                    ...updatedLinks,
                    bannerLink: normalizeUrl(signatureBuilderFormData.bannerLink),
                    photoLink: normalizeUrl(signatureBuilderFormData.photoLink),
                    signatureImageUrl: isCheckboxSignatureChecked ? signatureBuilderFormData.signatureImageUrl : '',
                });

                setIsSignatureValid(true);
            }}>
                {renderTab()}
            </form>
        </div>
    )
}

export default React.memo(SignatureBuilderForm);


