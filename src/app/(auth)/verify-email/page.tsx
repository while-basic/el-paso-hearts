'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { EnvelopeIcon } from '@heroicons/react/24/outline'

export default function VerifyEmail() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto text-center"
    >
      <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
        <EnvelopeIcon className="w-8 h-8 text-purple-600" />
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-4">Check your email</h2>
      <p className="text-gray-600 mb-8">
        We&apos;ve sent you a verification link to your email address. Please click the link to verify
        your account.
      </p>

      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Didn&apos;t receive the email? Check your spam folder or{' '}
          <Link href="/signup" className="text-purple-600 hover:text-purple-500">
            try again
          </Link>
        </p>

        <Link
          href="/signin"
          className="inline-block text-sm text-purple-600 hover:text-purple-500"
        >
          Return to sign in
        </Link>
      </div>
    </motion.div>
  )
} 