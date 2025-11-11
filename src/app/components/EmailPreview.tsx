import React, { FC } from 'react'

import Signature from './Signature'

const EmailPreview: FC<{ html: string }> = ({ html }) => {
    return (
        <div className="w-full h-[550px] bg-white p-4 text-sm text-gray-600 rounded-lg shadow-xl flex flex-col justify-between border-gray-400 border-1">
            Hello John,<br />
            <br />
            I hope you&apos;re doing well! I wanted to reach out because I believe a quick conversation could be valuable. I&apos;d love to discuss how we can help you achieve your goals and explore possible collaboration.<br />
            <Signature html={html} />
        </div>
    )
}

export default EmailPreview