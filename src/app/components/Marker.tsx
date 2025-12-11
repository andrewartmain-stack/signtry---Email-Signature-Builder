import React, { FC, ReactNode } from 'react'

const Marker: FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <span className="absolute top-[-10px] right-[-5px] bg-[#dee7ff] border-black border-[1px] text-black p-1 rounded-sm text-xs">{children}</span>
    )
}

export default Marker;