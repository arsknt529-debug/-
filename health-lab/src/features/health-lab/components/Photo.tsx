import { photoAlt, photoSrc, type PhotoName } from '../content/photos';

/** シーン写真。装飾として使う場合は decorative を指定する（読み上げない） */
export function Photo({
  name,
  size = 'lg',
  className = '',
  decorative = false,
  priority = false,
}: {
  name: PhotoName;
  size?: 'lg' | 'sm';
  className?: string;
  decorative?: boolean;
  priority?: boolean;
}) {
  return (
    <div className={`hl-photo ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoSrc(name, size)}
        alt={decorative ? '' : photoAlt[name]}
        width={size === 'sm' ? 640 : 1280}
        height={size === 'sm' ? 400 : 800}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
}
