"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const InteractiveMascot = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [isHopping, setIsHopping] = useState(false);
  const hopTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const node = wrapRef.current;
      if (!node) {
        return;
      }

      const rect = node.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = clamp((event.clientX - centerX) / (window.innerWidth * 0.45), -1, 1);
      const y = clamp((event.clientY - centerY) / (window.innerHeight * 0.45), -1, 1);
      setLook({ x, y });
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useEffect(() => {
    return () => {
      if (hopTimerRef.current !== null) {
        window.clearTimeout(hopTimerRef.current);
      }
    };
  }, []);

  const handleActivate = () => {
    setIsHopping(true);
    if (hopTimerRef.current !== null) {
      window.clearTimeout(hopTimerRef.current);
    }
    hopTimerRef.current = window.setTimeout(() => {
      setIsHopping(false);
    }, 520);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleActivate();
    }
  };

  const rotateY = look.x * 16;
  const rotateX = look.y * -10;
  const translateX = look.x * 22;
  const translateY = look.y * 14;

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto flex w-full max-w-md items-end justify-center [perspective:900px] lg:max-w-none lg:justify-end"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-4 rounded-full bg-[radial-gradient(circle,var(--glow-a)_0%,transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-10 bottom-10 top-12 rounded-full bg-accent/20 blur-3xl"
      />
      <button
        type="button"
        aria-label="Say hi to wil"
        onClick={handleActivate}
        onKeyDown={handleKeyDown}
        className="mascot-stage relative z-10 cursor-pointer rounded-[2.5rem] border-0 p-0 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-accent"
      >
        <div
          className={`mascot-track ${isHopping ? "mascot-hop" : ""}`}
          style={{
            transform: `translate3d(${translateX}px, ${translateY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          }}
        >
          <div className="mascot-bob">
            <span className="mascot-colorize">
              <Image
                src="/brand/mascot.png"
                alt=""
                width={720}
                height={720}
                priority
                className="mascot-image w-full max-w-[28rem] select-none lg:max-w-[34rem]"
                draggable={false}
              />
            </span>
          </div>
        </div>
      </button>
    </div>
  );
};
