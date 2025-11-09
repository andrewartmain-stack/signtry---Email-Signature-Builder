import { Skeleton } from "@/components/ui/skeleton"
import { FC } from "react"

const SignatureBuilderFormSkeleton: FC = () => {
    return (
        <Skeleton className="h-[600px] w-full rounded-xl" />
    )
}

export default SignatureBuilderFormSkeleton