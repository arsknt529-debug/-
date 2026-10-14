import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const stroke = (size: number, props: SVGProps<SVGSVGElement>) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
  ...props,
});

/** XCOUNT ロゴマーク（4色） */
export function LogoMark({ size = 28, title }: { size?: number; title?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 470 480"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <polygon points="4,12 210,140 218,228 122,222" fill="#306CB2" />
      <polygon points="466,12 260,140 252,228 348,222" fill="#43964E" />
      <polygon points="122,258 218,250 212,345 4,468" fill="#C74D88" />
      <polygon points="348,258 252,250 258,345 466,468" fill="#211916" />
    </svg>
  );
}

export const BackIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...stroke(size, p)}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

export const ChevronIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...stroke(size, p)}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export const CheckIcon = ({ size = 14, ...p }: IconProps) => (
  <svg {...stroke(size, { strokeWidth: 3, ...p })}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export const GiftIcon = ({ size = 16, ...p }: IconProps) => (
  <svg {...stroke(size, p)}>
    <rect x="4" y="9" width="16" height="11" rx="1.5" />
    <path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1.5S10 9 12 9zM12 9c2-4 6-4 6-1.5S14 9 12 9z" />
  </svg>
);

export const AlertIcon = ({ size = 20, ...p }: IconProps) => (
  <svg {...stroke(size, p)}>
    <path d="M12 3.5L2.5 20h19z" />
    <path d="M12 10v4.5M12 17.5v.5" />
  </svg>
);

export const InfoIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...stroke(size, p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16.5v.5" />
  </svg>
);

export const PhoneIcon = ({ size = 22, ...p }: IconProps) => (
  <svg {...stroke(size, p)}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
  </svg>
);

export const HeartIcon = ({ size = 16, ...p }: IconProps) => (
  <svg {...stroke(size, { strokeWidth: 2, ...p })}>
    <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" />
  </svg>
);

export const PostureIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...stroke(size, p)}>
    <circle cx="12" cy="4.5" r="2" />
    <path d="M12 7v8M8 10h8M12 15l-3 6M12 15l3 6" />
  </svg>
);

export const CheckupIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...stroke(size, p)}>
    <rect x="5" y="3.5" width="14" height="17" rx="2" />
    <path d="M9 3.5h6V6H9zM8.5 11h7M8.5 14.5h7M8.5 18h4" />
  </svg>
);

export const LetterIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...stroke(size, p)}>
    <rect x="3.5" y="6" width="17" height="12" rx="2" />
    <path d="M4 7l8 6 8-6" />
  </svg>
);

export const SproutIcon = ({ size = 24, ...p }: IconProps) => (
  <svg {...stroke(size, p)}>
    <path d="M12 20V10M12 10c0-4 3-6 7-6 0 4-3 6-7 6zM12 13c0-3-2.5-5-6-5 0 3 2.5 5 6 5z" />
  </svg>
);
