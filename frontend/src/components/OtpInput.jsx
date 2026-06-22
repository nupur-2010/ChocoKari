// @ts-nocheck
import { useRef, useEffect } from "react";

export default function OtpInput({ value, onChange, length = 6, disabled = false }) {
    const inputRefs = useRef([]);

    useEffect(() => {
        if (inputRefs.current[0] && !disabled) {
            inputRefs.current[0].focus();
        }
    }, [disabled]);

    const handleChange = (index, e) => {
        const val = e.target.value;
        if (val && !/^\d$/.test(val)) return;
        const newOtp = (value || "").split("");
        while (newOtp.length < length) newOtp.push("");
        newOtp[index] = val;
        onChange(newOtp.join(""));
        if (val && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            e.preventDefault();
            const newOtp = (value || "").split("");
            while (newOtp.length < length) newOtp.push("");
            if (newOtp[index]) {
                newOtp[index] = "";
                onChange(newOtp.join(""));
            } else if (index > 0) {
                newOtp[index - 1] = "";
                onChange(newOtp.join(""));
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
        if (pasted) {
            const arr = pasted.split("");
            while (arr.length < length) arr.push("");
            onChange(arr.join(""));
            const lastIndex = Math.min(pasted.length, length - 1);
            inputRefs.current[lastIndex]?.focus();
        }
    };

    return (
        <div className="flex justify-center gap-2 sm:gap-3">
            {Array.from({ length }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={(value || "")[i] || ""}
                    onChange={(e) => handleChange(i, e)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-mono font-semibold rounded-lg border-2 border-chocolate/20 bg-white/70 text-chocolate focus:border-chocolate focus:bg-white outline-none transition disabled:opacity-50"
                />
            ))}
        </div>
    );
}
