// Static handover checklist for the 8 finance connectors. Names match the
// bot's connector registry (imagine-ai-bot: src/finance/connectors/registry.ts)
// and are the `?source=` values for /internal/finance-sync-tick. Env var
// NAMES only — values never leave the bot.

export interface ConnectorMeta {
  name: string;
  label: string;
  description: string;
  requiredEnvVars: readonly string[];
  caveat?: string;
}

export const CONNECTORS: readonly ConnectorMeta[] = [
  {
    name: "whop",
    label: "Whop",
    description: "Payments, refunds, chargebacks, products, customers.",
    requiredEnvVars: ["WHOP_API_KEY", "WHOP_COMPANY_ID"],
  },
  {
    name: "fanbasis",
    label: "Fanbasis",
    description: "Transactions, refunds, chargebacks, customers.",
    requiredEnvVars: ["FANBASIS_API_KEY"],
  },
  {
    name: "meta",
    label: "Meta Ads",
    description: "Daily ad spend by campaign and ad account.",
    requiredEnvVars: ["META_ADS_ACCESS_TOKEN", "META_AD_ACCOUNT_IDS"],
  },
  {
    name: "google",
    label: "Google Ads",
    description: "Daily ad spend by campaign (incl. YouTube).",
    requiredEnvVars: [
      "GOOGLE_ADS_DEVELOPER_TOKEN",
      "GOOGLE_ADS_CLIENT_ID",
      "GOOGLE_ADS_CLIENT_SECRET",
      "GOOGLE_ADS_REFRESH_TOKEN",
      "GOOGLE_ADS_CUSTOMER_IDS",
    ],
  },
  {
    name: "cometly",
    label: "Cometly",
    description: "Attribution events and conversion data.",
    requiredEnvVars: ["COMETLY_API_KEY"],
    caveat:
      "Spend figures are not available via the Cometly API — ad spend comes from the Meta and Google connectors.",
  },
  {
    name: "iclosed",
    label: "iClosed",
    description: "Call bookings with status, timestamps, invitee email.",
    requiredEnvVars: ["ICLOSED_API_KEY"],
  },
  {
    name: "docusign",
    label: "DocuSign",
    description: "Contract envelopes: status, signer, sent/completed.",
    requiredEnvVars: [
      "DOCUSIGN_INTEGRATION_KEY",
      "DOCUSIGN_USER_ID",
      "DOCUSIGN_ACCOUNT_ID",
      "DOCUSIGN_RSA_PRIVATE_KEY",
    ],
  },
  {
    name: "ghl",
    label: "GHL",
    description: "Contacts (leads), appointments, pipelines/opportunities.",
    requiredEnvVars: ["GHL_API_KEY", "GHL_LOCATION_ID"],
  },
];
