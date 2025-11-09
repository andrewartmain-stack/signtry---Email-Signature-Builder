"use client"

import React from 'react'
import { motion } from 'framer-motion'

const TemplateCardSkeleton = () => {
    return (
        <motion.div
            className="w-[250px] bg-white rounded-lg border border-gray-200 shadow-sm p-4 animate-pulse"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Image skeleton */}
            <div className="w-full h-20 bg-gray-200 rounded-md mb-4"></div>

            {/* Title skeleton */}
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>

            {/* Description skeleton */}
            <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="h-3 bg-gray-200 rounded w-4/6"></div>
            </div>

            {/* Button skeleton */}
            <div className="mt-4 h-8 bg-gray-200 rounded w-full"></div>
        </motion.div>
    )
}

export default TemplateCardSkeleton