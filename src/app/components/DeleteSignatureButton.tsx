import React, { FC } from 'react'
import { Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'

const DeleteSignatureButton: FC<{ isDeleting: boolean, handleDeleteSignature: () => void }> = ({ isDeleting, handleDeleteSignature }) => {
    return (
        <Button
            variant="outline"
            className={`cursor-pointer transition-colors duration-200`}
            size="sm"
            onClick={handleDeleteSignature}
            disabled={isDeleting}
        >
            {isDeleting ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
                <Trash size="16" />
            )}
        </Button>
    )
}

export default DeleteSignatureButton