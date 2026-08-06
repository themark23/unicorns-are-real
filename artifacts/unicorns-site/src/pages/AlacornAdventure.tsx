import { Link } from "wouter";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Sparkles, ArrowRight, Timer, Hand, ShieldCheck, Gem } from "lucide-react";
import celestiaImg from "@assets/celestia-no-bg.png";
import orionImg from "@assets/orion-no-bg.png";
import lumiImg from "@assets/lumi-no-bg.png";
import cometImg from "@assets/comet-no-bg.png";
import twinkleImg from "@assets/twinkle-no-bg.png";
import sceneBeach from "@assets/scene-beach_1782164751360.jpg";
import sceneForest from "@assets/scene-forest_1782164751361.jpg";
import sceneSpace from "@assets/scene-space_1782164751363.jpg";
import sceneGarden from "@assets/scene-garden_1782164751362.jpg";
import sceneCastle from "@assets/scene-castle_1782164751360.jpg";

const GOLD = "hsl(38, 90%, 72%)";

const alacorns = [
  { name: "Celestia", img: celestiaImg, scale: 1.0,  trait: "Star horn" },
  { name: "Orion",    img: orionImg,    scale: 1.6,  trait: "Moon horn" },
  { name: "Lumi",     img: lumiImg,     scale: 1.55, trait: "Rainbow mane" },
  { name: "Comet",    img: cometImg,    scale: 1.6,  trait: "Sun horn" },
  { name: "Twinkle",  img: twinkleImg,  scale: 1.45, trait: "Littlest flyer" },
];

const worlds = [
  { name: "Rainbow Beach",  img: sceneBeach,  desc: "Palms, sailboats and a giant rainbow over the sea." },
  { name: "Crystal City",   img: sceneCastle, desc: "Glowing gem towers and floating crystal islands." },
  { name: "Unicorn Valley", img: sceneGarden, desc: "The garden park — gazebo, fountain and blossom trees." },
  { name: "Magical Forest", img: sceneForest, desc: "Glowing mushrooms, lily ponds and drifting fireflies." },
  { name: "Outer Space",    img: sceneSpace,  desc: "Ringed planets, nebulas and tumbling moon rocks." },
];

const features = [
  { icon: Hand,        title: "One finger to fly",   text: "Your alacorn glides on its own — kids just drag anywhere on screen to turn, climb and dive. Built for ages 4 and up, no reading required." },
  { icon: Timer,       title: "45-second treasure hunts", text: "Short, replayable rounds. Collect as many magical crystals as you can before the timer runs out, then beat your best score." },
  { icon: Gem,         title: "Golden star crystals", text: "Rare golden stars are worth five crystals each. Find them and the score really climbs." },
  { icon: ShieldCheck, title: "Completely kid-safe",  text: "No ads, no in-app purchases, no data collection, no links out. Works fully offline." },
];

export default function AlacornAdventure() {
  return (
    <div className="magic-bg min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden px-6 pt-28 pb-16">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[620px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(240, 180, 41, 0.13) 0%, transparent 70%)", filter: "blur(50px)" }}
          />
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
            style={{
              background: "rgba(240, 180, 41, 0.12)",
              border: "1px solid rgba(240, 180, 41, 0.28)",
              color: GOLD,
            }}
          >
            <Sparkles size={14} />
            <span>Fly. Explore. Collect crystals.</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight mb-6"
          >
            <span style={{ color: "hsl(270, 20%, 90%)" }}>Unicorn Valley</span>
            <br />
            <span className="gradient-text">Alacorn Adventure</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-lg md:text-xl leading-relaxed mb-10 max-w-xl mx-auto"
            style={{ color: "hsl(265, 15%, 62%)" }}
          >
            A 3D flying game for little ones. Pick an alacorn — a unicorn with
            wings — and soar through five magical worlds, gathering every glowing
            crystal you can before time runs out.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.38 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <span
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold"
              style={{
                background: "linear-gradient(135deg, hsl(38, 88%, 52%), hsl(20, 80%, 52%))",
                color: "#1a1030",
                boxShadow: "0 8px 32px rgba(240, 180, 41, 0.3)",
              }}
              data-testid="badge-coming-soon"
            >
              Coming soon to the App Store
            </span>
            <Link href="/" data-testid="link-alacorn-back-home">
              <motion.span
                whileHover={{ x: 4 }}
                className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer"
                style={{ color: GOLD }}
              >
                See all our apps <ArrowRight size={14} />
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-serif font-bold text-center mb-16"
          >
            <span style={{ color: "hsl(270, 20%, 90%)" }}>Made for</span>{" "}
            <span className="gradient-text-gold">Little Pilots</span>
          </motion.h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="app-card-alacorn rounded-2xl p-7"
                data-testid={`card-feature-${i}`}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(240, 180, 41, 0.16)", color: GOLD }}
                >
                  <f.icon size={22} />
                </div>
                <h3 className="text-xl font-serif font-semibold mb-2" style={{ color: "hsl(38, 40%, 92%)" }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "hsl(265, 15%, 60%)" }}>
                  {f.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Alacorns */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              <span style={{ color: "hsl(270, 20%, 90%)" }}>Five</span>{" "}
              <span className="gradient-text">Alacorns</span>
            </h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: "hsl(265, 15%, 55%)" }}>
              The whole Unicorn Valley family — each with their own horn, mane and
              sparkle.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-6">
            {alacorns.map((a, i) => (
              <motion.div
                key={a.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                whileHover={{ y: -6 }}
                className="app-card-alacorn rounded-2xl p-5 flex flex-col items-center"
                style={{ width: 190 }}
                data-testid={`card-alacorn-${a.name.toLowerCase()}`}
              >
                <div className="h-28 flex items-center justify-center mb-3">
                  <img
                    src={a.img}
                    alt={a.name}
                    className="object-contain"
                    style={{ height: "104px", width: "auto", transform: `scale(${a.scale})` }}
                  />
                </div>
                <div className="text-lg font-serif font-semibold" style={{ color: "hsl(38, 40%, 92%)" }}>
                  {a.name}
                </div>
                <div className="text-xs mt-1" style={{ color: "hsl(265, 15%, 58%)" }}>
                  {a.trait}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Worlds */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              <span style={{ color: "hsl(270, 20%, 90%)" }}>Five Magical</span>{" "}
              <span className="gradient-text-teal">Worlds</span>
            </h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: "hsl(265, 15%, 55%)" }}>
              Every world is its own sky, its own weather, its own hidden
              treasure.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {worlds.map((w, i) => (
              <motion.div
                key={w.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                whileHover={{ y: -6 }}
                className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid rgba(240, 180, 41, 0.18)", background: "rgba(20, 15, 40, 0.5)" }}
                data-testid={`card-world-${i}`}
              >
                <img src={w.img} alt={w.name} className="w-full h-40 object-cover" />
                <div className="p-5">
                  <h3 className="text-lg font-serif font-semibold mb-1.5" style={{ color: "hsl(38, 40%, 92%)" }}>
                    {w.name}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "hsl(265, 15%, 58%)" }}>
                    {w.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center app-card-alacorn rounded-3xl p-12"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4" style={{ color: "hsl(270, 20%, 92%)" }}>
            Ready for takeoff
          </h2>
          <p className="text-base mb-8 max-w-md mx-auto" style={{ color: "hsl(265, 15%, 60%)" }}>
            Alacorn Adventure is coming to iPhone. No ads, no purchases, nothing
            to sign up for — just flying.
          </p>
          <Link href="/alacorn-adventure/privacy" data-testid="link-alacorn-privacy">
            <motion.span
              whileHover={{ x: 4 }}
              className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer"
              style={{ color: GOLD }}
            >
              Read our privacy promise <ArrowRight size={14} />
            </motion.span>
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
