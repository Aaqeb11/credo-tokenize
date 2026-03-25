"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AddUser() {
  const [form, setForm] = useState({
    fullName: "",
    address: "",
    cardNumber: "",
    bankName: "",
  });

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setForm({ ...form, cardNumber: formatted });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("Submitted:", form);
    // your API call here
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
            className="w-full h-12 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg mt-2"
          >
            Add
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
