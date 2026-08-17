import Image from "next/image";

type BrandMarkProps = {
  size?: number;
};

export const BrandMark = ({ size = 36 }: BrandMarkProps) => {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Image
        src="/brand/mascot.png"
        alt=""
        width={size}
        height={size}
        className="size-9 rounded-full object-cover object-[center_12%]"
        priority
      />
      <span className="font-display text-xl font-extrabold lowercase tracking-tight text-white">
        wil
      </span>
    </span>
  );
};
