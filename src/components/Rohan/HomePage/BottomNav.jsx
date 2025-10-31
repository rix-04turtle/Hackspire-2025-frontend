import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, Leaf, MessageCircle, User } from 'lucide-react';

export default function BottomNav() {
  const router = useRouter();
  const currentPath = router.pathname;

  const navItems = [
    {
      href: '/home',
      label: 'Home',
      icon: Home
    },
    {
      href: '/crop-news',
      label: 'News',
      icon: Leaf
    },
    {
      href: '/community',
      label: 'Community',
      icon: MessageCircle
    },
    {
      href: '/marketplace',
      label: 'Marketplace',
      icon: Leaf  
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: User
    }
  ];

  const isActive = (path) => currentPath === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => (
            <div
              key={item.href}
              onClick={() => {
                if (!isActive(item.href)) {
                  router.push(item.href);
                }
              }}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors cursor-pointer ${
                isActive(item.href)
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-green-500 hover:bg-green-50/50'
              }`}
            >
              <item.icon className={`h-6 w-6 ${
                isActive(item.href)
                  ? 'text-green-600'
                  : 'text-gray-500'
              }`} />
              <span className="text-xs mt-1">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}