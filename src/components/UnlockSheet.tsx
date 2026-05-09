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
  type CompatibilityDetailed,
  type DailyVibeDetailed,
  type RazorpayOrderRequest,
  type RazorpayOrderResponse,
  type RazorpayVerifyRequest,
  type UnlockPayload,
  type UnlockProduct,
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
  handler: (resp: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
}

type UnlockResult =
  | { product: "daily_vibe_unlock"; detailed: DailyVibeDetailed }
  | { product: "compatibility_unlock"; detailed: CompatibilityDetailed };

interface PaidIds {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: UnlockProduct;
  payload: UnlockPayload;
  /** fired the moment payment + content generation completes — caller reveals the detailed read inline. */
  onUnlocked: (result: UnlockResult) => void;
}

type State =
  | { kind: "idle" }
  | { kind: "creating-order" }
  | { kind: "razorpay-open" }
  | { kind: "verifying" }
  | { kind: "error"; msg: string; paidIds?: PaidIds };

export function UnlockSheet({ open, onOpenChange, product, payload, onUnlocked }: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const pricing = PRICING[product];
  const amountRupees = pricing.amountInPaise / 100;

  useEffect(() => {
    if (!open) return;
    if (typeof window === "undefined") return;
    if (window.Razorpay) return;
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    document.body.appendChild(s);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setState({ kind: "idle" });
    }
  }, [open]);

  /** Run /api/razorpay/verify with already-paid IDs — no new charge. */
  async function runVerify(paidIds: PaidIds): Promise<void> {
    setState({ kind: "verifying" });
    try {
      const verifyReq: RazorpayVerifyRequest = {
        ...paidIds,
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
        | {
            ok: true;
            product: "daily_vibe_unlock";
            detailed: DailyVibeDetailed;
            emailDelivered: boolean;
          }
        | {
            ok: true;
            product: "compatibility_unlock";
            detailed: CompatibilityDetailed;
            emailDelivered: boolean;
          }
        | { ok: false; error: string };
      if (!vr.ok || !vj.ok) {
        setState({
          kind: "error",
          msg: ("error" in vj && vj.error) || "verification failed",
          paidIds, // keep around so user can retry without re-paying
        });
        return;
      }
      if (vj.product === "daily_vibe_unlock") {
        onUnlocked({ product: "daily_vibe_unlock", detailed: vj.detailed });
      } else {
        onUnlocked({ product: "compatibility_unlock", detailed: vj.detailed });
      }
      onOpenChange(false);
    } catch (err) {
      setState({
        kind: "error",
        msg: (err as Error).message ?? "verification failed",
        paidIds,
      });
    }
  }

  async function handlePay(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState({ kind: "error", msg: "drop a real email bestie" });
      return;
    }

    // if the user already paid + we just failed generation, retry without re-charging
    if (state.kind === "error" && state.paidIds) {
      await runVerify(state.paidIds);
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
        setState({
          kind: "error",
          msg: ("error" in order && order.error) || "couldn't create order",
        });
        return;
      }

      if (!window.Razorpay) {
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
          await runVerify({
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
          });
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

  const hasPaidIds = state.kind === "error" && !!state.paidIds;
  const isWorking =
    state.kind === "creating-order" ||
    state.kind === "razorpay-open" ||
    state.kind === "verifying";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-line-strong bg-popover text-paper sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="serif-italic text-2xl text-paper">
            {pricing.label}
          </DialogTitle>
          <DialogDescription className="text-paper-muted">
            {pricing.blurb}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handlePay} className="mt-4 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label className="label-meta">Email for receipt + keepsake PDF</Label>
            <Input
              type="email"
              required
              placeholder="your@email.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isWorking}
              className="h-11 rounded-none border-x-0 border-t-0 border-b border-line-strong bg-transparent px-0 text-base text-paper placeholder:text-paper-faint focus-visible:border-paper focus-visible:ring-0"
            />
          </div>

          {state.kind === "error" && (
            <div className="flex flex-col gap-2">
              <p role="alert" className="text-sm text-destructive">
                {state.msg}
              </p>
              {hasPaidIds && (
                <p className="text-[11px] text-paper-faint">
                  your payment went through. tap retry below — you won&rsquo;t be charged again.
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isWorking}
            className="h-12 w-full bg-paper text-base font-medium tracking-tight text-ink transition hover:bg-paper/90 disabled:cursor-wait disabled:opacity-70"
          >
            {state.kind === "creating-order" && "preparing checkout..."}
            {state.kind === "razorpay-open" && "complete payment..."}
            {state.kind === "verifying" && "writing your full read..."}
            {state.kind === "idle" && `pay ₹${amountRupees}`}
            {state.kind === "error" && (hasPaidIds ? "retry unlock (no charge)" : `pay ₹${amountRupees}`)}
          </button>

          <p className="text-center text-[11px] text-paper-faint">
            payment via razorpay (UPI, card, netbanking). full read unlocks on this page right after.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
