import { InfoPageLayout } from "@/components/info-page-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_PATHS } from "@/constants/app-paths";
import { usePublicTracking } from "@/services/courier/use-courier-query";
import { useState } from "react";
import { Link } from "react-router-dom";

const SUPPORT_EMAIL = "aurevofashion88@gmail.com";
const SUPPORT_PHONE_PRIMARY = "01887-375148";
const SUPPORT_PHONE_SECONDARY = "01752-600246";
const SUPPORT_WHATSAPP = "01897-919363";

/** Customer help — support, delivery, payment, tracking (small-brand tone). */

export function SupportPage() {
  return (
    <InfoPageLayout title="Customer support" breadcrumbPage="24/7 Support">
      <p>
        We are a small team based in Dhaka, but we read every message. If
        something does not look right with your order, sizing, or delivery,
        reach out and we will sort it out with you directly.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 pt-2">How to reach us</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <span className="font-medium text-gray-800">Email: </span>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-gray-900 underline decoration-gray-300 underline-offset-2 hover:text-[#FF6600] hover:decoration-[#FF6600]"
          >
            {SUPPORT_EMAIL}
          </a>
          <span className="block text-sm text-gray-500 mt-1">
            Best for order questions, photos, and anything you need in writing.
          </span>
        </li>
        <li>
          <span className="font-medium text-gray-800">Phone: </span>
          <a
            href="tel:+8801887375148"
            className="text-gray-900 underline decoration-gray-300 underline-offset-2 hover:text-[#FF6600]"
          >
            {SUPPORT_PHONE_PRIMARY}
          </a>
          <span className="text-gray-500"> · </span>
          <a
            href="tel:+8801752600246"
            className="text-gray-900 underline decoration-gray-300 underline-offset-2 hover:text-[#FF6600]"
          >
            {SUPPORT_PHONE_SECONDARY}
          </a>
        </li>
        <li>
          <span className="font-medium text-gray-800">WhatsApp: </span>
          <a
            href="https://wa.me/+8801897919363"
            className="text-gray-900 underline decoration-gray-300 underline-offset-2 hover:text-[#FF6600]"
            target="_blank"
            rel="noopener noreferrer"
          >
            {SUPPORT_WHATSAPP}
          </a>
          <span className="block text-sm text-gray-500 mt-1">
            Quick questions and delivery updates during the day.
          </span>
        </li>
      </ul>
      <p className="text-sm text-gray-500">
        We aim to reply within one business day, often sooner. If you message
        late at night, we will pick it up the next morning.
      </p>
      <p>
        <Link
          to={APP_PATHS.products}
          className="text-sm font-medium text-gray-900 border-b border-gray-900 pb-0.5 hover:text-[#FF6600] hover:border-[#FF6600] transition-colors"
        >
          Continue shopping
        </Link>
      </p>
    </InfoPageLayout>
  );
}

export function ShippingPage() {
  return (
    <InfoPageLayout title="Delivery & shipping" breadcrumbPage="Fast Delivery">
      <p>
        We pack orders carefully from our Dhaka workspace and hand them to
        trusted courier partners. Delivery times depend on your area and
        courier workload—especially before holidays—so we always share realistic
        expectations when you check out.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 pt-2">Inside Dhaka</h2>
      <p>
        Most orders arrive within{" "}
        <span className="font-medium text-gray-800">2–4 working days</span>{" "}
        after dispatch. You will receive contact from the courier when your
        parcel is out for delivery.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 pt-2">Outside Dhaka</h2>
      <p>
        Nationwide delivery usually takes a few extra days depending on
        destination. If your area is hard to reach, we may confirm by phone or
        WhatsApp before sending.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 pt-2">Fees</h2>
      <p>
        Shipping charges (if any) are shown at checkout before you pay. We
        keep them as low as we can for a small operation.
      </p>
      <p className="text-sm text-gray-500">
        Questions about your parcel? Use{" "}
        <Link
          to={APP_PATHS.support}
          className="text-gray-800 underline underline-offset-2 hover:text-[#FF6600]"
        >
          Customer support
        </Link>{" "}
        with your order number handy.
      </p>
    </InfoPageLayout>
  );
}

export function PaymentPage() {
  return (
    <InfoPageLayout title="Payments" breadcrumbPage="Online Payment">
      <p>
        <span className="font-medium text-gray-800">
          Cash on delivery (COD)
        </span>{" "}
        is our preferred way to pay at the door—simple for you and easy to
        reconcile for a small team. Other options (mobile banking, cards) may
        appear when needed, for example advance delivery charges. Your
        total—including any delivery fee—is always confirmed before you pay.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 pt-2">Cash on delivery</h2>
      <p>
        If COD is available for your order, the courier will collect payment when
        they deliver. Please keep exact change when possible—it helps drivers
        move faster on busy routes.
      </p>
      <p className="text-sm text-gray-500">
        If a payment fails or looks wrong, call{" "}
        <a
          href="tel:+8801752600246"
          className="text-gray-800 underline underline-offset-2 hover:text-[#FF6600]"
        >
          {SUPPORT_PHONE_SECONDARY}
        </a>{" "}
        or{" "}
        <a
          href="tel:+8801887375148"
          className="text-gray-800 underline underline-offset-2 hover:text-[#FF6600]"
        >
          {SUPPORT_PHONE_PRIMARY}
        </a>{" "}
        with your order details—we usually resolve payment issues fastest by
        phone. If you prefer email, write to{" "}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-gray-800 underline underline-offset-2 hover:text-[#FF6600]"
        >
          {SUPPORT_EMAIL}
        </a>{" "}
        with a screenshot and we will help.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 pt-2">Mobile banking</h2>
      <p>
        bKash, Nagad, and similar methods may be offered depending on our
        current setup. Follow the on-screen instructions and keep your
        transaction ID until your order is marked paid.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 pt-2">Cards</h2>
      <p>
        When card payment is enabled, charges are processed securely through our
        payment partner. We never store your full card number on our servers.
      </p>
    </InfoPageLayout>
  );
}

function formatTrackingDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TrackingLookup() {
  const [inputValue, setInputValue] = useState("");
  const [submittedCode, setSubmittedCode] = useState("");
  const { data: tracking, isLoading, isError } = usePublicTracking(submittedCode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedCode(inputValue.trim());
  };

  return (
    <div className="not-prose">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter your tracking code"
          aria-label="Tracking code"
        />
        <Button type="submit" disabled={!inputValue.trim()}>
          Track
        </Button>
      </form>

      {isLoading && submittedCode && (
        <p className="text-sm text-gray-500 mt-4">Looking up your parcel...</p>
      )}

      {isError && submittedCode && (
        <p className="text-sm text-red-600 mt-4">
          We couldn't find a parcel with that tracking code. Double-check it, or{" "}
          <Link
            to={APP_PATHS.support}
            className="font-medium underline decoration-gray-300 underline-offset-2 hover:text-[#FF6600]"
          >
            contact support
          </Link>
          .
        </p>
      )}

      {tracking && (
        <div className="mt-6 rounded-lg border border-gray-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Status</span>
            <Badge variant="outline" className="capitalize">
              {tracking.courier_status ?? tracking.order_status ?? "Processing"}
            </Badge>
          </div>
          {tracking.estimated_delivery_date && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Estimated delivery</span>
              <span className="text-sm text-gray-900">{tracking.estimated_delivery_date}</span>
            </div>
          )}
          {tracking.events.length > 0 && (
            <ul className="space-y-3 pt-2 border-t border-gray-100">
              {tracking.events
                .slice()
                .reverse()
                .map((event, i) => (
                  <li key={i} className="text-sm border-l-2 border-gray-200 pl-3">
                    <div className="flex items-center gap-2">
                      {event.status && (
                        <span className="font-medium text-gray-900 capitalize">{event.status}</span>
                      )}
                      <span className="text-xs text-gray-400">{formatTrackingDate(event.event_at)}</span>
                    </div>
                    {event.message && <p className="text-gray-600">{event.message}</p>}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function TrackingPage() {
  return (
    <InfoPageLayout title="Order tracking" breadcrumbPage="Tracking">
      <TrackingLookup />
      <p>
        After you place an order, you will see a confirmation screen with your
        order details. We update status as your parcel moves—when you ordered
        while signed in, you can also follow progress from your account.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 pt-2">Signed-in orders</h2>
      <p>
        Open your{" "}
        <Link
          to={APP_PATHS.dashboard}
          className="font-medium text-gray-900 underline decoration-gray-300 underline-offset-2 hover:text-[#FF6600]"
        >
          Dashboard
        </Link>{" "}
        to see recent orders, status, and a link back to your confirmation page.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 pt-2">Guest checkout</h2>
      <p>
        Save the confirmation link from your browser or the email we send (if
        configured). For status updates, message us on{" "}
        <span className="font-medium text-gray-800">WhatsApp</span> or email with
        your order number so we can look it up quickly.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 pt-2">Need a human?</h2>
      <p>
        <Link
          to={APP_PATHS.support}
          className="text-gray-900 underline decoration-gray-300 underline-offset-2 hover:text-[#FF6600]"
        >
          Contact support
        </Link>{" "}
        — we are happy to tell you exactly where your package is.
      </p>
    </InfoPageLayout>
  );
}
