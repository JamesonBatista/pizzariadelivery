import { appConfig } from "../config/appConfig.js";

export function formatCurrency(value) {
  return new Intl.NumberFormat(appConfig.locale, {
    style: "currency",
    currency: appConfig.currency
  }).format(value);
}
