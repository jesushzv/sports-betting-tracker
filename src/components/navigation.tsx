'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Navigation() {
  const { data: session } = useSession()

  return (
    <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-primary h-8 w-8 rounded"></div>
              <span className="text-xl font-bold">BetTracker</span>
            </Link>

            {session && (
              <div className="hidden items-center space-x-6 md:flex">
                <Link
                  href="/dashboard"
                  className="hover:text-primary text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/picks"
                  className="hover:text-primary text-sm font-medium"
                >
                  All Picks
                </Link>
                <Link
                  href="/parlays"
                  className="hover:text-primary text-sm font-medium"
                >
                  Parlays
                </Link>
                <Link
                  href="/bankroll"
                  className="hover:text-primary text-sm font-medium"
                >
                  Bankroll
                </Link>
                <Link
                  href="/analytics"
                  className="hover:text-primary text-sm font-medium"
                >
                  Analytics
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session.user?.image || ''}
                        alt={session.user?.name || ''}
                      />
                      <AvatarFallback>
                        {session.user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm leading-none font-medium">
                        {session.user?.name}
                      </p>
                      <p className="text-muted-foreground text-xs leading-none">
                        {session.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile & Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => signIn()}>Sign In</Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
