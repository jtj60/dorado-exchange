'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '../../icons/logo'
import Sidebar from './sidebar'
import { authClient } from '@/lib/authClient'
import { useEffect, useState } from 'react'
import { Menu, ShoppingCart, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProfileMenu from './profileMenu'
import SignUpButton from '../auth/signUpButton'
import SignInButton from '../auth/signInButton'
import { useUserStore } from '@/store/useUserStore'
import { useRouter } from 'next/navigation'

export default function Shell() {
  const pathname = usePathname()
  const router = useRouter();
  const data = useUserStore();
  const [isDrawerActive, setIsDrawerActive] = useState(false)

  const menuItems = [
    {
      key: 1,
      label: 'BUY',
      src: '/buy',
      className: pathname === '/buy' ? 'text-primary' : 'text-muted',
    },
    {
      key: 2,
      label: 'SELL',
      src: '/sell',
      className: pathname === '/sell' ? 'text-primary' : 'text-muted',
    },
    // {
    //   key: 3,
    //   label: 'ACCOUNT',
    //   src: '/account',
    //   className: pathname === '/account' ? 'text-primary' : 'text-muted',
    // },
  ]

  return (
    <>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background mb-3 shadow-md">
        <div className="flex items-center justify-between w-full py-5 p-3 sm:px-20 bg-background">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <Link className="px-0" href={'/'}>
              <Logo />
            </Link>

            {/* Title */}
            <div className="flex items-center">
              <Link href={'/'}>
                <span className="text-lg font-light tracking-wide lg:tracking-widest">
                  Dorado Metals Exchange
                </span>
              </Link>

              {/* Desktop Navbar Links */}
              <div className="hidden lg:flex gap-3 text-sm items-center text-md font-semibold tracking-widest pl-20 gap-10">
                {menuItems.map((item) => (
                  <Link className={item.className} key={item.key} href={item.src}>
                    <p>{item.label}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Menu */}

            <div className="hidden lg:block flex items-center items-end">
              <div className="flex items-center gap-5">
                <Button className="px-0 hover:bg-background" variant="ghost">
                  <ShoppingCart className="text-muted-foreground" />
                </Button>
                {data.user ? <ProfileMenu /> : <SignInButton />}
              </div>
            </div>


          {/* Mobile Sidebar and Menu*/}
          <div className="lg:hidden ml-auto mx-0 px-0 flex items-end gap-3">
          <Button className="px-0 hover:bg-background" variant="ghost">
              <ShoppingCart size={20} className="text-muted-foreground"/>
            </Button>
            
            <Button
              className="px-0 hover:bg-background"
              variant="ghost"
              onClick={() => setIsDrawerActive(true)}
            >
              {!isDrawerActive ? <Menu size={20} className="text-muted-foreground" /> : <X size={20} className="text-muted-foreground" />}
            </Button>
            <Sidebar isDrawerActive={isDrawerActive} setIsDrawerActive={setIsDrawerActive} />
          </div>
        </div>
      </nav>
    </>
  )
}
