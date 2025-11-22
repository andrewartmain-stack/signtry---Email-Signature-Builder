import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs'
import { Button } from '../../../../components/ui/button'
import { ArrowRight, Mail, Laptop, Smartphone, Copy } from 'lucide-react'
import Link from 'next/link'
import Title from '../../components/Title'

export default async function Guides() {
    const supabase = await createClient()

    const { data: userData, error } = await supabase.auth.getUser()
    if (error || !userData?.user) {
        redirect('/login')
    }

    const { data: profile, error: errorGettingProfile } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single();

    if (errorGettingProfile) {
        console.error(errorGettingProfile.message);
        redirect('/login');
    }

    if (profile.is_subscribed === false) {
        redirect('/subscription-plan');
    }

    // Mock data for guides
    const guides = {
        gmail: {
            title: "Gmail",
            description: "Set up your signature in Gmail web interface",
            steps: [
                "Go to Settings in Gmail",
                "Scroll to the Signature section",
                "Paste your copied signature",
                "Save changes"
            ],
            icon: <Mail className="h-5 w-5" />
        },
        outlook: {
            title: "Outlook",
            description: "Install signature in Outlook desktop and web",
            steps: [
                "Open Outlook and go to Settings",
                "Navigate to Mail > Signature",
                "Paste your signature HTML",
                "Set as default for new messages"
            ],
            icon: <Laptop className="h-5 w-5" />
        },
        apple: {
            title: "Apple Mail",
            description: "Configure signature in Apple Mail app",
            steps: [
                "Open Mail and go to Preferences",
                "Select the Signatures tab",
                "Create new signature and paste your HTML",
                "Assign to your email account"
            ],
            icon: <Smartphone className="h-5 w-5" />
        },
        thunderbird: {
            title: "Thunderbird",
            description: "Set up signature in Thunderbird email client",
            steps: [
                "Open Account Settings",
                "Go to the signature section",
                "Paste your HTML signature",
                "Apply to all outgoing emails"
            ],
            icon: <Mail className="h-5 w-5" />
        }
    }

    return (
        <div className="min-h-screen p-6 md:p-8">
            {/* Simple Header */}
            <div className="mb-8 text-left">
                <Title tag='h2' highlightedText='Setup' text='Guide' />
                <p className="text-gray-600 max-w-2xl">
                    Step-by-step instructions for setting up your email signature across different providers.
                    First, copy your signature from the Signatures tab, then follow the guide for your email provider.
                </p>
            </div>

            {/* Simple Tabs with Guides */}
            <Tabs defaultValue="gmail" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="gmail" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Gmail
                    </TabsTrigger>
                    <TabsTrigger value="outlook" className="flex items-center gap-2">
                        <Laptop className="h-4 w-4" />
                        Outlook
                    </TabsTrigger>
                    <TabsTrigger value="apple" className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Apple Mail
                    </TabsTrigger>
                    <TabsTrigger value="thunderbird" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Thunderbird
                    </TabsTrigger>
                </TabsList>

                {Object.entries(guides).map(([key, guide]) => (
                    <TabsContent key={key} value={key}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {guide.icon}
                                    {guide.title}
                                </CardTitle>
                                <CardDescription>{guide.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ol className="space-y-3">
                                    {guide.steps.map((step, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-800 rounded-full text-sm font-medium mt-0.5">
                                                {index + 1}
                                            </div>
                                            <span className="text-gray-700">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                                <Link href="/signatures">
                                    <Button className="mt-4 cursor-pointer">
                                        Copy Signature
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}