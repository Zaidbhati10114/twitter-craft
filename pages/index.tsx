import DropDown, { VibeType } from "@/components/DropDown";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LoadingDots from "@/components/LoadingDots";
import { Button } from "@/components/ui/button";
import { Row } from "@/components/ui/row";
import { Textarea } from "@/components/ui/textarea";
import { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { PiNumberCircleOneBold } from "react-icons/pi";

interface ApiResponse {
  result: string;
  status: boolean;
}

let request = 10000;

const easySelections = [
  {
    shortTitle: "Adventure Seeker",
  },
  {
    shortTitle: "Tech Enthusiast",
  },
  {
    shortTitle: "Food Lover",
  },
  {
    shortTitle: "Fitness Buff",
  },
];

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState("");
  const [responseResult, setResponseResult] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [vibe, setVibe] = useState<VibeType>("Professional");
  const resultRef = useRef<HTMLDivElement>(null);

  const prompt = `Generate 3 ${
    vibe === "Casual" ? "relaxed" : vibe === "Funny" ? "silly" : "Professional"
  } twitter biographies with no hashtags and clearly labeled "1.", "2.", and "3.". Only return these 3 twitter bios, nothing else. ${
    vibe === "Funny" ? "Make the biographies humorous" : ""
  } Make sure each generated biography is less than 300 characters, has short sentences that are found in Twitter bios, and feel free to use this context as well: ${bio}${
    bio.slice(-1) === "." ? "" : "."
  }`;

  useEffect(() => {
    if (responseResult.length > 0 && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [responseResult]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    request++;
    setResponseResult([]);
    setLoading(true);

    const requestBody = {
      messages: [{ role: "user", content: prompt }],
      web_access: false,
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const result: ApiResponse = await res.json();
      if (result.status) {
        const biosArray = result.result.split("\n\n");
        biosArray.sort();
        setResponseResult(biosArray);
        setError(null);
      } else {
        setError("Failed to fetch response");
      }
    } catch (error) {
      setError("Failed to fetch response");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionClick = (title: string) => {
    setBio(title);
  };

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Head>
        <title>Twitter Bio Generator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
        <p className="border rounded-2xl py-1 px-4 text-white text-sm mb-5 hover:scale-105 transition duration-300 ease-in-out">
          <b>{request}</b> bios generated so far and still counting...
        </p>
        <h1 className="sm:text-6xl text-4xl test p-4 max-w-[708px] font-bold text-white">
          Generate your next Twitter bio using AI
        </h1>
        <div className="mt-7">
          <h1 className="text-white">
            Powered by <span className="text-xl">ChatGPT</span>
          </h1>
        </div>
        <div className="max-w-xl w-full">
          <div className="flex mt-10 items-center space-x-3">
            <PiNumberCircleOneBold size={22} className="fill-white" />
            <p className="text-left font-medium text-white">
              Drop in your job{" "}
              <span className="text-slate-500 font-medium">
                (or your favorite hobby)
              </span>
              .
            </p>
          </div>
          <div className="space-y-5 mt-10">
            <h1 className="text-left font-lg text-white">
              Need Some Suggestions?
            </h1>
            <Row className="flex-wrap gap-2  justify-start items-center my-2 w-full">
              {easySelections.map((item) => (
                <Button
                  key={item.shortTitle}
                  onClick={() => handleSelectionClick(item.shortTitle)}
                  className="whitespace-nowrap bg-black text-white"
                  size={"xs"}
                  variant={"outline"}
                >
                  {item.shortTitle}
                </Button>
              ))}
            </Row>
          </div>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="bg-black text-white rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
            placeholder="e.g. Amazon CEO"
          />
          <div className="flex mb-5 items-center space-x-3">
            <Image src="/2-black.png" width={30} height={30} alt="1 icon" />
            <p className="text-left font-medium">Select your vibe.</p>
          </div>
          <div className="block">
            <DropDown vibe={vibe} setVibe={(newVibe) => setVibe(newVibe)} />
          </div>
          {!loading && (
            <button
              className="bg-white rounded-xl text-black font-medium px-4 py-2 sm:mt-10 mt-8  w-full"
              onClick={(e) => handleSubmit(e)}
            >
              Generate your bio &rarr;
            </button>
          )}

          {loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              disabled
            >
              <LoadingDots color="white" style="large" />
            </button>
          )}
        </div>
        <hr className="h-px bg-gray-700 border-1 dark:bg-white" />
        <div className="space-y-10 my-10" ref={resultRef}>
          {responseResult.length > 0 && (
            <div>
              <h2 className="sm:text-4xl text-3xl pb-5 font-bold text-white mx-auto">
                You&apos;r AI Generated Bio&apos;s
              </h2>
              <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
                {responseResult.map((bio, index) => (
                  <div
                    key={index}
                    className="bg-black text-white rounded-xl shadow-md transition cursor-copy border"
                    onClick={() => {
                      navigator.clipboard.writeText(bio);
                      toast("Bio copied to clipboard", {
                        icon: "✂️",
                      });
                    }}
                  >
                    <p>{bio}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {error && <p>{error}</p>}
        </div>
      </main>
      <Footer />
      <Toaster position="bottom-center" />
    </div>
  );
};

export default Home;
