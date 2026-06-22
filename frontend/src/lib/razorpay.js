// @ts-nocheck

export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export const openRazorpayCheckout = async ({
    keyId,
    razorpayOrderId,
    amount,
    currency,
    customerName,
    customerEmail,
    customerPhone,
    description,
    onSuccess,
    onDismiss,
}) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
        return { success: false, error: "Failed to load Razorpay" };
    }

    return new Promise((resolve) => {
        const options = {
            key: keyId,
            amount: amount,
            currency: currency,
            name: "ChocoKari",
            description: description,
            order_id: razorpayOrderId,
            prefill: {
                name: customerName || "",
                email: customerEmail || "",
                contact: customerPhone || "",
            },
            theme: {
                color: "#572b10",
            },
            config: {
                display: {
                    sequence: ["block.block_card", "block.block_upi", "block.block_netbanking", "block.block_wallet"],
                    preferences: {
                        show_default_options: true,
                    },
                    hide: [
                        { method: "emi" },
                        { method: "paylater" },
                        { method: "cardless_emi" },
                    ],
                },
            },
            handler: function (response) {
                if (onSuccess) onSuccess(response);
                resolve({ success: true, response });
            },
            modal: {
                ondismiss: function () {
                    if (onDismiss) onDismiss();
                    resolve({ success: false, error: "Payment cancelled" });
                },
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
            resolve({ success: false, error: response.error.description || "Payment failed" });
        });
        rzp.open();
    });
};
