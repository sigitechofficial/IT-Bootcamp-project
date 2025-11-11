import Link from "next/link";
import {
  FaGlobe,
  FaDollarSign,
  FaFacebook,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";
import { defaultContent } from "@/lib/constants";

export default function Footer({ content }) {
  const finalContent = content || defaultContent;
  const header = finalContent.header || defaultContent.header;
  const { logo } = header;

  return (
    <footer className="bg-[#FBFBFB] ">
      {/* Upper Section - Three Columns */}
      <div className="max-w-[1400px] mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div>
            {/* Logo/Logo Graphic */}
            <div className="mb-4 ">
              {logo?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logo.image}
                  alt={logo?.text || "Logo"}
                  className="w-60 h-full"
                />
              ) : (
                <div className="font-bold text-primary text-xl">
                  {logo?.text || "ITJobNow"}
                </div>
              )}
            </div>
            {/* Description */}
            <p className="text-gray-700 text-sm leading-relaxed">
              ITJobNow is a 5-week training program that helps people learn IT
              skills and start their career in technology. Our goal is to help
              you gain the right skills and get ready for real IT jobs quickly.
            </p>
          </div>

          {/* Middle Column - Legal Links */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-gray-700 hover:text-primary transition-colors text-sm"
                >
                  Terms & Conditions (Clients)
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-700 hover:text-primary transition-colors text-sm"
                >
                  Terms & Conditions (ServiPros)
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-700 hover:text-primary transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Column - Contact Us */}
          <div>
            <Link
              href="/contact"
              className="text-lg font-bold text-gray-900 mb-4 hover:text-primary transition-colors block"
            >
              Contact Us
            </Link>
            <div className="space-y-3 text-sm text-gray-700">
              <p>Have questions or need help? We&apos;re here for you!</p>
              <p>Email: support@.com</p>
              <p>Location: San Juan, Australia</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left Side - Copyright and Design Credit */}
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-700">
              <p>&copy; 2025 ITJobNow. All rights reserved</p>
              <p>Designed with for Australia.</p>
            </div>

            {/* Right Side - Language, Currency, Social Media */}
            <div className="flex items-center gap-6">
              {/* Language Selector */}
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <FaGlobe className="text-gray-600" />
                <span>Spanish</span>
              </div>

              {/* Currency Selector */}
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <FaDollarSign className="text-gray-600" />
                <span>USD</span>
              </div>

              {/* Social Media Icons */}
              <div className="flex items-center gap-4">
                <Link
                  href="#"
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  <FaFacebook className="text-lg" />
                </Link>
                <Link
                  href="#"
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  <FaTwitter className="text-lg" />
                </Link>
                <Link
                  href="#"
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  <FaInstagram className="text-lg" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
