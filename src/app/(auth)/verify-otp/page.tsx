"use client";

import { useState } from "react";
import { auth, getRecaptcha, signInWithPhoneNumber } from "@/lib/firebase";
import { useSearchParams } from "next/navigation";

export default function VerifyOtpPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    try {
      if (!phone.startsWith("+")) {
        setMessage("Phone must include country code (e.g. +92300...)");
        return;
      }

      setLoading(true);
      setMessage("");

      const recaptcha = getRecaptcha("recaptcha-container");
      if (!recaptcha) {
        setMessage("Recaptcha not ready");
        return;
      }

      await recaptcha.render();

      const result = await signInWithPhoneNumber(auth, phone, recaptcha);

      setConfirmationResult(result);
      setMessage("OTP sent successfully");
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      if (!confirmationResult) {
        setMessage("Send OTP first");
        return;
      }

      if (!otp) {
        setMessage("Enter OTP");
        return;
      }

      setLoading(true);
      setMessage("");

      const result = await confirmationResult.confirm(otp);

      if (!userId) {
        setMessage("User ID missing");
        return;
      }

      const res = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          firebaseUid: result.user.uid,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setMessage("Phone verified successfully ✅");
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Phone Verification</h2>

      <input
        type="text"
        placeholder="+923001234567"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <br /><br />

      <button onClick={sendOtp} disabled={loading}>
        {loading ? "Sending..." : "Send OTP"}
      </button>

      <div id="recaptcha-container"></div>

      <br /><br />

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <br /><br />

      <button onClick={verifyOtp} disabled={loading}>
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      <p>{message}</p>
    </div>
  );
}