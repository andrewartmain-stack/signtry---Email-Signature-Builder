import React, { FC } from 'react'

const MiniWrapper: FC<{ children: React.ReactNode, isChecked: boolean, onClick: () => void }> = ({ children, isChecked, onClick }) => {
    return (
        <div className={`cursor-pointer transition hover:scale-105 ${isChecked ? "bg-blue-50" : "bg-gray-100"} w-6 h-6 rounded-sm flex justify-center items-center p-0.5`} onClick={onClick}>
            {children}
        </div>
    )
}

export default MiniWrapper