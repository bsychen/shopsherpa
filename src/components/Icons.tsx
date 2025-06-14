import { colours } from "@/styles/colours";

interface StarIconProps {
  size?: number;
  className?: string;
  stroke?: string;
}

export default function StarIcon({ size = 16, className = "", stroke = colours.status.warning.background }: StarIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth="1.5" 
      stroke={stroke} 
      className={className}
      width={size}
      height={size}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" 
      />
    </svg>
  );
}

export function XMark() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke-width="1.5" 
      stroke="currentColor" 
      className="size-6"
    >
      <path 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        d="M6 18 18 6M6 6l12 12" 
      />
    </svg>
  );
}

export function Plus() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
