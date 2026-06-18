import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "HotBot Studios — Full-Service Growth Infrastructure for US Businesses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PILLS = [
  {
    label: "AI Automation",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.35)",
  },
  {
    label: "Digital Marketing",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.12)",
    border: "rgba(168,85,247,0.35)",
  },
  {
    label: "Ecommerce Services",
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.12)",
    border: "rgba(6,182,212,0.35)",
  },
  {
    label: "Software Dev",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.35)",
  },
];

const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hotbotstudios.com").replace(
    /\/$/,
    ""
  );

export default async function Image() {
  const [fontRegular, fontBold] = await Promise.all([
    fetch(
      "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-400-normal.woff2"
    ).then((r) => r.arrayBuffer()),
    fetch(
      "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-700-normal.woff2"
    ).then((r) => r.arrayBuffer()),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Subtle grid pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "linear-gradient(rgba(245,158,11,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.045) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Amber radial glow — top-center */}
        <div
          style={{
            position: "absolute",
            top: "-140px",
            left: "270px",
            width: "660px",
            height: "540px",
            background:
              "radial-gradient(ellipse, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.05) 50%, transparent 72%)",
          }}
        />

        {/* Corner accent — bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            right: "-60px",
            width: "280px",
            height: "280px",
            background:
              "radial-gradient(ellipse, rgba(168,85,247,0.08) 0%, transparent 70%)",
          }}
        />

        {/* HotBot Studios logo — 944×176 source, rendered at 90px tall */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${SITE_URL}/logos/brand-logo.png`}
          width={483}
          height={90}
          alt="HotBot Studios"
          style={{ objectFit: "contain", marginBottom: "28px" }}
        />

        {/* Subtitle */}
        <div
          style={{
            fontSize: "20px",
            fontWeight: 400,
            color: "#a1a1aa",
            letterSpacing: "0.01em",
            marginBottom: "36px",
          }}
        >
          Full-Service Growth Infrastructure for US Businesses
        </div>

        {/* Service pill badges */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "12px",
            marginBottom: "36px",
          }}
        >
          {PILLS.map(({ label, color, bg, border }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "7px 18px",
                borderRadius: "999px",
                background: bg,
                border: `1px solid ${border}`,
                color,
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "0.01em",
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Tagline row with decorative lines */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "14px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "1px",
              background: "rgba(245,158,11,0.4)",
            }}
          />
          <span
            style={{
              color: "#fbbf24",
              fontSize: "15px",
              fontWeight: 700,
              letterSpacing: "0.1em",
            }}
          >
            PIONEERING DIGITAL OUTREACH
          </span>
          <div
            style={{
              width: "80px",
              height: "1px",
              background: "rgba(245,158,11,0.4)",
            }}
          />
        </div>

        {/* Footer domain */}
        <div
          style={{
            color: "#52525b",
            fontSize: "13px",
            fontWeight: 400,
            letterSpacing: "0.04em",
          }}
        >
          hotbotstudios.com
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: fontRegular, style: "normal", weight: 400 },
        { name: "Inter", data: fontBold, style: "normal", weight: 700 },
      ],
    }
  );
}
