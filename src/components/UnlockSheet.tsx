"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PRICING,
  type RazorpayOrderResponse,
  type RazorpayOrderRequest,
  type RazorpayVerifyRequest,
  type VibeCheckRequest,
} from "@/types/vedic";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill?: { email?: string };
  theme?: { color?: string };
  handler: (resp: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  modal?: { ondismiss?: () => void };
}

type Product = "daily_vibe_unlock" | "compatibility_unlock";

type Payload =
  | { kind: "daily_vibe"; birth: VibeCheckRequest }
  | { kind: "compatibility"; boy: VibeCheckRequest; girl: VibeCheckRequest };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  payload: Payload;
}

type State =
  | { kind: "idle" }
  | { kind: "creating-order" }
  | { kind: "razorpay-open" }
  | { kind: "verifying" }
  | { kind: "done"; emailDelivered: boolean; pdfBase64: string; pdfFilename: string }
  | { kind: "error"; msg: string };

export function UnlockSheet({ open, onOpenChange, product, payload }: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const pricing = PRICING[product];
  const amountRupees = pricing.amountInPaise / 100;

  // load razorpay checkout script lazily once the sheet opens
  useEffect(() => {
    if (!open) return;
    if (typeof window === "undefined") return;
    if (window.Razorpay) return;
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    document.body.appendChild(s);
  }, [open]);

  // reset state when closing
  useEffect(() => {
    if (!open) {
      setState({ kind: "idle" });
    }
  }, [open]);

  async function handlePay(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState({ kind: "error", msg: "drop a real email bestie" });
      return;
    }
    setState({ kind: "creating-order" });

    try {
      const orderReq: RazorpayOrderRequest = { product, email, payload };
      const r = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderReq),
      });
      const order = (await r.json()) as RazorpayOrderResponse | { ok: false; error: string };
      if (!r.ok || !("orderId" in order)) {
        setState({ kind: "error", msg: ("error" in order && order.error) || "couldn't create order" });
        return;
      }

      if (!window.Razorpay) {
        // poll briefly for script load
        for (let i = 0; i < 30; i++) {
          await new Promise((r) => setTimeout(r, 100));
          if (window.Razorpay) break;
        }
      }
      if (!window.Razorpay) {
        setState({ kind: "error", msg: "razorpay didn't load. retry?" });
        return;
      }

      setState({ kind: "razorpay-open" });

      const rz = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "halostar",
        description: order.productLabel,
        prefill: { email },
        theme: { color: "#0a0a0a" },
        handler: async (resp) => {
          setState({ kind: "verifying" });
          try {
            const verifyReq: RazorpayVerifyRequest = {
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
              product,
              email,
              payload,
            };
            const vr = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(verifyReq),
            });
            const vj = (await vr.json()) as
              | { ok: true; emailDelivered: boolean; pdfBase64: string; pdfFilename: string }
              | { ok: false; error: string };
            if (!vr.ok || !vj.ok) {
              setState({ kind: "error", msg: ("error" in vj && vj.error) || "verification failed" });
              return;
            }
            setState({
              kind: "done",
              emailDelivered: vj.emailDelivered,
              pdfBase64: vj.pdfBase64,
              pdfFilename: vj.pdfFilename,
            });
          } catch (err) {
            setState({ kind: "error", msg: (err as Error).message ?? "verification failed" });
          }
        },
        modal: {
          ondismiss: () => {
            setState({ kind: "idle" });
          },
        },
      });
      rz.open();
    } catch (err) {
      setState({ kind: "error", msg: (err as Error).message ?? "something glitched" });
    }
  }

  function downloadPdf() {
    if (state.kind !== "done") return;
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${state.pdfBase64}`;
    link.download = state.pdfFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-line-strong bg-popover text-paper sm:max-w-md">
        {state.kind === "done" ? (
          <DoneState state={state} onDownload={downloadPdf} email={email} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="serif-italic text-2xl text-paper">{pricing.label}</DialogTitle>
              <DialogDescription className="text-paper-muted">
                {pricing.blurb}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handlePay} className="mt-4 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label className="label-meta">Email for delivery</Label>
                <Input
                  type="email"
                  required
                  placeholder="your@email.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={state.kind !== "idle" && state.kind !== "error"}
                  className="h-11 rounded-none border-x-0 border-t-0 border-b border-line-strong bg-transparent px-0 text-base text-paper placeholder:text-paper-faint focus-visible:border-paper focus-visible:ring-0"
                />
              </div>

              {state.kind === "error" && (
                <p role="alert" className="text-sm text-destructive">{state.msg}</p>
              )}

              <button
                type="submit"
                disabled={state.kind === "creating-order" || state.kind === "razorpay-open" || state.kind === "verifying"}
                className="h-12 w-full bg-paper text-base font-medium tracking-tight text-ink transition hover:bg-paper/90 disabled:cursor-wait disabled:opacity-70"
              >
                {state.kind === "creating-order" && "preparing checkout..."}
                {state.kind === "razorpay-open" && "complete payment..."}
                {state.kind === "verifying" && "verifying & writing your reading..."}
                {(state.kind === "idle" || state.kind === "error") && `pay ₹${amountRupees}`}
              </button>

              <p className="text-center text-[11px] text-paper-faint">
                payment via razorpay (UPI, card, netbanking). PDF emailed once payment clears.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DoneState({
  state,
  onDownload,
  email,
}: {
  state: { kind: "done"; emailDelivered: boolean; pdfFilename: string };
  onDownload: () => void;
  email: string;
}) {
  return (
    <div className="flex flex-col gap-6 py-2">
      <DialogHeader>
        <DialogTitle className="serif-italic text-2xl text-paper">your reading&rsquo;s ready ✦</DialogTitle>
        <DialogDescription className="text-paper-muted">
          {state.emailDelivered
            ? `also sent to ${email}. check your inbox in 1–2 minutes.`
            : `download below — we'll get it to your inbox once email infra ships.`}
        </DialogDescription>
      </DialogHeader>

      <button
        onClick={onDownload}
        className="h-12 w-full bg-paper text-base font-medium tracking-tight text-ink transition hover:bg-paper/90"
      >
        download {state.pdfFilename} →
      </button>
    </div>
  );
}
