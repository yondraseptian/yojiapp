import TextLink from '@/components/text-link';
import { Head } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
       <>
      <Head title={title} />
      <div className="min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 lg:justify-center bg-black relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/20"></div>
            <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-white/15"></div>
            <div className="absolute bottom-32 left-20 w-40 h-40 rounded-full bg-white/10"></div>
            <div className="absolute bottom-10 right-10 w-28 h-28 rounded-full bg-white/20"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 text-center">
            <div className="mb-8 flex flex-col items-center">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
                <img src="/iconWhite.png" className="w-12 h-12" alt="" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Yoji Admin</h1>
              <p className="text-xl text-white/90 max-w-md">
                Manage your coffee shop with ease. Track orders, inventory, and analytics all in one place.
              </p>
            </div>

            {/* Coffee Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm text-white/80">Orders Today</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">98%</div>
                <div className="text-sm text-white/80">Customer Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-sm text-white/80">Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <img src="/iconWhite.png" className="w-12 h-12" alt="" />
              </div>
              <h1 className="text-2xl font-bold text-black">YoJi Admin</h1>
            </div>

            {/* Status Message */}
            {status && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm font-medium text-green-800 text-center">{status}</div>
              </div>
            )}

            {/* Login Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-amber-100">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                <p className="text-gray-600">{description}</p>
              </div>

              {children}
              {/* Additional Links */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Need help?{" "}
                  <TextLink href="/support" className="text-black font-medium">
                    Contact Support
                  </TextLink>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-gray-500">
              <p>© 2024 BrewMaster. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </>
    );
}
