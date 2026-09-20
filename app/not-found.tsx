import Link from "next/link";

/** 404 in the same editorial voice as the rest of the site. */
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70svh] max-w-[1500px] flex-col justify-center px-5 md:px-10">
      <p className="eyebrow text-terracotta-deep">Error 404</p>
      <h1 className="mt-5 font-display text-[clamp(3rem,14vw,9rem)] leading-[0.85] uppercase">
        Off the rail
      </h1>
      <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-soft">
        That page doesn't exist — it may have sold out and been taken down.
      </p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Link href="/shop" className="btn btn-solid">
          Shop the collection
        </Link>
        <Link href="/" className="btn btn-outline">
          Back home
        </Link>
      </div>
    </div>
  );
}
