"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect if the current device is a mobile device
 * based on screen width.
 *
 * @param breakpoint The breakpoint to consider as mobile (default: 768px)
 * @returns boolean indicating if the device is mobile
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to check if window width is less than the breakpoint
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Check on mount
    checkMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, [breakpoint]);

  return isMobile;
}
