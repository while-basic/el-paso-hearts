import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon, HeartIcon, UserGroupIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import ClientWrapper from '@/components/ClientWrapper'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-b from-pink-500 to-purple-600">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1601933513793-1c0f3cbf2107"
            alt="El Paso cityscape"
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
            El Paso Hearts
          </h1>
          <p className="text-xl sm:text-2xl text-white mb-8 max-w-2xl mx-auto">
            Connect with local singles in El Paso. No subscriptions, just genuine connections.
          </p>
          <ClientWrapper>
            <Link
              href="/signup"
              className="inline-flex items-center px-6 py-3 text-lg font-medium text-purple-600 bg-white rounded-full hover:bg-gray-100 transition-colors"
            >
              Get Started
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </ClientWrapper>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose El Paso Hearts?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="mx-auto w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <HeartIcon className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Local Connections</h3>
              <p className="text-gray-600">
                Meet singles from El Paso who share your interests and values
              </p>
            </div>
            <div className="text-center p-6">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <UserGroupIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">100% Free</h3>
              <p className="text-gray-600">
                No hidden fees or premium features. Everyone gets full access
              </p>
            </div>
            <div className="text-center p-6">
              <div className="mx-auto w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <ShieldCheckIcon className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
              <p className="text-gray-600">
                Verified profiles and strong privacy protection for peace of mind
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-500 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Ready to Find Your Match in El Paso?
          </h2>
          <ClientWrapper>
            <Link
              href="/signup"
              className="inline-flex items-center px-8 py-4 text-lg font-medium text-purple-600 bg-white rounded-full hover:bg-gray-100 transition-colors"
            >
              Join Now - It&apos;s Free!
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </ClientWrapper>
        </div>
      </section>
    </main>
  )
}
