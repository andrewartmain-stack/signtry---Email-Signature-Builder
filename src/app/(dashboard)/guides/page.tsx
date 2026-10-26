import Link from 'next/link'
import { ArrowRight, Copy, MailCheck, Settings2 } from 'lucide-react'

import { requireSubscribedSession } from '../../utils/supabase/session'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs'
import { Button } from '../../../../components/ui/button'
import PageHeader from '../../components/PageHeader'

interface Guide {
    id: string;
    name: string;
    platform: string;
    steps: string[];
    tip?: string;
}

const COPY_STEP = 'In SignTry, open My signatures and click Copy on your signature.';

const guides: Guide[] = [
    {
        id: 'gmail',
        name: 'Gmail',
        platform: 'Web',
        steps: [
            COPY_STEP,
            'In Gmail, click the gear icon in the top right, then See all settings.',
            'On the General tab, scroll to Signature and click Create new. Give it a name.',
            'Click into the signature box and paste (Ctrl+V on Windows, Cmd+V on Mac).',
            'Under Signature defaults, pick it for new emails and for replies and forwards.',
            'Scroll to the bottom of the page and click Save Changes.',
        ],
        tip: 'Gmail accepts signatures up to 10,000 characters. Signatures made in SignTry stay under that limit.',
    },
    {
        id: 'outlook',
        name: 'Outlook',
        platform: 'New Outlook and web',
        steps: [
            COPY_STEP,
            'Open Settings (gear icon), then Account and Signatures.',
            'Click New signature and give it a name.',
            'Paste into the editor.',
            'Choose it as the default for new messages and for replies and forwards.',
            'Click Save.',
        ],
    },
    {
        id: 'outlook-classic',
        name: 'Outlook classic',
        platform: 'Windows desktop',
        steps: [
            COPY_STEP,
            'In Outlook, go to File, Options, Mail, then click Signatures.',
            'Click New, type a name and click OK.',
            'Paste into the Edit signature box.',
            'On the right, choose it for New messages and Replies/forwards.',
            'Click OK.',
        ],
        tip: 'Copy from Chrome or Edge for the best result. Animated icons show only their first frame in this version of Outlook.',
    },
    {
        id: 'apple',
        name: 'Apple Mail',
        platform: 'Mac',
        steps: [
            COPY_STEP,
            'In Mail, open Mail, Settings (Preferences on older macOS), then Signatures.',
            'Select your account in the left column and click +.',
            'Uncheck "Always match my default message font", otherwise Mail replaces your fonts.',
            'Select the placeholder text in the right pane and paste over it.',
            'Pick the new signature in the Choose Signature menu and close the window.',
        ],
        tip: 'Images can look missing in the settings window. They appear when you write a new email.',
    },
    {
        id: 'iphone',
        name: 'iPhone & iPad',
        platform: 'Mail app',
        steps: [
            'Open SignTry in Safari on your iPhone, go to My signatures and tap Copy.',
            'Open Settings, then Apps, Mail, Signature (on older iOS: Settings, Mail, Signature).',
            'Delete the existing text and paste.',
            'If the formatting disappears, shake your iPhone and tap Undo to restore it.',
        ],
        tip: 'Send yourself a test email afterwards; iOS sometimes simplifies pasted signatures.',
    },
    {
        id: 'yahoo',
        name: 'Yahoo Mail',
        platform: 'Web',
        steps: [
            COPY_STEP,
            'In Yahoo Mail, click the gear icon, then More Settings.',
            'Open Writing email.',
            'Under Signature, turn on the switch next to your email address.',
            'Paste into the signature box.',
            'Go back to your inbox. Yahoo saves the signature automatically.',
        ],
    },
    {
        id: 'thunderbird',
        name: 'Thunderbird',
        platform: 'Desktop',
        steps: [
            'In SignTry, open My signatures and click the code icon to copy the HTML code.',
            'In Thunderbird, open Account Settings (from the menu or the Tools menu).',
            'Select your email address.',
            'Check "Use HTML" next to the Signature text box.',
            'Paste the code into the Signature text box.',
        ],
        tip: 'Thunderbird needs the HTML code, not the formatted signature, which is why it uses the code button.',
    },
]

const overview = [
    { icon: Copy, title: 'Copy', text: 'Click Copy on a saved signature.' },
    { icon: Settings2, title: 'Paste', text: 'Paste it into your email app’s signature settings.' },
    { icon: MailCheck, title: 'Test', text: 'Send yourself an email to check it.' },
]

export default async function Guides() {
    await requireSubscribedSession()

    return (
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 py-6 md:px-8 md:py-10">
            <PageHeader
                tag="Install"
                title="Add your signature to your email"
                description="It takes about two minutes. Pick your email app below and follow the steps."
                actions={
                    <Button asChild>
                        <Link href="/signatures">Go to my signatures <ArrowRight /></Link>
                    </Button>
                }
            />

            <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {overview.map((item, index) => (
                    <li key={item.title} className="flex items-start gap-4 rounded-2xl bg-stage-booking p-5">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/80">
                            <item.icon className="size-5 text-ink" />
                        </span>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold text-ink">{index + 1}. {item.title}</span>
                            <span className="text-[13px] text-ink/80">{item.text}</span>
                        </div>
                    </li>
                ))}
            </ol>

            <Tabs defaultValue="gmail" orientation="vertical" className="flex flex-col gap-4 md:flex-row md:gap-6">
                <TabsList className="scrollable-x h-auto w-full justify-start gap-1 rounded-2xl border border-line bg-card p-1.5 md:w-60 md:flex-col md:items-stretch">
                    {guides.map(guide => (
                        <TabsTrigger
                            key={guide.id}
                            value={guide.id}
                            className="h-auto flex-none flex-col items-start gap-0 rounded-xl px-3.5 py-2.5 text-left data-[state=active]:bg-ink data-[state=active]:text-white data-[state=active]:shadow-none md:w-full"
                        >
                            <span className="text-sm font-medium">{guide.name}</span>
                            <span className="text-xs font-normal opacity-70">{guide.platform}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>

                {guides.map(guide => (
                    <TabsContent key={guide.id} value={guide.id} className="mt-0 flex flex-col gap-6 rounded-2xl border border-line bg-card p-6 md:p-8">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl text-ink">{guide.name}</h2>
                            <span className="text-sm text-muted-foreground">{guide.platform}</span>
                        </div>
                        <ol className="flex flex-col gap-4">
                            {guide.steps.map((step, index) => (
                                <li key={index} className="flex items-start gap-4">
                                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-cream text-[13px] font-semibold text-ink">
                                        {index + 1}
                                    </span>
                                    <span className="pt-0.5 text-[15px] text-ink">{step}</span>
                                </li>
                            ))}
                        </ol>
                        {guide.tip && (
                            <p className="rounded-xl bg-soft p-4 text-sm text-muted-foreground ring-1 ring-line">
                                <span className="font-medium text-ink">Tip: </span>{guide.tip}
                            </p>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}
