import { createHash, timingSafeEqual } from "node:crypto";

type WompiTestConfig = {
  publicKey: string;
  integritySecret: string;
  eventsSecret: string;
};

type CheckoutData = {
  reference: string;
  amountInCents: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  region: string;
  redirectUrl: string;
};

export function getWompiTestConfig(): WompiTestConfig | null {
  const publicKey = process.env.WOMPI_PUBLIC_KEY;
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
  const eventsSecret = process.env.WOMPI_EVENTS_SECRET;

  if (
    !publicKey?.startsWith("pub_test_") ||
    !integritySecret?.startsWith("test_integrity_") ||
    !eventsSecret?.startsWith("test_events_")
  ) {
    return null;
  }

  return { publicKey, integritySecret, eventsSecret };
}

export function createWompiCheckoutUrl(data: CheckoutData) {
  const config = getWompiTestConfig();
  if (!config) throw new Error("WOMPI_SANDBOX_NOT_CONFIGURED");

  const integritySignature = createHash("sha256")
    .update(`${data.reference}${data.amountInCents}COP${config.integritySecret}`)
    .digest("hex");

  const checkoutUrl = new URL("https://checkout.wompi.co/p/");
  const params: Record<string, string> = {
    "public-key": config.publicKey,
    currency: "COP",
    "amount-in-cents": String(data.amountInCents),
    reference: data.reference,
    "signature:integrity": integritySignature,
    "redirect-url": data.redirectUrl,
    "customer-data:email": data.email,
    "customer-data:full-name": data.fullName,
    "customer-data:phone-number": data.phoneNumber,
    "shipping-address:address-line-1": data.address,
    "shipping-address:country": "CO",
    "shipping-address:city": data.city,
    "shipping-address:region": data.region,
    "shipping-address:phone-number": data.phoneNumber,
  };

  for (const [key, value] of Object.entries(params)) {
    checkoutUrl.searchParams.set(key, value);
  }

  return checkoutUrl.toString();
}

type WompiEvent = {
  event?: string;
  environment?: string;
  data?: Record<string, unknown>;
  signature?: { properties?: string[]; checksum?: string };
  timestamp?: number;
};

function getPropertyValue(data: Record<string, unknown>, path: string) {
  return path.split(".").reduce<unknown>((value, segment) => {
    if (value && typeof value === "object") {
      return (value as Record<string, unknown>)[segment];
    }
    return undefined;
  }, data);
}

export function verifyWompiTestEvent(event: WompiEvent, headerChecksum?: string | null) {
  const config = getWompiTestConfig();
  const properties = event.signature?.properties;
  const bodyChecksum = event.signature?.checksum;
  const receivedChecksum = headerChecksum || bodyChecksum;

  if (
    !config ||
    event.environment !== "test" ||
    !Array.isArray(properties) ||
    !Number.isFinite(event.timestamp) ||
    !receivedChecksum ||
    !/^[a-f0-9]{64}$/i.test(receivedChecksum)
  ) {
    return false;
  }

  if (headerChecksum && bodyChecksum && headerChecksum.toLowerCase() !== bodyChecksum.toLowerCase()) {
    return false;
  }

  const values = properties.map((property) => getPropertyValue(event.data ?? {}, property));
  if (values.some((value) => value === undefined || value === null)) return false;

  const checksum = createHash("sha256")
    .update(`${values.join("")}${event.timestamp}${config.eventsSecret}`)
    .digest();
  const received = Buffer.from(receivedChecksum, "hex");

  return checksum.length === received.length && timingSafeEqual(checksum, received);
}
