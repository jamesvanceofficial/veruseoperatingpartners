import { Fragment } from "react";

/** The platform names scrolling sideways, separated by accent dots. Rendered twice so the loop is seamless; the copy is hidden from screen readers, and under reduced motion it stops and the copy is dropped. */
export function Marquee({ items }: { items: string[] }) {
  const list = (dup: boolean) => (
    <ul className={dup ? "marquee-dup flex shrink-0 items-center" : "flex shrink-0 items-center"} aria-hidden={dup ? "true" : undefined}>
      {items.map((name) => (
        <Fragment key={name}>
          <li className="whitespace-nowrap px-6 text-[22px] font-bold tracking-[-0.03em] text-[var(--white)] sm:px-9 sm:text-[30px]">{name}</li>
          <li aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--accent)]" />
        </Fragment>
      ))}
    </ul>
  );
  return (
    <div className="marquee border-y border-[var(--hairline)] py-6" role="region" aria-label="Platforms we've built">
      <div className="marquee-track">
        {list(false)}
        {list(true)}
      </div>
    </div>
  );
}
