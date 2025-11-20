"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";

interface BannerData {
  isEnabled: boolean;
  goalAmount: number;
  currentAmount: number;
}

export default function TopBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [bannerData, setBannerData] = useState<BannerData | null>(null);

  useEffect(() => {
    // Check if banner was previously closed and if 5 days have passed
    const bannerClosedTime = localStorage.getItem("topBannerClosedTime");
    if (bannerClosedTime) {
      const closedDate = new Date(bannerClosedTime);
      const now = new Date();
      const daysSinceClosed = (now.getTime() - closedDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceClosed < 5) {
        setIsVisible(false);
      } else {
        // 5 days have passed, remove the old timestamp so banner shows again
        localStorage.removeItem("topBannerClosedTime");
      }
    }
    setIsMounted(true);

    // Fetch banner data from Sanity
    async function fetchBannerData() {
      const query = `*[_type == "banner"][0]{
        isEnabled,
        goalAmount,
        currentAmount
      }`;
      const data = await client.fetch<BannerData>(query);
      setBannerData(data);
    }
    fetchBannerData();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Store current timestamp instead of just "true"
    localStorage.setItem("topBannerClosedTime", new Date().toISOString());
    // Dispatch custom event to notify navbar
    window.dispatchEvent(new Event("bannerClosed"));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!isMounted || !isVisible) {
    return null;
  }

  // Don't render if banner data hasn't loaded yet or if banner is disabled
  if (!bannerData || !bannerData.isEnabled) {
    return null;
  }

  const progressPercent =
    (bannerData.currentAmount / bannerData.goalAmount) * 100;

  return (
    <div className="hidden lg:block fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-blue-700 to-blue-600 text-white py-2.5 px-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 flex-wrap text-sm relative">
        <span className="font-semibold">
          Help us reach our goal: {formatCurrency(bannerData.currentAmount)} of{" "}
          {formatCurrency(bannerData.goalAmount)} raised
        </span>
        <div className="flex items-center gap-3">
          <div className="w-32 h-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="font-bold">{progressPercent.toFixed(0)}%</span>
          <button
            type="button"
            onClick={handleClose}
            className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Close banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
