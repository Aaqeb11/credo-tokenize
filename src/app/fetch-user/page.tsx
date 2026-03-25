"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function FetchUser() {
  const [accountNumber, setAccountNumber] = useState(""); // Changed to accountNumber
  const [result, setResult] = useState<null | {
    fullName: string;
    address: string;
    accountNumber: string; // Updated to match
    cardNumber?: string; // Optional if still needed
    bankName: string;
  }>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const formatAccountNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 12); // Typical 12-digit account
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const handleSearch = async () => {
    const cleanAccount = accountNumber.replace(/\s/g, "");
    if (cleanAccount.length < 10) {
      // Flexible validation
      setError("Please enter a valid account number (min 10 digits).");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // Replace with your actual API call
      // const res = await fetch(`/api/user?accountNumber=${cleanAccount}`);
      // const data = await res.json();
      // setResult(data);

      // Mock result for now:
      setResult({
        fullName: "John Doe",
        address: "123 Main Street, Riyadh, Saudi Arabia",
        accountNumber: accountNumber,
        bankName: "Al Rajhi Bank",
      });
    } catch (err) {
      setError("User not found. Please check the account number.");
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
          {/* Search Section */}
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">
              Account Details
            </p>
            <hr className="mb-5 border-gray-200" />
            <div className="flex gap-3">
              <Input
                placeholder="0000 0000 0000" // Updated placeholder
                value={accountNumber}
                onChange={(e) =>
                  setAccountNumber(formatAccountNumber(e.target.value))
                }
                maxLength={16} // Adjusted for account numbers
                className="rounded-lg border-gray-300 h-12 tracking-widest font-mono"
              />
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="h-12 px-6 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg shrink-0"
              >
                {loading ? "Searching..." : "Fetch"}
              </Button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          {/* Result Section */}
          {result && (
            <div className="flex flex-col gap-3 pt-2">
              <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-1">
                User Details
              </p>
              <hr className="border-gray-200" />
              {[
                { label: "Full Name", value: result.fullName },
                { label: "Address", value: result.address },
                { label: "Account Number", value: result.accountNumber }, // Updated label
                ...(result.cardNumber
                  ? [{ label: "Card Number", value: result.cardNumber }]
                  : []),
                { label: "Bank Name", value: result.bankName },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 bg-gray-50 rounded-lg px-4 py-3"
                >
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    {label}
                  </span>
                  <span className="text-gray-800 font-medium">{value}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
