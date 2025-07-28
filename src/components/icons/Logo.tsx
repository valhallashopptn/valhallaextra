
import Image from 'next/image';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  imageUrl?: string | null;
  altText?: string;
}

export function Logo({ imageUrl, altText, ...props }: LogoProps) {
  if (imageUrl) {
    return <Image src={imageUrl} alt={altText || 'Logo'} width={48} height={48} className="h-12 w-12" />;
  }

  return (
    <svg
      {...props}
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Valhalla Logo</title>
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#f97316"}} />
          <stop offset="100%" style={{stopColor:"#ec4899"}} />
        </linearGradient>
      </defs>
       <path d="M12 2C12 2 13 4 15 6C17 8 18 11 18 14C18 18.4183 14.4183 22 10 22C5.58172 22 2 18.4183 2 14C2 11.5 3.5 8.5 5 6C6.5 3.5 12 2 12 2Z" fill="url(#logoGradient)"/>
        <path d="M12 4C12 4 11 6 9.5 7.5C8 9 7 11.5 7 14C7 16.7614 9.23858 19 12 19C14.7614 19 17 16.7614 17 14C17 12 16 9.5 14.5 7.5C13 5.5 12 4 12 4Z" fill="white" fillOpacity="0.5"/>
    </svg>
  );
}
