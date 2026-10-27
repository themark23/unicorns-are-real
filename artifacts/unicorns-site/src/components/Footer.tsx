import { Link, useLocation } from "wouter";

const PRIVACY_PATHS = [
  "/unicorn-magic/privacy",
  "/unicorn-valley/privacy",
  "/alacorn-adventure/privacy",
];

export default function Footer() {
  const [location] = useLocation();
  // Each app page links to its own policy; everywhere else falls back to the first.
  const privacyPath =
    PRIVACY_PATHS.find((path) => location.startsWith(path.replace("/privacy", ""))) ??
    PRIVACY_PATHS[0];

  return (
    <footer
      className="border-t py-12 px-6"
      style={{ borderColor: "rgba(139, 92, 246, 0.12)", background: "rgba(13, 10, 30, 0.6)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <div
              className="text-lg font-serif font-semibold mb-1"
              style={{
                background: "linear-gradient(135deg, #c4a2fc 0%, #f472b6 50%, #f0b429 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Unicorns Are Real
            </div>
            <p className="text-sm" style={{ color: "hsl(265, 15%, 55%)" }}>
              unicornsarereal.net
            </p>
            <p className="text-sm mt-2" style={{ color: "hsl(265, 15%, 55%)" }}>
              Questions or trouble with an app?{" "}
              <a
                href="mailto:markschectman@gmail.com"
                data-testid="link-footer-support-email"
                className="transition-colors"
                style={{ color: "hsl(270, 60%, 75%)" }}
              >
                markschectman@gmail.com
              </a>
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-6" data-testid="nav-footer">
            <Link href="/" data-testid="link-footer-home">
              <span className="text-sm cursor-pointer transition-colors" style={{ color: "hsl(265, 15%, 55%)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(270, 60%, 75%)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(265, 15%, 55%)")}
              >
                Home
              </span>
            </Link>
            <Link href="/unicorn-magic" data-testid="link-footer-unicorn-magic">
              <span className="text-sm cursor-pointer transition-colors" style={{ color: "hsl(265, 15%, 55%)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(270, 60%, 75%)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(265, 15%, 55%)")}
              >
                Unicorn Magic Playhouse
              </span>
            </Link>
            <Link href="/unicorn-valley" data-testid="link-footer-unicorn-valley">
              <span className="text-sm cursor-pointer transition-colors" style={{ color: "hsl(265, 15%, 55%)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(177, 60%, 55%)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(265, 15%, 55%)")}
              >
                Unicorn Valley
              </span>
            </Link>
            <Link href="/alacorn-adventure" data-testid="link-footer-alacorn-adventure">
              <span className="text-sm cursor-pointer transition-colors" style={{ color: "hsl(265, 15%, 55%)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(38, 90%, 68%)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(265, 15%, 55%)")}
              >
                Alacorn Adventure
              </span>
            </Link>
            <Link href={privacyPath} data-testid="link-footer-privacy">
              <span className="text-sm cursor-pointer transition-colors" style={{ color: "hsl(265, 15%, 55%)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(270, 60%, 75%)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(265, 15%, 55%)")}
              >
                Privacy
              </span>
            </Link>
          </nav>

          <div className="text-center md:text-right">
            <p className="text-xs" style={{ color: "hsl(265, 15%, 42%)" }}>
              &copy; {new Date().getFullYear()} Unicorns Are Real
            </p>
            <p className="text-xs mt-1" style={{ color: "hsl(265, 15%, 38%)" }}>
              All rights reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
