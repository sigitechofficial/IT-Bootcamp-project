import Link from "next/link";
import { kv } from "@vercel/kv";
import { defaultContent, KV_KEY } from "@/lib/constants";
import { unstable_noStore as noStore } from "next/cache";

export default async function Header({ content: passedContent }) {
  noStore();
  // Use passed content or fetch from KV if not provided
  let content = passedContent;
  if (!content) {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        content = await kv.get(KV_KEY);
      } catch (error) {
        console.error("KV error:", error);
      }
    }
  }

  const finalContent = content || defaultContent;
  const header = finalContent.header || defaultContent.header;
  const { logo, menu, button } = header;

  return (
    <header className="w-full fixed top-0 left-0  bg-white  z-100">
      <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between ">
        {/* Logo */}
        <Link href={logo?.link || "/"} className="flex items-center">
          {logo?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo.image}
              alt={logo?.text || "Logo"}
              className="h-16 w-auto"
            />
          ) : (
            <div className="font-bold text-primary text-xl">
              {logo?.text || "ITJobNow"}
            </div>
          )}
        </Link>

        {/* Navigation Menu */}
        <nav className="hidden md:flex gap-10 ">
          {menu?.map((item, index) => (
            <Link
              key={index}
              href={item.link || "#"}
              className={item.className || "font-switzer text-lg font-semibold"}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {button?.text && (
          <Link
            href={button?.link || "/enroll"}
            className={
              "bg-primary text-white px-4 h-[60px] rounded-lg  text-lg hover:bg-primary/90 transition-colors font-switzer font-semibold flex items-center justify-center"
            }
          >
            {button.text}
          </Link>
        )}
      </div>
    </header>
  );
}
