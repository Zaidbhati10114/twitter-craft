import DropDown, { VibeType } from "@/components/DropDown";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Row } from "@/components/ui/row";
import { Textarea } from "@/components/ui/textarea";
import { NextPage } from "next";
import Head from "next/head";
import { useRef, useState, useEffect } from "react";

import { PiNumberCircleOneBold, PiNumberCircleTwo } from "react-icons/pi";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface ApiResponse {
  response: {
    response: {
      candidates: {
        content: {
          parts: { text: string }[];
        };
      }[];
    };
  };
}

interface FoodDescriptions {
  "1.": string;
  "2.": string;
  "3.": string;
}

const request = 10000;

const easySelections = [
  { shortTitle: "Adventure Seeker" },
  { shortTitle: "Tech Enthusiast" },
  { shortTitle: "Food Lover" },
  { shortTitle: "Fitness Buff" },
];

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState("");
  const [responseResult, setResponseResult] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [vibe, setVibe] = useState<VibeType>("Professional");
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (responseResult.length > 0 && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [responseResult]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponseResult([]);
    setError(null);

    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }

    const requestBody = {
      message: `Generate a Twitter bio for a ${vibe.toLowerCase()} ${bio} profile`,
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
        throw new Error(
          res.status === 429 || res.status === 504
            ? "Too many requests. Please try again later."
            : "An error occurred while generating the bio."
        );
      }

      const result: ApiResponse = await res.json();
      const responseText =
        result.response.response.candidates[0].content.parts[0].text;

      try {
        const data: FoodDescriptions = JSON.parse(responseText);
        setResponseResult([data["1."], data["2."], data["3."]]);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        setError("Failed to parse response. Please try again.");
      }
    } catch (error: any) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
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
            Powered by <span className="text-xl">Gemini AI</span>
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
            <Row className="flex-wrap gap-2 justify-start items-center my-2 w-full">
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
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex mb-5 items-center space-x-3">
            <PiNumberCircleTwo className="fill-white" size={22} />
            <p className="text-left font-medium text-white">
              Select your vibe.
            </p>
          </div>
          <div className="block">
            <DropDown vibe={vibe} setVibe={(newVibe) => setVibe(newVibe)} />
          </div>
          {!loading && (
            <Button
              className="bg-white rounded-xl hover:bg-slate-300 text-black font-medium px-4 py-2 sm:mt-10 mt-8"
              onClick={(e) => handleSubmit(e)}
            >
              Generate your bio &rarr;
            </Button>
          )}
          {loading && (
            <Button
              className="bg-white rounded-xl text-black font-medium px-4 py-2 sm:mt-10 mt-8"
              disabled
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          )}
          <ul className="p-4">
            <li className="text-white">
              Currently, I offer up to 10 requests per second as a freelance web
              developer. I plan to increase this limit in the future to better
              serve your needs.
            </li>
            <li className="text-center text-lg text-muted-foreground mt-2 mb-2">
              May take couple of minutes to generate your Bio,
              <br />
              So Please be patient!
            </li>
          </ul>
        </div>
        <hr className="h-px bg-gray-700 border-1 dark:bg-white" />
        <div className="space-y-10 my-10" ref={resultRef}>
          {loading && (
            <>
              <Skeleton className="w-[100vh] h-[6vh] rounded-xl" />
              <Skeleton className="w-[100vh] h-[6vh] rounded-xl" />
              <Skeleton className="w-[100vv] h-[6vh] rounded-xl" />
            </>
          )}
          {responseResult.map((item, index) => (
            <div
              className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border"
              onClick={() => {
                navigator.clipboard.writeText(item);
                toast({
                  description: "Your Bio is copied to your clipboard.",
                });
              }}
              key={index}
            >
              <p>{item}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
