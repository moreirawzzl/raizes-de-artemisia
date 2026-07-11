import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        verde: {
          principal: "#556B4F",
          secundario: "#8A9A7B"
        },
        fundo: "#F8F6F1",
        bege: {
          claro: "#DCCFB9",
          escuro: "#C8BDAA"
        }
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        body: ["var(--font-montserrat)", "sans-serif"]
      },
      borderRadius: {
        xl2: "1.25rem"
      },
      boxShadow: {
        soft: "0 8px 30px rgba(85,107,79,0.10)",
        strong: "0 14px 40px rgba(85,107,79,0.18)"
      }
    }
  },
  plugins: []
};
export default config;
