import { Skeleton } from "@/components/ui/skeleton"
import { FC } from "react"

const EmailPreviewSkeleton: FC = () => {
    return (
        <Skeleton className="h-[550px] w-96 rounded-xl" />
    )
}

export default EmailPreviewSkeleton