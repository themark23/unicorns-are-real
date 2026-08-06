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

export default function AlacornPrivacy() {
  return (
    <div className="magic-bg min-h-screen">
      <Header />

      <section className="px-6 pt-32 pb-24">
        <div className="max-w-2xl mx-auto">
          <Link href="/alacorn-adventure" data-testid="link-privacy-back">
            <motion.span
              whileHover={{ x: -4 }}
              className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer mb-8"
              style={{ color: GOLD }}
            >
              <ArrowLeft size={14} /> Alacorn Adventure
            </motion.span>
          </Link>

          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3" style={{ color: "hsl(270, 20%, 92%)" }}>
            Privacy Policy
          </h1>
          <p className="text-sm mb-10" style={{ color: "hsl(265, 15%, 52%)" }}>
            Unicorn Valley: Alacorn Adventure · Last updated August 6, 2026
          </p>

          <div
            className="app-card-alacorn rounded-2xl p-7 mb-10 text-lg font-serif"
            style={{ color: "hsl(38, 45%, 88%)" }}
          >
            We do not collect, store, transmit, or share any personal
            information. Period.
          </div>

          <Section title="Built for children">
            <p>
              Unicorn Valley: Alacorn Adventure is designed for children and
              their families. Protecting privacy — especially children's — is our
              highest priority.
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
                <strong style={{ color: "hsl(38, 30%, 82%)" }}>No internet transmission.</strong> Nothing you or
                your child does in the game is ever sent anywhere. All gameplay
                happens entirely on the device.
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
            </ul>
          </Section>

          <Section title="The only thing stored">
            <p>
              The app saves your <strong style={{ color: "hsl(38, 30%, 82%)" }}>best crystal score for each
              world</strong> on the device itself, using local on-device storage.
              This never leaves the device, is not tied to any identity, and can
              be erased at any time by deleting the app.
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
