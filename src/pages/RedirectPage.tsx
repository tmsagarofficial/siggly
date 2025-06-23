import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "@/config";

export default function RedirectPage() {
  const { shortcode } = useParams();
  const [searchParams] = useSearchParams();
  const [link, setLink] = useState<any>();
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState("");
  const instant = searchParams.get("instant") === "true";

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/resolve/${shortcode}`)
      .then(r => r.json())
      .then(data => {
        if (data.longUrl) {
          setLink(data);
          const delay = data.redirectDelay ?? 3;
          if (instant) {
            window.location.href = data.longUrl;
          } else {
            setCount(delay);
            const timer = setInterval(() => {
              setCount((prev) => {
                if (prev === 1) {
                  clearInterval(timer);
                  window.location.href = data.longUrl;
                  return 0;
                }
                return (prev ?? 1) - 1;
              });
            }, 1000);
          }
        } else {
          setError("Short link not found.");
        }
      })
      .catch(() => setError("Server error"));
  }, [shortcode, instant]);

  if (error) return <div className="text-center text-red-500 mt-20 font-mono">{error}</div>;

  return (
    <div className="min-h-screen bg-[#1e0045] text-white flex flex-col items-center justify-between px-4 font-montserrat">
      {/* Top */}
      <div className="text-center pt-10">
        <h1
  className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-yellow-300 font-praise leading-[1.3] pt-4 pb-4"
>
  Siggly
</h1>



      </div>

      {/* Center */}
      <div className="text-center mt-6">
        <p className="text-lg md:text-xl mb-1">You’re heading to</p>
        <p className="text-cyan-400 text-xl font-semibold mb-2 flex justify-center items-center gap-2">
          <img src="/link-icon.png" alt="link icon" className="w-5 h-5" />
          {link?.displayText || link?.longUrl || "Loading..."}
        </p>
        {!instant && (
          <p className="text-md text-gray-300">Redirecting in {count}..</p>
        )}
      </div>

      {/* Ad box */}
      <div className="my-10">
        <div className="hidden md:block bg-white rounded-xl w-[728px] h-[90px]"></div>
        <div className="md:hidden bg-white rounded-xl w-[300px] h-[300px]"></div>
      </div>

      {/* Footer */}
      <div className="text-center mb-6 text-sm text-gray-300">
        <p className="flex items-center justify-center gap-1">
          Built with <img src="/favicon.ico" alt="heart" className="w-4 h-4 inline" />
        </p>
        <img src="/siggraph-bnmit-logo.png" alt="SIGGRAPH BNMIT" className="h-10 mt-2 mx-auto" />
      </div>
    </div>
  );
}
