import { redirect } from 'next/navigation'

// Plans live in Billing
export default function Pricing() {
    redirect('/billing')
}
