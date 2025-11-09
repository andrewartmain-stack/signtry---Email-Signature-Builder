import React, { FC } from 'react'

const Signature: FC<{ html: string, className?: string }> = ({ html, className }) => {
    return (
        <div
            className={`${className}`}
            dangerouslySetInnerHTML={{
                __html: html
            }}
        />
    )
}

export default Signature