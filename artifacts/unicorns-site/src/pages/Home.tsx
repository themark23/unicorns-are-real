import { useRef } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppStoreButton from "@/components/AppStoreButton";
import { Sparkles, ArrowRight } from "lucide-react";

const floatingParticles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 6 + 5,
  delay: Math.random() * 4,
}));

function Particle({ x, y, size, duration, delay }: { x: number; y: number; size: number; duration: number; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: "radial-gradient(circle, rgba(196, 162, 252, 0.8), rgba(248, 113, 113, 0))",
      }}
      animate={{
        y: [0, -20, 0],
        opacity: [0, 0.7, 0],
        scale: [0.8, 1.2, 0.8],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="magic-bg min-h-screen">
      <Header />

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingParticles.map((p) => (
            <Particle key={p.id} {...p} />
          ))}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(45, 212, 191, 0.08) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
            style={{
              background: "rgba(139, 92, 246, 0.12)",
              border: "1px solid rgba(139, 92, 246, 0.25)",
              color: "hsl(270, 75%, 80%)",
            }}
          >
            <Sparkles size={14} />
            <span>Three worlds. One universe.</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight mb-6"
          >
            <span className="gradient-text">Unicorns</span>
            <br />
            <span style={{ color: "hsl(270, 20%, 90%)" }}>Are Real</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-lg md:text-xl leading-relaxed mb-10 max-w-xl mx-auto"
            style={{ color: "hsl(265, 15%, 62%)" }}
          >
            Unicorn Magic Playhouse is a magical activity app for kids — dress unicorns, feed them, and play together. Unicorn Valley is a free-play world where kids drag five unicorn friends across six hand-painted scenes. And in Alacorn Adventure, those same friends grow wings and fly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.38 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/unicorn-magic" data-testid="link-hero-unicorn-magic">
              <motion.span
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, hsl(270, 75%, 55%), hsl(310, 65%, 55%))",
                  color: "#fff",
                  boxShadow: "0 8px 32px rgba(139, 92, 246, 0.35)",
                }}
              >
                Unicorn Magic Playhouse <ArrowRight size={15} />
              </motion.span>
            </Link>
            <Link href="/unicorn-valley" data-testid="link-hero-unicorn-valley">
              <motion.span
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, hsl(177, 60%, 30%), hsl(200, 65%, 35%))",
                  color: "#fff",
                  boxShadow: "0 8px 32px rgba(45, 212, 191, 0.25)",
                }}
              >
                Unicorn Valley <ArrowRight size={15} />
              </motion.span>
            </Link>
            <Link href="/alacorn-adventure" data-testid="link-hero-alacorn-adventure">
              <motion.span
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, hsl(38, 80%, 45%), hsl(20, 72%, 45%))",
                  color: "#fff",
                  boxShadow: "0 8px 32px rgba(240, 180, 41, 0.25)",
                }}
              >
                Alacorn Adventure <ArrowRight size={15} />
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-5 h-8 rounded-full border-2 flex items-start justify-center pt-1.5" style={{ borderColor: "rgba(139, 92, 246, 0.35)" }}>
            <motion.div
              className="w-1 h-2 rounded-full"
              style={{ background: "hsl(270, 75%, 70%)" }}
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Apps Section */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              <span style={{ color: "hsl(270, 20%, 90%)" }}>Explore Our</span>{" "}
              <span className="gradient-text">Apps</span>
            </h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: "hsl(265, 15%, 55%)" }}>
              Each app is its own portal into a world where magic is tangible.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Unicorn Magic Playhouse Card */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="app-card-magic rounded-2xl p-8 flex flex-col"
              data-testid="card-unicorn-magic"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: "linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(232, 121, 249, 0.3))" }}
              >
                <svg viewBox="0 0 28 28" fill="none" width="28" height="28">
                  <circle cx="14" cy="14" r="13" fill="rgba(139,92,246,0.2)" />
                  <path d="M14 4 L16 10 L22 11 L17 16 L19 22 L14 19 L9 22 L11 16 L6 11 L12 10 Z" fill="#c4a2fc" opacity="0.9"/>
                </svg>
              </div>

              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-4 w-fit"
                style={{ background: "rgba(139, 92, 246, 0.15)", color: "hsl(270, 75%, 78%)" }}
              >
                <span>Ages 4–8 · Ad-Free · Offline</span>
              </div>

              <h3 className="text-2xl font-serif font-semibold mb-3" style={{ color: "hsl(270, 40%, 92%)" }}>
                Unicorn Magic Playhouse
              </h3>
              <p className="text-sm leading-relaxed mb-6 flex-grow" style={{ color: "hsl(265, 15%, 60%)" }}>
                Five enchanting activities for little imaginations — dress up a unicorn, read 15 magical stories aloud, color 10 scenes, brew magic potions, and play Memory Match. No ads, no purchases, works offline.
              </p>

              <div className="flex flex-col gap-3">
                <AppStoreButton data-testid="button-magic-app-store-card" />
                <Link href="/unicorn-magic" data-testid="link-magic-learn-more">
                  <motion.span
                    whileHover={{ x: 4 }}
                    className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer"
                    style={{ color: "hsl(270, 65%, 72%)" }}
                  >
                    Learn more <ArrowRight size={14} />
                  </motion.span>
                </Link>
              </div>
            </motion.div>

            {/* Unicorn Valley Card */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="app-card-valley rounded-2xl p-8 flex flex-col"
              data-testid="card-unicorn-valley"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: "linear-gradient(135deg, rgba(45, 212, 191, 0.35), rgba(16, 185, 129, 0.25))" }}
              >
                <svg viewBox="0 0 28 28" fill="none" width="28" height="28">
                  <circle cx="14" cy="14" r="13" fill="rgba(45,212,191,0.15)" />
                  <path d="M6 20 Q10 10 14 16 Q18 10 22 20 Z" fill="#2dd4bf" opacity="0.8"/>
                  <circle cx="14" cy="9" r="4" fill="#a7f3d0" opacity="0.5"/>
                </svg>
              </div>

              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-4 w-fit"
                style={{ background: "rgba(45, 212, 191, 0.12)", color: "hsl(177, 60%, 65%)" }}
              >
                <span>Cozy Sim Game</span>
              </div>

              <h3 className="text-2xl font-serif font-semibold mb-3" style={{ color: "hsl(177, 30%, 90%)" }}>
                Unicorn Valley
              </h3>
              <p className="text-sm leading-relaxed mb-6 flex-grow" style={{ color: "hsl(265, 15%, 60%)" }}>
                Cultivate a lush, enchanted valley where unicorns roam freely. Build meadows, craft magical items, breed rare unicorns, and witness mystical events that transform your world. A peaceful life sim with endless wonder.
              </p>

              <div className="flex flex-col gap-3">
                <AppStoreButton data-testid="button-valley-app-store-card" />
                <Link href="/unicorn-valley" data-testid="link-valley-learn-more">
                  <motion.span
                    whileHover={{ x: 4 }}
                    className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer"
                    style={{ color: "hsl(177, 60%, 60%)" }}
                  >
                    Learn more <ArrowRight size={14} />
                  </motion.span>
                </Link>
              </div>
            </motion.div>

            {/* Alacorn Adventure Card */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="app-card-alacorn rounded-2xl p-8 flex flex-col"
              data-testid="card-alacorn-adventure"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: "linear-gradient(135deg, rgba(240, 180, 41, 0.4), rgba(232, 121, 100, 0.3))" }}
              >
                <svg viewBox="0 0 28 28" fill="none" width="28" height="28">
                  <circle cx="14" cy="14" r="13" fill="rgba(240,180,41,0.18)" />
                  <path d="M14 5 L16.5 12 L14 19 L11.5 12 Z" fill="#f0b429" opacity="0.95" />
                  <path d="M5 13 Q10 9 13 13 Q10 15 5 13 Z" fill="#fcd34d" opacity="0.8" />
                  <path d="M23 13 Q18 9 15 13 Q18 15 23 13 Z" fill="#fcd34d" opacity="0.8" />
                </svg>
              </div>

              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-4 w-fit"
                style={{ background: "rgba(240, 180, 41, 0.14)", color: "hsl(38, 85%, 70%)" }}
              >
                <span>Ages 4+ · 3D Flying Game</span>
              </div>

              <h3 className="text-2xl font-serif font-semibold mb-3" style={{ color: "hsl(38, 40%, 92%)" }}>
                Alacorn Adventure
              </h3>
              <p className="text-sm leading-relaxed mb-6 flex-grow" style={{ color: "hsl(265, 15%, 60%)" }}>
                Pick one of five winged unicorns and fly through five magical worlds — a rainbow beach, a crystal city, a garden valley, an enchanted forest and outer space — collecting glowing crystals against the clock. One finger to steer.
              </p>

              <div className="flex flex-col gap-3">
                <span
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold w-fit"
                  style={{ background: "rgba(240, 180, 41, 0.14)", color: "hsl(38, 85%, 72%)", border: "1px solid rgba(240, 180, 41, 0.28)" }}
                  data-testid="badge-alacorn-coming-soon"
                >
                  Coming soon to the App Store
                </span>
                <Link href="/alacorn-adventure" data-testid="link-alacorn-learn-more">
                  <motion.span
                    whileHover={{ x: 4 }}
                    className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer"
                    style={{ color: "hsl(38, 85%, 68%)" }}
                  >
                    Learn more <ArrowRight size={14} />
                  </motion.span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brand strip */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center"
        >
          <p className="text-2xl md:text-3xl font-serif italic leading-relaxed" style={{ color: "hsl(270, 20%, 72%)" }}>
            "Magic isn't something you find. It's something you{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #c4a2fc, #f472b6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              step into
            </span>."
          </p>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
