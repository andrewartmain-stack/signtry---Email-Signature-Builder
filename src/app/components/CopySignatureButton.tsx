import React, { FC } from 'react'
import { Copy } from "lucide-react"
import { Button } from '@/components/ui/button'

const CopySignatureButton: FC<{ handleCopySignature: () => void }> = ({ handleCopySignature }) => {
    return (
        <Button
            variant="outline"
            className="text-blue-400 cursor-pointer transition-colors duration-200"
            size="sm"
            onClick={handleCopySignature}
        >
            <Copy size="16" />
        </Button>
    )
}

export default CopySignatureButton