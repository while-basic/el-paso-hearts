'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-8">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src="/logo.png"
              alt="El Paso Hearts Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
          </motion.div>
          <span className="text-xl font-semibold text-gray-800">El Paso Hearts</span>
        </Link>
        {children}
      </div>

      {/* Right side - Image */}
      <div className="hidden md:block w-1/2 relative">
        <Image
          src="https://images.unsplash.com/photo-1601933513793-1c0f3cbf2107"
          alt="El Paso cityscape"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/50 to-pink-500/50" />
      </div>
    </div>
  )
} 