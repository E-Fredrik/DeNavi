export function Footer() {
  const columns = [
    { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap", "Status"] },
    { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
    { title: "Resources", links: ["Documentation", "API Reference", "Help Center"] },
    { title: "Legal", links: ["Privacy", "Terms", "Security"] },
  ];

  return (
    <footer style={{ background: "#f8edd6", borderTop: "1px solid #f1e5ed" }}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "17px",
                color: "#0c123b",
                letterSpacing: "-0.02em",
                display: "block",
                marginBottom: "12px",
              }}
            >
              Navi
            </span>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontSize: "13px",
                lineHeight: 1.6,
                color: "#3c58a7",
                maxWidth: "200px",
              }}
            >
              Pro check-ins, effortless
              for event organizers.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: "12px",
                  color: "#3c58a7",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: "16px",
                }}
              >
                {col.title}
              </span>
              <div className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <a
                    key={link}
                    href="#"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 400,
                      fontSize: "13px",
                      color: "#3c58a7",
                      textDecoration: "none",
                    }}
                    className="hover:text-[#3c58a7] transition-colors duration-200"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-16 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          style={{ borderTop: "1px solid #f1e5ed" }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: "12px",
              color: "#867bba",
            }}
          >
            © 2026 Navi. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            {["Twitter", "LinkedIn", "Instagram"].map((s) => (
              <a
                key={s}
                href="#"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  fontSize: "12px",
                  color: "#867bba",
                  textDecoration: "none",
                }}
                className="hover:text-[#3c58a7] transition-colors duration-200"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
