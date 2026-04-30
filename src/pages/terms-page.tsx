import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

type Section = {
  id: string;
  title: string;
};

const sections: Section[] = [
  { id: "introduction", title: "1. Introduction" },
  { id: "eligibility", title: "2. Eligibility" },
  { id: "account", title: "3. Account & User Responsibilities" },
  { id: "products", title: "4. Product Information" },
  { id: "orders-payment", title: "5. Orders, Pricing & Payment" },
  { id: "shipping", title: "6. Shipping & Delivery" },
  { id: "returns", title: "7. Returns, Exchanges & Refunds" },
  { id: "cancellation", title: "8. Order Cancellation" },
  { id: "intellectual-property", title: "9. Intellectual Property" },
  { id: "prohibited-uses", title: "10. Prohibited Uses" },
  { id: "third-party", title: "11. Third-Party Links" },
  { id: "liability", title: "12. Limitation of Liability" },
  { id: "indemnification", title: "13. Indemnification" },
  { id: "privacy", title: "14. Privacy" },
  { id: "governing-law", title: "15. Governing Law" },
  { id: "changes", title: "16. Changes to These Terms" },
  { id: "contact", title: "17. Contact Us" },
];

const EFFECTIVE_DATE = "April 30, 2026";

const TermsPage = () => {
  const [activeId, setActiveId] = useState<string>(sections[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).offsetTop -
              (b.target as HTMLElement).offsetTop,
          );
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 mb-2">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#DEF0F9] to-[#FDEBEC] border-b border-gray-200 p-2 mb-2">
        <div className="container-custom py-12 sm:py-16 lg:py-20">
          <div className="px-2 sm:px-4 lg:px-8">
            <nav
              aria-label="Breadcrumb"
              className="text-sm text-gray-500 mb-3 flex items-center gap-2"
            >
              <Link to="/" className="hover:text-[#FF6600] transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-gray-700">Terms &amp; Conditions</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
              Terms &amp; Conditions
            </h1>
            <p className="text-gray-600 max-w-3xl">
              Please read these Terms &amp; Conditions carefully before using
              the Aurevo Fashion website. By accessing or placing an order
              through our site, you agree to be bound by these Terms.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              <span className="font-medium text-gray-700">Effective Date:</span>{" "}
              {EFFECTIVE_DATE}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container-custom py-10 sm:py-14 lg:py-16 pb-16 sm:pb-20 lg:pb-24">
        <div className="px-2 sm:px-4 lg:px-8 lg:grid lg:grid-cols-12 lg:gap-10">
          {/* Sidebar Table of Contents */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  On this page
                </h2>
                <ul className="space-y-1.5 text-sm">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className={`block py-1.5 pl-3 border-l-2 transition-colors ${
                          activeId === s.id
                            ? "border-[#FF6600] text-[#FF6600] font-medium"
                            : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                        }`}
                      >
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-8 xl:col-span-9">
            <article className="bg-white rounded-xl border border-gray-200 p-6 sm:p-10">
              <div className="prose-content space-y-10 text-gray-700 leading-relaxed">
                <Section id="introduction" title="1. Introduction">
                  <p>
                    Welcome to <strong>Aurevo Fashion</strong>{" "}
                    (&ldquo;Aurevo,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo;
                    or &ldquo;us&rdquo;). Aurevo Fashion is an online clothing
                    and lifestyle store based in Bangladesh, offering apparel
                    and footwear for men, women, and kids.
                  </p>
                  <p>
                    These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern
                    your access to and use of our website, mobile-friendly
                    pages, and all related services (collectively, the
                    &ldquo;Site&rdquo;). By browsing the Site, creating an
                    account, or placing an order, you acknowledge that you have
                    read, understood, and agreed to these Terms, our{" "}
                    <Link
                      to="/privacy"
                      className="text-[#FF6600] hover:text-[#E65C00] underline"
                    >
                      Privacy Policy
                    </Link>
                    , and all applicable laws of the People&apos;s Republic of
                    Bangladesh, including the Consumer Rights Protection Act,
                    2009 and the Information &amp; Communication Technology
                    (ICT) Act, 2006 (as amended).
                  </p>
                  <p>
                    If you do not agree with any part of these Terms, please
                    discontinue use of the Site immediately.
                  </p>
                </Section>

                <Section id="eligibility" title="2. Eligibility">
                  <p>To use our services, you must:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Be at least <strong>18 years old</strong>, or use the Site
                      under the supervision of a parent or legal guardian who
                      accepts these Terms on your behalf.
                    </li>
                    <li>
                      Provide accurate, current, and complete information when
                      placing an order or registering an account.
                    </li>
                    <li>
                      Have the legal capacity to enter into a binding contract
                      under the laws of Bangladesh.
                    </li>
                  </ul>
                  <p>
                    We reserve the right to refuse service, suspend or cancel
                    accounts, or cancel orders at our sole discretion if we
                    believe these Terms or applicable laws have been violated.
                  </p>
                </Section>

                <Section
                  id="account"
                  title="3. Account & User Responsibilities"
                >
                  <p>
                    Some features of the Site require you to create an account.
                    When you do, you agree to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Keep your login credentials (email and password)
                      confidential and not share them with any third party.
                    </li>
                    <li>
                      Be solely responsible for all activities that occur under
                      your account.
                    </li>
                    <li>
                      Notify us immediately of any unauthorized use of your
                      account or any other breach of security.
                    </li>
                    <li>
                      Keep your shipping address, contact number, and email up
                      to date so we can fulfill your orders correctly.
                    </li>
                  </ul>
                  <p>
                    Aurevo will not be liable for any loss or damage arising
                    from your failure to safeguard your account credentials.
                  </p>
                </Section>

                <Section id="products" title="4. Product Information">
                  <p>
                    We make every reasonable effort to display the colors,
                    sizes, materials, and other details of products as
                    accurately as possible. However:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Slight variations in color, fabric, or finish may occur
                      due to your screen settings, photography, lighting, or
                      manufacturing batches.
                    </li>
                    <li>
                      All products are subject to availability. If an item is
                      out of stock after you place an order, we will notify you
                      and offer a replacement, store credit, or full refund.
                    </li>
                    <li>
                      We reserve the right to correct errors in product
                      descriptions, sizes, or images at any time without prior
                      notice.
                    </li>
                  </ul>
                </Section>

                <Section
                  id="orders-payment"
                  title="5. Orders, Pricing & Payment"
                >
                  <p>
                    All prices on the Site are listed in{" "}
                    <strong>Bangladeshi Taka (BDT / ৳)</strong> and, unless
                    otherwise stated, are inclusive of applicable VAT. Prices,
                    discounts, and promotions are subject to change without
                    prior notice.
                  </p>
                  <p>We accept the following payment methods:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>bKash</strong> and <strong>Nagad</strong> (mobile
                      financial services)
                    </li>
                    <li>
                      <strong>Visa</strong> and <strong>MasterCard</strong>{" "}
                      debit/credit cards via our secure payment gateway
                    </li>
                    <li>
                      <strong>Cash on Delivery (COD)</strong> where available
                      (subject to location and order value)
                    </li>
                  </ul>
                  <p>
                    By placing an order, you confirm that the payment
                    information you provide is true and that you are authorized
                    to use the payment method. An order is only confirmed once
                    you receive a confirmation message or email from Aurevo. We
                    reserve the right to refuse or cancel any order due to
                    pricing errors, suspected fraud, payment failure, or stock
                    issues, with a full refund issued through the original
                    payment method within a reasonable timeframe.
                  </p>
                </Section>

                <Section id="shipping" title="6. Shipping & Delivery">
                  <p>
                    Aurevo Fashion delivers across Bangladesh through trusted
                    third-party courier partners. Estimated delivery times are:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Inside Dhaka:</strong> 2–3 working days
                    </li>
                    <li>
                      <strong>Outside Dhaka:</strong> 3–5 working days
                    </li>
                    <li>
                      <strong>Remote areas:</strong> up to 7 working days
                    </li>
                  </ul>
                  <p>
                    Delivery charges are calculated at checkout based on your
                    location and order weight. Delivery times are estimates
                    only, and we are not liable for delays caused by courier
                    partners, traffic, weather, public holidays, strikes, or
                    other circumstances beyond our reasonable control. Risk in
                    the goods passes to you upon delivery to the address you
                    provided.
                  </p>
                  <p>
                    You are responsible for providing an accurate delivery
                    address. Failed deliveries due to incorrect addresses or
                    unreachable contact numbers may incur a re-delivery fee.
                  </p>
                </Section>

                <Section id="returns" title="7. Returns, Exchanges & Refunds">
                  <p>
                    Your satisfaction matters to us. We accept returns and
                    exchanges under the following conditions:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Items must be returned within{" "}
                      <strong>7 days of delivery</strong> if they are defective,
                      damaged, or different from what was ordered.
                    </li>
                    <li>
                      Products must be <strong>unused, unwashed</strong>, and
                      returned in their original packaging with all tags
                      attached.
                    </li>
                    <li>
                      For hygiene reasons, items such as innerwear, socks, and
                      pierced jewelry are <strong>not eligible</strong> for
                      return or exchange.
                    </li>
                    <li>
                      Sale, clearance, or customized items are{" "}
                      <strong>final sale</strong> and cannot be returned or
                      exchanged unless they arrive defective.
                    </li>
                  </ul>
                  <p>
                    Approved refunds will be processed via the original payment
                    method within <strong>7–10 business days</strong> of us
                    receiving the returned item, or as store credit at your
                    option. You are responsible for inspecting your order at the
                    time of delivery; please raise any visible damage or
                    incorrect items <strong>before</strong> the deliveryman
                    leaves your premises.
                  </p>
                  <p>
                    To initiate a return, contact us at{" "}
                    <a
                      href="mailto:aurevofashion88@gmail.com"
                      className="text-[#FF6600] hover:text-[#E65C00] underline"
                    >
                      aurevofashion88@gmail.com
                    </a>{" "}
                    with your order number and photos of the item.
                  </p>
                </Section>

                <Section id="cancellation" title="8. Order Cancellation">
                  <p>
                    You may request cancellation of an order before it is
                    dispatched by contacting our customer support team. Once an
                    order has been handed over to the courier, it can no longer
                    be cancelled and will need to be processed under our Returns
                    &amp; Refunds policy.
                  </p>
                  <p>
                    Aurevo Fashion reserves the right to cancel any order at any
                    time, with or without notice, including (but not limited to)
                    cases of:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Stock unavailability</li>
                    <li>Pricing or product description errors</li>
                    <li>Suspected fraudulent activity</li>
                    <li>Inability to verify shipping information</li>
                  </ul>
                </Section>

                <Section
                  id="intellectual-property"
                  title="9. Intellectual Property"
                >
                  <p>
                    All content on the Site — including but not limited to the{" "}
                    <strong>Aurevo</strong> name, logo, trademarks, product
                    designs, photography, illustrations, text, graphics, icons,
                    layouts, and software — is the exclusive property of Aurevo
                    Fashion or its licensors and is protected under the
                    copyright, trademark, and intellectual property laws of
                    Bangladesh and applicable international treaties.
                  </p>
                  <p>
                    You may not copy, reproduce, modify, distribute, transmit,
                    display, sell, license, or otherwise exploit any content
                    from the Site without our prior written consent.
                    Unauthorized use may result in legal action.
                  </p>
                </Section>

                <Section id="prohibited-uses" title="10. Prohibited Uses">
                  <p>You agree not to use the Site to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Violate any local, national, or international law</li>
                    <li>
                      Submit false, misleading, or fraudulent information,
                      including fake orders or addresses
                    </li>
                    <li>
                      Upload viruses, malware, or any other malicious code
                    </li>
                    <li>
                      Attempt to gain unauthorized access to any portion of the
                      Site, our systems, or other users&apos; accounts
                    </li>
                    <li>
                      Use automated tools (bots, scrapers, crawlers) to extract
                      data from the Site without permission
                    </li>
                    <li>Harass, abuse, or harm another person or our staff</li>
                  </ul>
                  <p>
                    We reserve the right to terminate access and pursue legal
                    remedies for any violation.
                  </p>
                </Section>

                <Section id="third-party" title="11. Third-Party Links">
                  <p>
                    The Site may contain links to third-party websites,
                    services, or social media platforms (e.g., Facebook,
                    Instagram, YouTube, TikTok) that are not owned or controlled
                    by Aurevo Fashion. We are not responsible for the content,
                    policies, or practices of any third-party sites. We
                    recommend reviewing the terms and privacy policies of any
                    external service you visit.
                  </p>
                </Section>

                <Section id="liability" title="12. Limitation of Liability">
                  <p>
                    To the fullest extent permitted by applicable law, Aurevo
                    Fashion, its directors, employees, partners, and affiliates
                    shall not be liable for any:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Indirect, incidental, special, consequential, or punitive
                      damages
                    </li>
                    <li>
                      Loss of profits, revenue, data, or goodwill arising from
                      your use of the Site or our products
                    </li>
                    <li>
                      Delays, errors, or interruptions caused by third-party
                      payment processors, couriers, internet service providers,
                      or other parties beyond our control
                    </li>
                    <li>
                      Damage resulting from misuse of products or failure to
                      follow care instructions
                    </li>
                  </ul>
                  <p>
                    In any event, our total liability to you for any claim
                    arising out of or related to your use of the Site shall not
                    exceed the amount you paid for the specific product giving
                    rise to the claim.
                  </p>
                </Section>

                <Section id="indemnification" title="13. Indemnification">
                  <p>
                    You agree to defend, indemnify, and hold harmless Aurevo
                    Fashion and its officers, employees, and affiliates from and
                    against any claims, liabilities, damages, losses, and
                    expenses (including reasonable legal fees) arising out of or
                    in any way connected with your breach of these Terms, your
                    misuse of the Site, or your violation of any law or
                    third-party right.
                  </p>
                </Section>

                <Section id="privacy" title="14. Privacy">
                  <p>
                    Your use of the Site is also governed by our{" "}
                    <Link
                      to="/privacy"
                      className="text-[#FF6600] hover:text-[#E65C00] underline"
                    >
                      Privacy Policy
                    </Link>
                    , which describes how we collect, use, and protect your
                    personal information. By using the Site, you consent to such
                    collection and use of data in accordance with the Privacy
                    Policy.
                  </p>
                </Section>

                <Section id="governing-law" title="15. Governing Law">
                  <p>
                    These Terms are governed by and construed in accordance with
                    the laws of the{" "}
                    <strong>People&apos;s Republic of Bangladesh</strong>,
                    without regard to its conflict-of-law principles. Any
                    dispute, claim, or controversy arising out of or in
                    connection with these Terms or your use of the Site shall
                    first be sought to be resolved amicably through good-faith
                    negotiation. Failing that, the dispute shall be subject to
                    the exclusive jurisdiction of the competent courts of{" "}
                    <strong>Dhaka, Bangladesh</strong>.
                  </p>
                </Section>

                <Section id="changes" title="16. Changes to These Terms">
                  <p>
                    We may update or modify these Terms from time to time to
                    reflect changes in our business practices, technology, or
                    legal requirements. The revised Terms will be posted on this
                    page with an updated &ldquo;Effective Date.&rdquo; Material
                    changes will be highlighted where appropriate.
                  </p>
                  <p>
                    Your continued use of the Site after any changes constitutes
                    your acceptance of the revised Terms. If you do not agree
                    with the changes, you must stop using the Site.
                  </p>
                </Section>

                <Section id="contact" title="17. Contact Us">
                  <p>
                    If you have any questions, concerns, or feedback regarding
                    these Terms &amp; Conditions, please reach out to us:
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-2 text-sm">
                    <p>
                      <strong>Aurevo Fashion</strong>
                    </p>
                    <p>
                      <span className="text-gray-500">Address:</span> Chowmohani
                      DB Road, Noakhali, Bangladesh
                    </p>
                    <p>
                      <span className="text-gray-500">Email:</span>{" "}
                      <a
                        href="mailto:aurevofashion88@gmail.com"
                        className="text-[#FF6600] hover:text-[#E65C00] underline"
                      >
                        aurevofashion88@gmail.com
                      </a>
                    </p>
                    <p>
                      <span className="text-gray-500">Phone:</span>{" "}
                      <a
                        href="tel:+8801887375148"
                        className="text-[#FF6600] hover:text-[#E65C00] underline"
                      >
                        +880 1887-375148
                      </a>
                    </p>
                    <p>
                      <span className="text-gray-500">WhatsApp:</span>{" "}
                      <a
                        href="https://wa.me/8801897919363"
                        className="text-[#FF6600] hover:text-[#E65C00] underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        +880 1897-919363
                      </a>
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    By continuing to use Aurevo Fashion, you acknowledge that
                    you have read, understood, and agreed to these Terms &amp;
                    Conditions.
                  </p>
                </Section>
              </div>
            </article>
          </main>
        </div>
      </div>
    </div>
  );
};

const Section = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
};

export default TermsPage;
