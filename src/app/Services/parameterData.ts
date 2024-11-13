export const parameterData = {
  CONVERSION_TEMPLATE: {
    "galleryReference": {
      "host": "github.com",
      "owner": "EdinCuturic",
      "repository": "awin-conversion-tag-google-tag-manager",
      "version": "bb41feaa441206bfcb866430049501712d7e677a",
      "signature": "14d834b02db24822aa85adc85398c3e7f159baa3a8b3167bcb337354f3b3bfd7"
    } 
  },
  LASTCLICK_TEMPLATE: {
    "galleryReference": {
      "host": "github.com",
      "owner": "Allan-Urique",
      "repository": "GTM_CustomTag_AwinLastClickIdentifier",
      "version": "81344ca07ca7d1aa3f8ae8cdf0e05eab8d10000f",
      "signature": "6358e68e02efef27eed974d32135e5cf389893b7ad5a2e153f3de1b86cc84c17"
    } 
  },
  MASTERTAG_TEMPLATE: {
    "galleryReference": {
      "host": "github.com",
      "owner": "EdinCuturic",
      "repository": "awin-advertiser-mastertag-google-tag-manager",
      "version": "a55a42b33783bbf2dbe7b019608845b5786119d0",
      "signature": "2c981c400a0e56e33573bb8c2ae57a73aff90ec0511d6443bac7e85eb0a0c834"
    } 
  },
  LASTCLICK_TAG: [{ key: 'sourceParameters', type: 'template', value: 'utm_source,source,gclid,fbclid' },
  { key: 'awinSource', type: 'template', value: 'awin' },
  { key: 'overwriteCookieDomain', type: 'boolean', value: 'false' },
  { key: 'cookiePeriod', type: 'template', value: '30' },
  { key: 'cookieName', type: 'template', value: 'AwinChannelCookie' },
  { key: 'organicFilter', type: 'boolean', value: 'false' }],
} as const;