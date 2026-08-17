import Image from "next/image";

type BrandMarkProps = {
  size?: number;
};

export const BrandMark = ({ size = 36 }: BrandMarkProps) => {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="mascot-colorize overflow-hidden rounded-full">
        <Image
          src="/brand/mascot.png"
          alt=""
          width={size}
          height={size}
          className="mascot-image size-9 object-cover object-[center_12%]"
          priority
        />
      </span>
      <span className="font-display text-xl font-extrabold lowercase tracking-tight text-ink">
        wil
      </span>
    </span>
  );
};
