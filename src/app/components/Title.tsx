import React, { FC } from 'react'

const Title: FC<{ highlightedText?: string, text: string, tag: "h2" | "h3" | "h4" | "h5" }> = ({ highlightedText, text, tag }) => {

    switch (tag) {
        case "h2":
            return <h2 className="text-xl font-extrabold"><span>{highlightedText}</span> {text}</h2>
        case "h3":
            return <h3 className="text-lg font-extrabold"><span>{highlightedText}</span> {text}</h3>
        case "h4":
            return <h4 className="text-md font-extrabold"><span>{highlightedText}</span> {text}</h4>
        case "h5":
            return <h5 className="text-sm font-extrabold"><span>{highlightedText}</span> {text}</h5>
    }
}

export default React.memo(Title);