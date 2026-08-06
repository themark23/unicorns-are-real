import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import celestiaImg from "@assets/celestia-no-bg.png";
import lumiImg from "@assets/lumi-no-bg.png";
import orionImg from "@assets/orion-no-bg.png";
import cometImg from "@assets/comet-no-bg.png";
import twinkleImg from "@assets/twinkle-no-bg.png";

const unicorns = [
  { src: celestiaImg, scale: 1.0 },
  { src: lumiImg,     scale: 1.55 },
  { src: orionImg,    scale: 1.6  },
  { src: cometImg,    scale: 1.6  },
  { src: twinkleImg,  scale: 1.45 },
];

export default function Header() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const unicorn = useMemo(
    () => unicorns[Math.floor(Math.random() * unicorns.length)],
    []
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/unicorn-magic", label: "Unicorn Magic" },
    { href: "/unicorn-valley", label: "Unicorn Valley" },
    { href: "/alacorn-adventure", label: "Alacorn Adventure" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(13, 10, 30, 0.92)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(139, 92, 246, 0.15)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" data-testid="link-home-logo">
          <motion.div
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.02 }}
          >
            <img
              src={unicorn.src}
              alt="Unicorn"
              className="flex-shrink-0 object-contain"
              style={{
                height: "52px",
                width: "auto",
                transform: `scale(${unicorn.scale})`,
                transformOrigin: "center center",
              }}
            />
            <div>
              <span
                className="text-lg font-serif font-semibold tracking-wide"
                style={{
                  background: "linear-gradient(135deg, #c4a2fc 0%, #f472b6 50%, #f0b429 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Unicorns Are Real
              </span>
            </div>
          </motion.div>
        </Link>

        <nav className="hidden md:flex items-center gap-1" data-testid="nav-desktop">
          {navLinks.map((link) => {
            const active = location === link.href;
            return (
              <Link key={link.href} href={link.href} data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <motion.span
                  className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors relative"
                  style={{
                    color: active ? "hsl(270, 75%, 80%)" : "hsl(270, 20%, 70%)",
                    background: active ? "rgba(139, 92, 246, 0.12)" : "transparent",
                  }}
                  whileHover={{ color: "hsl(270, 75%, 85%)" }}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-1 left-4 right-4 h-0.5 rounded-full"
                      style={{ background: "linear-gradient(90deg, #a78bfa, #e879f9)" }}
                    />
                  )}
                </motion.span>
              </Link>
            );
          })}
        </nav>

        <button
          className="md:hidden p-2 rounded-lg"
          style={{ color: "hsl(270, 30%, 80%)" }}
          onClick={() => setMenuOpen((v) => !v)}
          data-testid="button-mobile-menu"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{ background: "rgba(13, 10, 30, 0.97)", borderBottom: "1px solid rgba(139, 92, 246, 0.15)" }}
          >
            <div className="px-6 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} data-testid={`link-mobile-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  <span
                    className="block px-4 py-3 rounded-lg text-sm font-medium cursor-pointer"
                    style={{
                      color: location === link.href ? "hsl(270, 75%, 80%)" : "hsl(270, 20%, 70%)",
                      background: location === link.href ? "rgba(139, 92, 246, 0.12)" : "transparent",
                    }}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
