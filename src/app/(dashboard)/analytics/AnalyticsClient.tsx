"use client"

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Title from '../../components/Title';
import { Bar, BarChart, XAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
    MousePointerClick, Target, Link2Icon, Facebook,
    Instagram,
    Linkedin,
    Globe,
    Music,
    Bird,
    MessageCircle,
    Play,
    Mail,
    Github,
    RectangleHorizontalIcon,
    Image,
    Square,
    Circle,
    Phone
} from 'lucide-react';
import Signature from '../../components/Signature';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SavedSignatureDataInterface } from '../../types';


export default function Analytics({ savedSignatures, initialAnalyticsData, initialLinksData }: { savedSignatures: SavedSignatureDataInterface[], initialAnalyticsData: any[], initialLinksData: any[] }) {

    const [sigantures, setSignatures] = useState<SavedSignatureDataInterface[]>(savedSignatures)
    const [currentAnalyticsData, setCurrentAnalyticsData] = useState(initialAnalyticsData);
    const [linksData, setLinksData] = useState(initialLinksData)
    const [selectedSignatureId, setSelectedSignatureId] = useState(savedSignatures.length ? savedSignatures[0].id : "");
    const [currentSignatureMonthlyGoal, setCurrentSignatureMonthlyGoal] = useState<number>(savedSignatures.length ? Number(savedSignatures[0].monthly_goal) : 0);
    const [isEditable, setIsEditable] = useState<boolean>(false);
    const [newGoal, setNewGoal] = useState<null | number>(null);

    const fetchSignatureAnalyticsDetails = async (id: number) => {
        const responseClicks = await fetch(`/api/get-signature-clicks-analytics?id=${id}`, {
            method: "GET",
        });

        const responseLinks = await fetch(`/api/get-signature-links-analytics?id=${id}`, {
            method: "GET",
        });

        if (responseClicks.ok) {
            const { data } = await responseClicks.json();
            setCurrentAnalyticsData(data);
        }

        if (responseLinks.ok) {
            const { data } = await responseLinks.json();
            setLinksData(data);
        }
    }

    const fetchSignatures = async () => {
        const responseFetchSignatures = await fetch('/api/get-saved-signatures', {
            method: "GET",
        });

        if (responseFetchSignatures.ok) {
            const { signatures } = await responseFetchSignatures.json();
            setSignatures(signatures);
        }
    }

    const getClicksThisMonth = () => {
        const clicksThisMonth = currentAnalyticsData.filter(click => {
            const clickDate = new Date(click.clicked_at);
            const now = new Date();

            return (
                clickDate.getUTCFullYear() === now.getUTCFullYear() &&
                clickDate.getUTCMonth() === now.getUTCMonth()
            );
        });

        return clicksThisMonth
    }

    const getClicksLastMonth = () => {
        const clicksLastMonth = currentAnalyticsData.filter(click => {
            const clickDate = new Date(click.clicked_at);
            const now = new Date();

            // Determine last month and year (handle January correctly)
            const lastMonth = now.getUTCMonth() === 0 ? 11 : now.getUTCMonth() - 1;
            const lastMonthYear = now.getUTCMonth() === 0 ? now.getUTCFullYear() - 1 : now.getUTCFullYear();

            return (
                clickDate.getUTCFullYear() === lastMonthYear &&
                clickDate.getUTCMonth() === lastMonth
            );
        });

        return clicksLastMonth;
    };

    const getLast7DaysClicksData = () => {
        const now = new Date();

        return Array.from({ length: 7 }).map((_, i) => {
            // i = 0 → 6 days ago, i = 6 → today
            const date = new Date(now);
            date.setUTCDate(now.getUTCDate() - (6 - i)); // last 7 days

            const label = date.toLocaleDateString("en-US", { weekday: "short" });

            const count = currentAnalyticsData.filter((click) => {
                const clickDate = new Date(click.clicked_at);
                return (
                    clickDate.getUTCFullYear() === date.getUTCFullYear() &&
                    clickDate.getUTCMonth() === date.getUTCMonth() &&
                    clickDate.getUTCDate() === date.getUTCDate()
                );
            }).length;

            return { day: label, clicks: count };
        });
    };

    const getMonthlyClicksData = () => {
        const now = new Date();
        const data = [];

        for (let i = 5; i >= 0; i--) {
            const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
            const monthName = month.toLocaleString('en-US', { month: 'short' });
            const count = currentAnalyticsData.filter(click => {
                const clickDate = new Date(click.clicked_at);
                return (
                    clickDate.getUTCFullYear() === month.getUTCFullYear() &&
                    clickDate.getUTCMonth() === month.getUTCMonth()
                );
            }).length;

            data.push({ month: monthName, clicks: count });
        }

        return data;
    };

    const editMonthlyGoal = async (goal: number) => {
        const responseUpdateGoal = await fetch(`/api/update-signature-monthly-goal?id=${selectedSignatureId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                goal: goal
            })
        });

        if (responseUpdateGoal.ok) {
            const { data } = await responseUpdateGoal.json();
            setCurrentSignatureMonthlyGoal(data);
        }
    }

    const handleUpdateMonthlyGoal = async () => {
        setIsEditable(!isEditable);
        if (isEditable && newGoal && newGoal > 0) {
            await editMonthlyGoal(newGoal);
            await fetchSignatures();
        }
    }

    const getClicksForLink = (linkId: string) => {
        return currentAnalyticsData.filter(click => click.signature_link_id === linkId);
    }

    const getLinkIcon = (linkName: string) => {
        switch (linkName.toLowerCase()) {
            case "email":
                return <Mail color="#ae2fce" className="h-4 w-4" />;
            case "phone":
                return <Phone color="#2fce5f" className="h-4 w-4" />;
            case "github":
                return <Github color="#333333" className="h-4 w-4" />;
            case "tiktok":
                return <Music color="#010101" className="h-4 w-4" />;
            case "facebook":
                return <Facebook color="#1877F2" className="h-4 w-4" />;
            case "instagram":
                return <Instagram color="#E1306C" className="h-4 w-4" />;
            case "x":
            case "twitter":
                return <Bird color="#000000" className="h-4 w-4" />;
            case "linkedin":
                return <Linkedin color="#0A66C2" className="h-4 w-4" />;
            case "website":
                return <Globe color="#6B7280" className="h-4 w-4" />;
            case "whatsapp":
                return <MessageCircle color="#25D366" className="h-4 w-4" />;
            case "youtube":
                return <Play color="#FF0000" className="h-4 w-4" />;
            case "banner":
                return <RectangleHorizontalIcon color="#F59E0B" className="h-4 w-4" />;
            case "photo":
                return <Image color="#10B981" className="h-4 w-4" />; // green photo icon
            case "button_1":
                return <Square color="#6366F1" className="h-4 w-4" />; // purple square as button_1
            case "button_2":
                return <Circle color="#F59E0B" className="h-4 w-4" />; // amber circle as button_2
            default:
                return <Globe color="#9CA3AF" className="h-4 w-4" />; // fallback
        }
    };



    const getDifferenceBetweenLastAndCurrentMonthClicks = (): string => {
        const lastMonthClicks: number = getClicksLastMonth().length;
        const thisMonthClicks: number = getClicksThisMonth().length;

        if (lastMonthClicks === 0 && thisMonthClicks === 0) {
            return "0%";
        }

        if (lastMonthClicks === 0 && thisMonthClicks > 0) {
            return "+100%";
        }

        const difference = ((thisMonthClicks - lastMonthClicks) / lastMonthClicks) * 100;

        const sign = difference > 0 ? "+" : difference < 0 ? "−" : "";
        const formatted = `${sign}${Math.abs(difference).toFixed(1)}%`;

        return formatted;
    };

    const progressValue = Number((currentAnalyticsData.length / currentSignatureMonthlyGoal * 100).toFixed(3));

    const chartConfig = {
        desktop: {
            label: "Desktop",
            color: "#60a5fa",
        }
    } satisfies ChartConfig

    const chartConfig2 = {
        desktop: {
            label: "Desktop",
            color: "#b5d6ff",
        }
    } satisfies ChartConfig

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
    };

    return (
        <div className="relative p-6 md:p-8 flex flex-col w-full gap-8 overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <Title text="Analytics" highlightedText="Signature" tag="h2" />
                    <p className="text-gray-500 mt-1 text-sm">
                        Detailed click report for your selected signature.
                    </p>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex w-full justify-start gap-4 scrollable-x"
            >
                {sigantures.length ? sigantures.map((signature) => (
                    <div
                        key={signature.id}
                        className={`${selectedSignatureId === signature.id ? "bg-blue-100" : "bg-white"} w-40 h-30 rounded-md border-gray-400 border-1 hover:bg-blue-50 transition cursor-pointer p-4`} onClick={() => {
                            setSelectedSignatureId(signature.id);
                            setCurrentSignatureMonthlyGoal(Number(signature.monthly_goal));
                            fetchSignatureAnalyticsDetails(signature.id);
                        }}
                    >
                        <div className="scrollable w-full h-full pr-2">
                            <div className="w-[500px] h-[500px]">
                                <Signature
                                    className="pointer-events-none scale-50 origin-top-left"
                                    html={signature.html}
                                />
                            </div>
                        </div>
                    </div>
                )) : <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-500 text-sm"
                >
                    no signatures created yet
                </motion.p>}
            </motion.div>

            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
                    <motion.div variants={itemVariants}>
                        <div className="flex flex-col gap-4">
                            <Card className="h-full">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Clicks (last month)</CardTitle>
                                    <MousePointerClick className="h-5 w-5 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{getClicksLastMonth().length}</div>
                                </CardContent>
                            </Card>
                            <Card className="h-full">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Clicks (this month)</CardTitle>
                                    <MousePointerClick className="h-5 w-5 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{getClicksThisMonth().length}</div>
                                    <p className="text-xs text-muted-foreground">{getDifferenceBetweenLastAndCurrentMonthClicks()} from last month</p>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Monthly Goal</CardTitle>
                                <Target className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{currentSignatureMonthlyGoal}</div>
                                <p className="text-xs text-muted-foreground">Progress: {progressValue || 0}%</p>
                                <Progress value={progressValue} className="mt-2 h-2 mb-4" />
                                <div className="flex gap-2 items-center">
                                    <Button variant="outline" size="sm" className="cursor-pointer" onClick={handleUpdateMonthlyGoal}>{isEditable ? "save" : "edit goal"}</Button>
                                    {isEditable && <Input type="number" value={newGoal ? newGoal.toString() : ""} onChange={(e) => setNewGoal(Number(e.target.value))} />}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Clicked Links</CardTitle>
                                <Link2Icon className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {linksData.length > 0 ? <ul className="flex flex-col gap-2">{linksData.map(link => <li className="flex items-center justify-between w-full" key={link.id}>
                                    <div className="flex items-center gap-2">
                                        {getLinkIcon(link.link_key)}
                                        <span className="text-xs leading-none">
                                            {link.link_key}
                                        </span>
                                    </div>
                                    <span className="text-xs font-bold leading-none">
                                        {getClicksForLink(link.id).length}
                                    </span>
                                </li>)}</ul> : <p className="text-xs text-muted-foreground">No links inside signature</p>}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Clicks Last 6 month</CardTitle>
                                <MousePointerClick className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={chartConfig} className="max-h-[200px] w-full">
                                    <BarChart accessibilityLayer data={getMonthlyClicksData()}>
                                        <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            tickMargin={10}
                                            axisLine={false}
                                            tickFormatter={(value) => value.slice(0, 3)}
                                        />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="clicks" fill="var(--color-desktop)" radius={4} />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Clicks Last 7 Days</CardTitle>
                                <MousePointerClick className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={chartConfig2} className="max-h-[200px] w-full">
                                    <BarChart accessibilityLayer data={getLast7DaysClicksData()}>
                                        <XAxis
                                            dataKey="day"
                                            tickLine={false}
                                            tickMargin={10}
                                            axisLine={false}
                                            tickFormatter={(value) => value.slice(0, 3)}
                                        />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="clicks" fill="var(--color-desktop)" radius={4} />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>


            </motion.div>
        </div>
    );
}


