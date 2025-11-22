import React, { FC, ReactNode } from 'react'

const Marker: FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <span className="absolute top-[-10px] right-[-5px] bg-[linear-gradient(135deg,#6fb3ff,#b3d9ff)] text-white p-1 rounded-sm text-xs">{children}</span>
    )
}

export default Marker;