"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import CTMStatus from "@/components/CTMStatus";

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="p-6 max-w-4xl mx-auto">
        <Card className="bg-white shadow-sm rounded-xl mt-10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-800">
              CTM Demo
            </CardTitle>
            <CTMStatus />
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button
              onClick={() => router.push("/add-user")}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 hover:cursor-pointer"
            >
              Add User
            </Button>
            <Button
              onClick={() => router.push("/fetch-user")}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 hover:cursor-pointer"
            >
              Fetch User
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
