import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] px-4 text-center">
      <h1 className="text-6xl font-bold bg-gradient-to-b from-red-400 via-red-600 to-red-800
              text-transparent bg-clip-text
              tracking-tighter pb-2 pr-2
              animate-gradient mb-4">404</h1>
      <h2 className="text-2xl font-semibold bg-gradient-to-b from-red-400 via-red-600 to-red-800
              text-transparent bg-clip-text
              tracking-tighter pb-2 pr-2
              animate-gradient mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8">
        Oops! The page you&apos;re looking for doesn&apos;t exist or has been
        moved.
      </p>
      <Link href="/">
        <Button className={"bg-red-700"}>Return Home</Button>
      </Link>
    </div>
  );
}