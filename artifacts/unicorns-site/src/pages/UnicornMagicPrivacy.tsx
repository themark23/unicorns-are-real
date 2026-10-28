import { Link } from "wouter";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

const GOLD = "hsl(38, 90%, 72%)";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-9">
      <h2 className="text-xl font-serif font-semibold mb-3" style={{ color: "hsl(38, 40%, 90%)" }}>
        {title}
      </h2>
      <div className="text-[15px] leading-relaxed space-y-3" style={{ color: "hsl(265, 15%, 66%)" }}>
        {children}
      </div>
    </div>
  );
}

export default function UnicornMagicPrivacy() {
  return (
    <div className="magic-bg min-h-screen">
      <Header />

      <section className="px-6 pt-32 pb-24">
        <div className="max-w-2xl mx-auto">
          <Link href="/unicorn-magic" data-testid="link-privacy-back">
            <motion.span
              whileHover={{ x: -4 }}
              className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer mb-8"
              style={{ color: GOLD }}
            >
              <ArrowLeft size={14} /> Unicorn Magic Playhouse
            </motion.span>
          </Link>

          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3" style={{ color: "hsl(270, 20%, 92%)" }}>
            Privacy Policy
          </h1>
          <p className="text-sm mb-10" style={{ color: "hsl(265, 15%, 52%)" }}>
            Unicorn Magic Playhouse · Last updated October 27, 2026
          </p>

          <div
            className="app-card-alicorn rounded-2xl p-7 mb-10 text-lg font-serif"
            style={{ color: "hsl(38, 45%, 88%)" }}
          >
            We do not collect, store, transmit, or share any personal
            information. Period.
          </div>

          <Section title="Built for children">
            <p>
              Unicorn Magic Playhouse is a dress-up, coloring, story and games app made for
              children and their families. Protecting privacy — especially
              children's — is our highest priority.
            </p>
          </Section>

          <Section title="What the app does and does not do">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong style={{ color: "hsl(38, 30%, 82%)" }}>No data collection.</strong> The app does not ask
                for or collect names, email addresses, birthdays, photos,
                contacts, location, or any other personal information.
              </li>
              <li>
                <strong style={{ color: "hsl(38, 30%, 82%)" }}>No accounts or sign-in.</strong> There is no login.
                The app works fully offline.
              </li>
              <li>
                <strong style={{ color: "hsl(38, 30%, 82%)" }}>No internet transmission.</strong> The app makes no
                network requests at all. Nothing your child does is ever sent
                anywhere.
              </li>
              <li>
                <strong style={{ color: "hsl(38, 30%, 82%)" }}>No third-party services.</strong> There are no
                advertisements, no analytics or tracking SDKs, no social media
                integrations, and no in-app purchases.
              </li>
              <li>
                <strong style={{ color: "hsl(38, 30%, 82%)" }}>No cameras or microphones.</strong> The app never
                accesses the device camera, microphone, or photo library.
              </li>
              <li>
                <strong style={{ color: "hsl(38, 30%, 82%)" }}>No links out of the app.</strong> There is nothing
                to tap that leads to the web, so no parental gate is needed.
              </li>
            </ul>
          </Section>

          <Section title="What is saved on the device">
            <p>
              So your child's work is still there next time, the app saves a few
              things in local on-device storage: the unicorn design and colour
              palette they chose, their coloring pages, which unicorn facts they
              have discovered, and their best Magic Spell streak.
            </p>
            <p>
              Coloring pages are saved as ordinary image files inside the app's
              own private folder. None of this ever leaves the device, none of it
              is tied to any identity, and all of it is erased if the app is
              deleted.
            </p>
          </Section>

          <Section title="Read-aloud narration">
            <p>
              Stories and facts can be read aloud using the speech voice built
              into your device. The text is spoken on the device itself and is
              not sent to any server.
            </p>
          </Section>

          <Section title="Children's privacy (COPPA / GDPR-K)">
            <p>
              Because the app collects no personal information from anyone, it is
              compliant with the U.S. Children's Online Privacy Protection Act
              (COPPA) and equivalent protections for children under GDPR. No
              parental consent flow is required because there is no data to
              consent to.
            </p>
          </Section>

          <Section title="A note on the potion recipes">
            <p>
              The Magic Potions section contains simple drink recipes made from
              ordinary food and drink ingredients. They are meant to be made
              together with a grown-up, who should check the ingredients for
              anything a child is allergic to.
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              If this policy ever changes, the updated version will be posted here
              with a new "Last updated" date.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions? Email{" "}
              <a
                href="mailto:markschectman@gmail.com"
                style={{ color: GOLD }}
                data-testid="link-privacy-email"
              >
                markschectman@gmail.com
              </a>
              .
            </p>
          </Section>
        </div>
      </section>

      <Footer />
    </div>
  );
}
