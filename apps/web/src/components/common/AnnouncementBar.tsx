import React, { useState, useEffect } from 'react';
import { Sparkles, Truck, Coins, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const announcements = [
  {
    icon: Sparkles,
    text: 'Vaish&Co. Spring Edit: Enjoy up to 40% off across curated lifestyle finds',
    link: '/products?sale=true',
    linkText: 'Explore deals',
  },
  {
    icon: Truck,
    text: '⚡ Need it right now? Choose Quick Delivery at checkout for delivery in minutes!',
    link: '/products?deliveryMode=QUICK',
    linkText: 'Shop quick delivery',
  },
  {
    icon: Coins,
    text: 'Earn 1 Vaish Coin for every ₹100 spent. Redeem anytime toward your wishlist!',
    link: '/rewards',
    linkText: 'Learn more',
  },
];

export const AnnouncementBar: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = announcements[currentIndex];
  const Icon = current.icon;

  return (
    <div className="bg-brand-pink text-white text-xs sm:text-sm py-2 px-4 transition-all duration-500 ease-in-out">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
        <Icon className="w-4 h-4 shrink-0 animate-bounce" />
        <span className="font-medium">{current.text}</span>
        {current.link && (
          <Link
            to={current.link}
            className="hidden md:inline-flex items-center gap-1 underline underline-offset-2 hover:text-brand-palePink transition-colors font-semibold ml-2"
          >
            <span>{current.linkText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};
