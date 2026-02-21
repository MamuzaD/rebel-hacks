export function BatteryIcon() {
    return (
      <svg
        width="25"
        height="12"
        viewBox="0 0 25 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Battery 50%"
      >
        {/* battery body */}
        <rect
          x="0.5"
          y="0.5"
          width="21"
          height="11"
          rx="2.5"
          stroke="white"
          strokeOpacity="0.35"
        />
        {/* battery cap */}
        <path
          d="M22.5 4V8C23.3284 7.67 24 6.90 24 6C24 5.10 23.3284 4.33 22.5 4Z"
          fill="white"
          fillOpacity="0.4"
        />
        {/* 50% fill */}
        <rect x="2" y="2" width="9" height="8" rx="1.5" fill="white" />
      </svg>
    )
}