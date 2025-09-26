'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { User } from 'lucide-react';

export function AuthButtons() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-gray-900">
          Dashboard
        </Link>
        <Button 
          variant="outline" 
          className="flex items-center space-x-2"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <User className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <Button 
        variant="ghost" 
        asChild
        className={`${pathname === '/auth/signin' ? 'bg-gray-100' : ''}`}
      >
        <Link href="/auth/signin">
          Sign In
        </Link>
      </Button>
      <Button asChild>
        <Link href="/auth/signup">
          Get Started
        </Link>
      </Button>
    </div>
  );
}
