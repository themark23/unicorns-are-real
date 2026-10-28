import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppStoreButton from "@/components/AppStoreButton";
import FaqSection from "@/components/FaqSection";
import { Wand2, BookOpen, Palette, FlaskConical, Gamepad2, ShieldCheck, WifiOff, Star, Volume2, Heart } from "lucide-react";
import dressImg from "@assets/01_dress_1782164024060.jpg";
import readImg from "@assets/02_read_1782164024061.jpg";
import colorImg from "@assets/03_color_1782164024061.jpg";
import potionsImg from "@assets/04_potions_1782164024062.jpg";
import gamesImg from "@assets/05_games_1782164024063.jpg";

const activities = [
  {
    icon: Wand2,
    label: "Dress Up",
    title: "Dress Your Unicorn",
    description: "Mix colors, add accessories like crowns, tiaras, and bow ties, and create a unicorn that's totally one of a kind. Toggle on Sparkle Mode for extra magic.",
    image: dressImg,
    color: "rgba(196, 162, 252, 0.18)",
    border: "rgba(196, 162, 252, 0.22)",
    iconColor: "hsl(270, 75%, 78%)",
  },
  {
    icon: BookOpen,
    label: "Read & Listen",
    title: "Read Aloud",
    description: "15 magical stories and 15 unicorn facts — all written with kindness and wonder in mind. Tap \"Read This Story Aloud\" and let the app narrate every word.",
    image: readImg,
    color: "rgba(248, 113, 113, 0.12)",
    border: "rgba(248, 113, 113, 0.2)",
    iconColor: "hsl(0, 80%, 75%)",
  },
  {
    icon: Palette,
    label: "Color",
    title: "Tap to Color",
    description: "10 gorgeous unicorn coloring pages come to life with a single touch. Pick a color, tap a region, and watch it fill in instantly. Save finished art or start fresh any time.",
    image: colorImg,
    color: "rgba(52, 211, 153, 0.12)",
    border: "rgba(52, 211, 153, 0.2)",
    iconColor: "hsl(160, 65%, 65%)",
  },
  {
    icon: FlaskConical,
    label: "Potions",
    title: "Brew Magic Potions",
    description: "Ten secret potion recipes are waiting to be discovered. Tap each ingredient to drop it into the bottle, watch the color transform, and reveal what the potion does.",
    image: potionsImg,
    color: "rgba(251, 191, 36, 0.12)",
    border: "rgba(251, 191, 36, 0.2)",
    iconColor: "hsl(38, 90%, 68%)",
  },
  {
    icon: Gamepad2,
    label: "Games",
    title: "Play & Win",
    description: "Challenge your memory in a unicorn-themed Memory Match game or go head-to-head in Tic-Tac-Toe. Perfect for solo play or a quick game with a friend.",
    image: gamesImg,
    color: "rgba(99, 179, 237, 0.12)",
    border: "rgba(99, 179, 237, 0.2)",
    iconColor: "hsl(210, 75%, 70%)",
  },
];

const parentReasons = [
  { icon: ShieldCheck, text: "Zero ads, zero purchases — pay once and everything is unlocked" },
  { icon: WifiOff, text: "Works offline — no Wi-Fi needed after download" },
  { icon: Volume2, text: "Pre-reader friendly — icon-based navigation and read-aloud features" },
  { icon: Star, text: "Saves automatically — outfits and coloring progress are never lost" },
  { icon: Heart, text: "Positive content only — every story celebrates kindness, friendship, and creativity" },
];

const faqItems = [
  {
    question: "What age is Unicorn Magic Playhouse made for?",
    answer: "Unicorn Magic Playhouse is designed for children ages 4 to 8. The interface uses large icons, simple taps, and zero text-heavy navigation so even pre-readers can explore on their own.",
  },
  {
    question: "Is it free? Are there ads or in-app purchases?",
    answer: "The app is completely ad-free with no pop-ups, no in-app purchases, and nothing to buy. Once downloaded, everything is available right away.",
  },
  {
    question: "Does it work without Wi-Fi?",
    answer: "Yes! All content — stories, facts, coloring pages, potions, and games — is built into the app. No internet connection is needed after the initial download.",
  },
  {
    question: "What can kids do in the app?",
    answer: "There are five activities: dress up a unicorn with custom colors and accessories, read 15 enchanting stories and 15 magical facts (with a \"Read Aloud\" button for each), color 10 beautiful unicorn scenes with a tap-to-fill paint bucket, brew 10 magic potions by dropping animated ingredients into a bottle, and play Memory Match or Tic-Tac-Toe in the Games tab.",
  },
  {
    question: "Can my child use it independently?",
    answer: "Yes — that's the goal. Every tab is icon-based and tap-friendly. The Read tab has a \"Read This Story Aloud\" button so children who aren't reading yet can still enjoy the stories.",
  },
  {
    question: "Is the content appropriate and safe?",
    answer: "All stories and facts are original, gentle, and positive — focused on kindness, friendship, teamwork, and imagination. There is no violence, scary content, or external links.",
  },
  {
    question: "What device does it work on?",
    answer: "Unicorn Magic Playhouse is an iPhone app.",
  },
  {
    question: "Does it save my child's progress?",
    answer: "Yes. The app automatically saves your unicorn's outfit and any coloring progress so kids can pick up right where they left off.",
  },
];

export default function UnicornMagic() {
  return (
    <div className="magic-bg min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden px-6 pt-24 pb-16">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px]"
            style={{
              background: "radial-gradient(ellipse at center, rgba(139, 92, 246, 0.18) 0%, rgba(232, 121, 249, 0.06) 50%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
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
                background: "rgba(139, 92, 246, 0.15)",
                border: "1px solid rgba(139, 92, 246, 0.25)",
                color: "hsl(270, 75%, 78%)",
              }}
            >
              <Wand2 size={11} />
              <span>Ages 4–8 · Ad-Free · Offline</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 leading-tight">
              <span style={{ color: "hsl(270, 20%, 90%)" }}>A Magical World</span>
              <br />
              <span className="gradient-text">in Their Hands</span>
            </h1>

            <p className="text-lg leading-relaxed mb-8" style={{ color: "hsl(265, 15%, 62%)" }}>
              Unicorn Magic Playhouse is the screen-time parents feel good about — five enchanting activities designed for little imaginations ages 4 to 8. No ads. No purchases. Just pure sparkle.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <AppStoreButton data-testid="button-magic-hero-app-store" />
            </div>

            <div className="flex items-center gap-8 mt-8">
              {[
                { label: "Activities", value: "5" },
                { label: "Stories", value: "15" },
                { label: "Coloring Pages", value: "10" },
              ].map((stat) => (
                <div key={stat.label} data-testid={`stat-magic-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className="text-2xl font-serif font-semibold" style={{ color: "hsl(270, 60%, 82%)" }}>
                    {stat.value}
                  </div>
                  <div className="text-xs" style={{ color: "hsl(265, 15%, 52%)" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Phone mockup with real screenshot */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative flex items-center justify-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div
                className="w-[220px] h-[460px] rounded-[44px] overflow-hidden"
                style={{
                  border: "2px solid rgba(139, 92, 246, 0.3)",
                  boxShadow: "0 40px 80px rgba(139, 92, 246, 0.28), 0 0 0 1px rgba(196, 162, 252, 0.08)",
                }}
              >
                <img
                  src={dressImg}
                  alt="Unicorn Magic Playhouse dress-up screen"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-72 h-72 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(139,92,246,0.22), transparent 70%)",
                  filter: "blur(30px)",
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Activities */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3">
              <span style={{ color: "hsl(270, 20%, 90%)" }}>Five Ways to</span>{" "}
              <span className="gradient-text">Play & Explore</span>
            </h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: "hsl(265, 15%, 55%)" }}>
              Every activity is designed for little hands and big imaginations.
            </p>
          </motion.div>

          <div className="flex flex-col gap-16">
            {activities.map((activity, i) => {
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  key={activity.title}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: 0.05 }}
                  className={`grid md:grid-cols-2 gap-10 items-center ${!isEven ? "md:[&>*:first-child]:order-2" : ""}`}
                  data-testid={`activity-magic-${i}`}
                >
                  {/* Text */}
                  <div className={!isEven ? "md:order-1" : ""}>
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
                      style={{ background: activity.color, border: `1px solid ${activity.border}`, color: activity.iconColor }}
                    >
                      <activity.icon size={12} />
                      <span>{activity.label}</span>
                    </div>
                    <h3 className="text-2xl font-serif font-semibold mb-3" style={{ color: "hsl(270, 20%, 90%)" }}>
                      {activity.title}
                    </h3>
                    <p className="text-base leading-relaxed" style={{ color: "hsl(265, 15%, 60%)" }}>
                      {activity.description}
                    </p>
                  </div>

                  {/* Screenshot */}
                  <div className={`flex ${isEven ? "md:justify-end" : "md:justify-start"} justify-center`}>
                    <motion.div
                      whileHover={{ scale: 1.03, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="w-[190px] h-[400px] rounded-[38px] overflow-hidden"
                      style={{
                        border: `1.5px solid ${activity.border}`,
                        boxShadow: `0 24px 60px ${activity.color}, 0 0 0 1px rgba(255,255,255,0.04)`,
                      }}
                    >
                      <img
                        src={activity.image}
                        alt={`${activity.title} screen`}
                        className="w-full h-full object-cover object-top"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
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
                style={{ background: "rgba(30, 20, 55, 0.55)", border: "1px solid rgba(139, 92, 246, 0.1)" }}
                data-testid={`parent-reason-${i}`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: "rgba(139, 92, 246, 0.15)" }}
                >
                  <reason.icon size={15} style={{ color: "hsl(270, 70%, 75%)" }} />
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
          <FaqSection items={faqItems} accentColor="rgba(139, 92, 246, 0.22)" />
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
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.18), rgba(232, 121, 249, 0.08))",
            border: "1px solid rgba(139, 92, 246, 0.2)",
          }}
        >
          <h2 className="text-3xl font-serif font-bold mb-4 gradient-text">
            Ready to Sparkle?
          </h2>
          <p className="text-sm mb-2" style={{ color: "hsl(265, 15%, 58%)" }}>
            Made for ages 4–8 · Ad-free · No in-app purchases · Works offline
          </p>
          <p className="text-sm mb-8" style={{ color: "hsl(265, 15%, 50%)" }}>
            Download once. Everything unlocked.
          </p>
          <div className="flex justify-center">
            <AppStoreButton data-testid="button-magic-cta-app-store" />
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
