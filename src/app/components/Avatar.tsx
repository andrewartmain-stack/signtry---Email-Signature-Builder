import React, { FC } from 'react'

const Avatar: FC<{ src: string }> = ({ src }) => {
    return <div className="rounded-lg w-[40px] h-[40px] overflow-hidden object-cover">
        <img src={src} alt="avatar" className="w-full h-full" />
    </div>
}

export default Avatar