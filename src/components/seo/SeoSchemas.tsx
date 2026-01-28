import { useMemo } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";

function safeNumber(value: unknown, fallback: number | null = null) {
  const n = Number(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

export function SeoSchemas() {
  const { data: content } = useSiteContent(true);

  const baseUrl =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://her-well-being.lovable.app";

  const price = safeNumber(content?.price, null);
  const productName = String(content?.product_name || "Home Doctor ই-বুক");
  const productDescription = String(
    content?.product_description ||
      "নারীর স্বাস্থ্য/গাইনোকোলজি সম্পর্কিত জরুরি তথ্য—সহজ ভাষায় সাজানো একটি ই-বুক।"
  );

  const orgJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Home Doctor",
      url: `${baseUrl}/`,
    }),
    [baseUrl]
  );

  const productJsonLd = useMemo(() => {
    const offer =
      price && price > 0
        ? {
            "@type": "Offer",
            priceCurrency: "BDT",
            price,
            url: `${baseUrl}/order`,
            availability: "https://schema.org/InStock",
          }
        : undefined;

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: productName,
      description: productDescription,
      brand: {
        "@type": "Brand",
        name: "Home Doctor",
      },
      offers: offer,
    };
  }, [baseUrl, price, productDescription, productName]);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
    </>
  );
}
