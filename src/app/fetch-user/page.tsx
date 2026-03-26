"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function FetchUser() {
  const [accountNumber, setAccountNumber] = useState("");
  const [result, setResult] = useState<null | {
    fullName: string;
    address: string | null;
    accountNumber: string;
    cardNumber: string;
    bankName: string;
  }>(null);
  const [loading, setLoading] = useState(false);

  const formatAccountNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 3);
    return digits;
  };

  const validateAccount = (value: string): string | null => {
    const clean = value.replace(/\s/g, "");
    if (clean.length !== 3 || !/^\d{3}$/.test(clean)) {
      return "Enter exactly 3 digits (000-999)";
    }
    return null;
  };

  const handleSearch = async () => {
    const error = validateAccount(accountNumber);
    if (error) {
      toast.error(error);
      return;
    }

    const cleanAccount = accountNumber.replace(/\s/g, "");
    setLoading(true);

    try {
      const res = await fetch(`/api/users?accountNumber=${cleanAccount}`);
      const data = await res.json();

      if (!res.ok || !data) {
        toast.error("User not found");
        setResult(null);
        return;
      }

      setResult(data);
      toast.success("User found!");
    } catch (err) {
      toast.error("Search failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Card className="max-w-2xl mx-auto bg-white shadow-sm rounded-xl">
        <CardHeader className="text-center border-b pb-4">
          <CardTitle className="text-3xl font-bold text-gray-900">
            Fetch User
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 flex flex-col gap-5">
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">
              Account Details
            </p>
            <hr className="mb-5 border-gray-200" />
            <div className="flex gap-3">
              <Input
                placeholder="000"
                value={accountNumber}
                onChange={(e) =>
                  setAccountNumber(formatAccountNumber(e.target.value))
                }
                maxLength={3}
                className="rounded-lg border-gray-300 h-12 tracking-widest font-mono flex-1"
              />
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="h-12 px-6 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg shrink-0"
              >
                {loading ? "Searching..." : "Fetch"}
              </Button>
            </div>
          </div>

          {result && (
            <div className="flex flex-col gap-3 pt-2">
              <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-1">
                User Details
              </p>
              <hr className="border-gray-200" />
              {[
                { label: "Full Name", value: result.fullName },
                { label: "Address", value: result.address || "No address" },
                { label: "Account Number", value: result.accountNumber },
                { label: "Card Number", value: result.cardNumber },
                { label: "Bank Name", value: result.bankName },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 bg-gray-50 rounded-lg px-4 py-3"
                >
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    {label}
                  </span>
                  <span className="text-gray-800 font-medium font-mono text-sm">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
