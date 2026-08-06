import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppStoreButton from "@/components/AppStoreButton";
import FaqSection from "@/components/FaqSection";
import { Leaf, ShieldCheck, WifiOff, Star, Ban, Smile } from "lucide-react";

import celestiaImg from "@assets/char-celestia_1782164751356.jpg";
import cometImg from "@assets/char-comet_1782164751357.jpg";
import lumiImg from "@assets/char-lumi_1782164751358.jpg";
import orionImg from "@assets/char-orion_1782164751358.jpg";
import twinkleImg from "@assets/char-twinkle_1782164751359.jpg";

import beachSceneImg from "@assets/scene-beach_1782164751360.jpg";
import castleSceneImg from "@assets/scene-castle_1782164751360.jpg";
import forestSceneImg from "@assets/scene-forest_1782164751361.jpg";
import gardenSceneImg from "@assets/scene-garden_1782164751362.jpg";
import parkSceneImg from "@assets/scene-park_1782164751363.jpg";
import spaceSceneImg from "@assets/scene-space_1782164751363.jpg";
import appScreenImg from "@assets/unicorn-valley-02-beach-large_1782164751364.jpg";

const characters = [
  { name: "Mama Celestia", image: celestiaImg, color: "rgba(236, 72, 153, 0.2)", border: "rgba(236, 72, 153, 0.3)" },
  { name: "Papa Orion",    image: orionImg,    color: "rgba(139, 92, 246, 0.2)", border: "rgba(139, 92, 246, 0.3)" },
  { name: "Daughter Lumi", image: lumiImg,     color: "rgba(244, 114, 182, 0.2)", border: "rgba(244, 114, 182, 0.3)" },
  { name: "Son Comet",     image: cometImg,    color: "rgba(52, 211, 153, 0.2)", border: "rgba(52, 211, 153, 0.3)" },
  { name: "Baby Twinkle",  image: twinkleImg,  color: "rgba(251, 191, 36, 0.18)", border: "rgba(251, 191, 36, 0.28)" },
];

const scenes = [
  { name: "Sparkle Beach",   image: beachSceneImg  },
  { name: "Magic Garden",    image: gardenSceneImg },
  { name: "Rainbow Space",   image: spaceSceneImg  },
  { name: "Crystal Forest",  image: forestSceneImg },
  { name: "Fairy Park",      image: parkSceneImg   },
  { name: "Star Castle",     image: castleSceneImg },
];

const parentReasons = [
  { icon: Ban,        text: "No ads, no in-app purchases, no subscriptions — ever" },
  { icon: WifiOff,    text: "Fully offline after download — no Wi-Fi needed" },
  { icon: Star,       text: "No levels, no scores, no timers — pure imaginative play" },
  { icon: ShieldCheck,text: "Zero personal data collected. No accounts, no external links" },
  { icon: Smile,      text: "No reading required — entirely icon and touch-based" },
  { icon: Leaf,       text: "Gentle, open-ended play designed for ages 4 to 11" },
];

const faqItems = [
  {
    question: "What is Unicorn Valley?",
    answer: "Unicorn Valley is a free-play app for children ages 4 to 11. Kids drag five unicorn characters — Mama Celestia, Papa Orion, Daughter Lumi, Son Comet, and Baby Twinkle — across six magical scenes and discover sparkly hidden items along the way. There are no levels, no goals, and no wrong answers. It's pure imaginative play.",
  },
  {
    question: "How do you play?",
    answer: "Just press and drag any unicorn to move them around the scene. Tap a glittery item (seashells, wands, crystals, treats, and more) to make it sparkle. Drag a unicorn close to an item and watch the magic happen. Swipe the scene left or right to explore the full panoramic world. Tap any scene thumbnail at the bottom to travel to a new world instantly.",
  },
  {
    question: "What are the six worlds?",
    answer: "Sparkle Beach, Magic Garden, Rainbow Space, Crystal Forest, Fairy Park, and Star Castle — each with its own painted landscape, colour palette, background music, and 10 unique items to find and play with.",
  },
  {
    question: "Is there any reading required?",
    answer: "No. The entire app is played by touch — drag, tap, and explore. There's no text, no instructions, and nothing to read, making it perfectly accessible for pre-readers.",
  },
  {
    question: "Is it safe for young children?",
    answer: "Yes. Unicorn Valley collects zero personal data, has no ads, no in-app purchases, no social features, no external links, and no internet connection required after download. It is completely self-contained.",
  },
  {
    question: "Does it work without WiFi?",
    answer: "Yes. Once downloaded, the app works entirely offline — no internet required.",
  },
  {
    question: "Are there in-app purchases or subscriptions?",
    answer: "No. Unicorn Valley is a one-time download with no upsells, no subscriptions, and no hidden costs of any kind.",
  },
  {
    question: "What devices does it run on?",
    answer: "Unicorn Valley is designed for iPhone. It runs on any iPhone with iOS 16 or later.",
  },
  {
    question: "Will there be more scenes or characters?",
    answer: "We're just getting started! Future updates are planned with new worlds, seasonal scenes, and more magical surprises. Follow us to stay in the loop.",
  },
];

export default function UnicornValley() {
  return (
    <div className="magic-bg min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden px-6 pt-24 pb-16">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px]"
            style={{
              background: "radial-gradient(ellipse at center, rgba(236, 72, 153, 0.14) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          {[...Array(14)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 4 + 1,
                height: Math.random() * 4 + 1,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 70}%`,
                background: i % 2 === 0 ? "rgba(244, 114, 182, 0.6)" : "rgba(196, 162, 252, 0.5)",
              }}
              animate={{ y: [0, -16, 0], opacity: [0, 0.8, 0] }}
              transition={{
                duration: Math.random() * 5 + 4,
                delay: Math.random() * 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
              style={{
                background: "rgba(236, 72, 153, 0.14)",
                border: "1px solid rgba(236, 72, 153, 0.26)",
                color: "hsl(330, 80%, 78%)",
              }}
            >
              <Leaf size={11} />
              <span>Ages 4–11 · Free Play · No Rules</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 leading-tight">
              <span className="gradient-text">Where Every Drag</span>
              <br />
              <span style={{ color: "hsl(270, 20%, 90%)" }}>is a New Adventure</span>
            </h1>

            <p className="text-lg leading-relaxed mb-8" style={{ color: "hsl(265, 15%, 62%)" }}>
              A magical play world for kids ages 4–11, designed to spark imagination one sparkle at a time. Five enchanting unicorn friends. Six breathtaking hand-painted worlds. Ten hidden magical items to discover in each.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <AppStoreButton data-testid="button-valley-hero-app-store" />
            </div>

            <div className="flex items-center gap-8 mt-8">
              {[
                { label: "Characters", value: "5" },
                { label: "Worlds", value: "6" },
                { label: "Items per World", value: "10" },
              ].map((stat) => (
                <div key={stat.label} data-testid={`stat-valley-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className="text-2xl font-serif font-semibold" style={{ color: "hsl(330, 70%, 80%)" }}>
                    {stat.value}
                  </div>
                  <div className="text-xs" style={{ color: "hsl(265, 15%, 52%)" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative flex items-center justify-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div
                className="w-[220px] h-[460px] rounded-[44px] overflow-hidden"
                style={{
                  border: "2px solid rgba(236, 72, 153, 0.28)",
                  boxShadow: "0 40px 80px rgba(236, 72, 153, 0.22), 0 0 0 1px rgba(244, 114, 182, 0.06)",
                }}
              >
                <img
                  src={appScreenImg}
                  alt="Unicorn Valley beach scene"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-72 h-72 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(236, 72, 153, 0.2), transparent 70%)",
                  filter: "blur(30px)",
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Meet the Family */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3">
              <span style={{ color: "hsl(270, 20%, 90%)" }}>Meet the</span>{" "}
              <span className="gradient-text">Unicorn Family</span>
            </h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: "hsl(265, 15%, 55%)" }}>
              Five characters, each with their own colour, personality, and wiggly idle animation.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {characters.map((char, i) => (
              <motion.div
                key={char.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                whileHover={{ y: -6, scale: 1.03, transition: { duration: 0.18 } }}
                className="flex flex-col items-center rounded-2xl overflow-hidden"
                style={{ background: char.color, border: `1px solid ${char.border}` }}
                data-testid={`character-${i}`}
              >
                <div className="w-full aspect-[3/4] overflow-hidden">
                  <img
                    src={char.image}
                    alt={char.name}
                    className="w-full h-full object-cover object-center"
                    style={{ objectPosition: "50% 30%" }}
                  />
                </div>
                <div className="px-3 py-3 text-center">
                  <p className="text-xs font-semibold leading-tight" style={{ color: "hsl(270, 20%, 88%)" }}>
                    {char.name}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Six Worlds */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3">
              <span style={{ color: "hsl(270, 20%, 90%)" }}>Six</span>{" "}
              <span className="gradient-text">Magical Worlds</span>
            </h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: "hsl(265, 15%, 55%)" }}>
              Each scene is hand-painted with its own landscape, colour palette, background music, and 10 unique hidden items.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {scenes.map((scene, i) => (
              <motion.div
                key={scene.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                whileHover={{ scale: 1.04, transition: { duration: 0.18 } }}
                className="relative rounded-2xl overflow-hidden aspect-[3/4] cursor-default"
                style={{ boxShadow: "0 8px 32px rgba(236, 72, 153, 0.15)" }}
                data-testid={`scene-${i}`}
              >
                <img
                  src={scene.image}
                  alt={scene.name}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute bottom-0 left-0 right-0 px-3 py-3"
                  style={{ background: "linear-gradient(to top, rgba(13,10,30,0.75) 0%, transparent 100%)" }}
                >
                  <p className="text-xs font-semibold text-white text-center">{scene.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Parents Love It */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3">
              <span style={{ color: "hsl(270, 20%, 90%)" }}>Why Parents</span>{" "}
              <span className="gradient-text">Love It</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {parentReasons.map((reason, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                className="flex gap-3 p-5 rounded-xl"
                style={{ background: "rgba(30, 14, 42, 0.65)", border: "1px solid rgba(236, 72, 153, 0.1)" }}
                data-testid={`parent-reason-valley-${i}`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: "rgba(236, 72, 153, 0.14)" }}
                >
                  <reason.icon size={15} style={{ color: "hsl(330, 80%, 76%)" }} />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "hsl(265, 15%, 65%)" }}>
                  {reason.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3">
              <span style={{ color: "hsl(270, 20%, 90%)" }}>Frequently Asked</span>{" "}
              <span className="gradient-text">Questions</span>
            </h2>
            <p className="text-sm" style={{ color: "hsl(265, 15%, 55%)" }}>
              Everything parents want to know before downloading.
            </p>
          </motion.div>
          <FaqSection items={faqItems} accentColor="rgba(236, 72, 153, 0.2)" />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto text-center rounded-2xl p-12"
          style={{
            background: "linear-gradient(135deg, rgba(236, 72, 153, 0.14), rgba(139, 92, 246, 0.08))",
            border: "1px solid rgba(236, 72, 153, 0.2)",
          }}
        >
          <h2 className="text-3xl font-serif font-bold mb-4 gradient-text">
            The Adventure Begins Now
          </h2>
          <p className="text-sm mb-2" style={{ color: "hsl(265, 15%, 58%)" }}>
            Made for ages 4–11 · No ads · No rules · Works offline
          </p>
          <p className="text-sm mb-8" style={{ color: "hsl(265, 15%, 50%)" }}>
            Download once. Play forever.
          </p>
          <div className="flex justify-center">
            <AppStoreButton data-testid="button-valley-cta-app-store" />
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
