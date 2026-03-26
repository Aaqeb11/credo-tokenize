"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function AddUser() {
  const [form, setForm] = useState({
    fullName: "",
    address: "",
    cardNumber: "",
    bankName: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | any>(null);

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setForm({ ...form, cardNumber: formatted });
  };

  const validateForm = (): string | null => {
    if (!form.fullName.trim()) return "Full name is required";
    if (form.fullName.trim().length < 2)
      return "Full name must be at least 2 characters";
    if (form.fullName.trim().length > 100)
      return "Full name too long (max 100 chars)";

    if (!form.bankName.trim()) return "Bank name is required";
    if (form.bankName.trim().length < 2)
      return "Bank name must be at least 2 characters";
    if (form.bankName.trim().length > 50)
      return "Bank name too long (max 50 chars)";

    const cleanCard = form.cardNumber.replace(/\s/g, "");
    if (cleanCard.length !== 16 || !/^\d{16}$/.test(cleanCard)) {
      return "Card must be exactly 16 digits";
    }

    if (form.address.trim().length > 500) {
      return "Address too long (max 500 chars)";
    }

    return null;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    try {
      const cleanCard = form.cardNumber.replace(/\s/g, "");

      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          address: form.address.trim() || null,
          cardNumber: cleanCard,
          bankName: form.bankName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }

      setResult(data.user);
      toast.success("User Created!", {
        description: `Account: ${data.user.accountNumber}`,
      });

      setForm({ fullName: "", address: "", cardNumber: "", bankName: "" });
    } catch (error) {
      toast.error("Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Card className="max-w-2xl mx-auto bg-white shadow-sm rounded-xl">
        <CardHeader className="text-center border-b pb-4">
          <CardTitle className="text-3xl font-bold text-gray-900">
            Add User
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 flex flex-col gap-5">
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">
              User Details
            </p>
            <hr className="mb-5 border-gray-200" />
            <div className="flex flex-col gap-4">
              <Input
                name="fullName"
                placeholder="Full Name"
                value={form.fullName}
                onChange={handleChange}
                className="rounded-lg border-gray-300 h-12"
              />
              <Textarea
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleChange}
                className="rounded-lg border-gray-300 min-h-24 resize-none"
              />
              <Input
                name="cardNumber"
                placeholder="0000 0000 0000 0000"
                value={form.cardNumber}
                onChange={handleCardChange}
                maxLength={19}
                className="rounded-lg border-gray-300 h-12 tracking-widest font-mono"
              />
              <Input
                name="bankName"
                placeholder="Bank Name"
                value={form.bankName}
                onChange={handleChange}
                className="rounded-lg border-gray-300 h-12"
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-12 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg mt-2"
          >
            {loading ? "Creating..." : "Add User"}
          </Button>

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-bold text-green-800 mb-2">
                ✅ User Created Successfully
              </p>
              <div className="text-xs space-y-1 text-green-700">
                <div>
                  <span className="font-mono bg-green-100 px-2 py-1 rounded">
                    Account:
                  </span>{" "}
                  {result.accountNumber}
                </div>
                <div>Name: {result.fullName}</div>
                <div>Bank: {result.bankName}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
