console.log("FPA V2.2.1");

const fpaDataReadyEvent = new Event("fpaDataReady");
const DEBUG = false;
function debugLog(message) {
  if (DEBUG) {
    console.log(message);
  }
}

const DOMAIN = window.location.hostname;
debugLog("Domain set to: " + DOMAIN);
const MAX_SESSIONS = 5;
const MAX_PAGEVIEWS = 25;

// AI engine referring logic
const AI_ENGINE_REGEX =
  /(\.|\/)(chatgpt|gemini.google|perplexity|claude|copilot.microsoft)\.(com|net|org|ai|co\.[a-z]{2}|com\.[a-z]{2})\//gm;
const AI_ENGINE_DOMAINS = [
  "chatgpt",
  "gemini",
  "perplexity",
  "claude",
  "copilot",
];

// Search engine referring logic
const SEARCH_ENGINE_REGEX =
  /(\.|\/)(google|bing|yahoo|baidu|yandex|duckduckgo|ecosia|startpage|ask|seznam|naver)\.(com|net|org|co\.[a-z]{2}|com\.[a-z]{2})\//gm;
const SEARCH_ENGINE_DOMAINS = [
  "google",
  "bing",
  "yahoo",
  "duckduckgo",
  "ecosia",
  "yandex",
  "baidu",
  "startpage",
  "ask",
  "seznam",
  "naver",
];

// Social media referring logic
const SOCIAL_MEDIA_REGEX =
  /(\.|\/)(facebook|instagram|youtube|linkedin|pinterest|reddit|tiktok|tumblr|quora|vimeo|twitch|medium|discord|snapchat|whatsapp|twitter|x|substack)\.(com|net|org|co\.[a-z]{2}|com\.[a-z]{2})/gm;
const SOCIAL_MEDIA_DOMAINS = [
  "linkedin",
  "facebook",
  "instagram",
  "reddit",
  "twitter",
  "x",
  "youtube",
  "pinterest",
  "tiktok",
  "tumblr",
  "quora",
  "vimeo",
  "twitch",
  "medium",
  "discord",
  "snapchat",
  "whatsapp",
  "substack",
];

/*** DEFINE MODEL ***/
var fpaDataTemplate = {
  cid: "",
  fact: 0, // first activity
  lact: 0, // last activity
  ga_cid: "", // GA Client ID
  hsu_id: "", // Hubspotut ID
  wf_attr: "", // Webflow custom attribute (user level)
  ses: [
    {
      sid: "", // Session ID
      pgc: 0, // Page count
      sst: 0, // Session start time
      tsos: "", // Time spent on site // set timeout
      ldp: "", // Landing page (session entry point)
      cpv: "", // Current Page View (can be used for Conversion page on form submit)
      ref: "", // Referring URL
      attr: {
        src: "", // UTM Source
        med: "", // UTM Medium
        cmp: "", // UTM Campaign
        trm: "", // UTM Term
        kwd: "", // UTM Keyword
        cnt: "", // UTM Content
      },
      ads: {
        // TODO: Ask paul if more paramters are needed
        gclid: "", // GCLID (Google Ads)
        // dcl_id: "", // DCLID (Doubleclick Ads)
        msclkid: "", // Microsoft Ads ID
        li_fat_id: "", // LinkedIn Ads ID
        fbclid: "", // Meta Ads ID
      },
      pvs: [
        {
          path: "", // Page path
          top: "", // Time on page
          pvst: 0, // Pageview start time
          expt: {
            eid: "", // Webflow Optimize Experiment ID
            ena: "", // Webflow Optimize Experiment Name
            etp: "", // Webflow Optimize Experiment Type
            vid: "", // Webflow Optimize Variant ID
            vna: "", // Webflow Optimize Variant Name
          },
        },
      ],
    },
  ],
};

/*** UTILITY FUNCTIONS ***/

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return seconds == 60
    ? minutes + 1 + ":00"
    : minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

function getObectSizeKB(obj) {
  if (typeof obj !== "object" || obj === null) {
    console.warn("Input is not a valid JavaScript object.");
    return null;
  }
  try {
    const jsonString = JSON.stringify(obj);
    const sizeInBytes = new Blob([jsonString]).size;
    const sizeInKB = sizeInBytes / 1024;
    return sizeInKB;
  } catch (e) {
    console.error("Error serializing or measuring object size:", e);
    return null;
  }
}

function extractDomain(referrerUrl, domainList) {
  if (!referrerUrl) return null;
  domainList.forEach((domain) => {
    if (url.includes(domain)) {
      return domain;
    }
    return null;
  });
}

/*** INITIALIZE LS ITEM ***/
function initFpaDataLsItem() {
  debugLog("-> initFpaDataLsItem()");
  if (!localStorage.getItem("_fpa_data")) {
    debugLog("FPA LS Item not found. Creating new LS Item.");
    const value = structuredClone(fpaDataTemplate);
    value.cid = crypto.randomUUID();
    value.fact = Date.now();
    localStorage.setItem("_fpa_data", JSON.stringify(value));
  }
  debugLog("initFpaDataLsItem() ->");
}

/*** UPDATE LS ITEM ***/
// 1. Update USER Level Data
function updateUserLevelData() {
  debugLog("-> updateUserLevelData()");
  window.fpaData.ga_cid =
    Cookies.get("_ga", { domain: DOMAIN }) || window.fpaData.ga_cid;

  // Populate HSU ID (If doesn't match, replace)
  // TODO: Test in Production
  window.fpaData.hsu_id =
    Cookies.get("hubspotutk", { domain: DOMAIN }) || window.fpaData.hsu_id;

  // TODO: LATER: Populate Wf Attribute (When we have a strategy ready)

  // If last session is 24+ hours old, create new session object and push to ses array.
  // TODO: if ses is more than 5 items long, remove the oldest session object.
  if (window.fpaData.lact) {
    const sessionExpired =
      // Date.now() - window.fpaData.lact > 24 * 60 * 60 * 1000;
      Date.now() - window.fpaData.lact > 5 * 60 * 1000;

    if (sessionExpired) {
      window.fpaData.ses.unshift(structuredClone(fpaDataTemplate.ses[0]));
      console.log("new session started");
    }

    if (window.fpaData.ses.length > MAX_SESSIONS) {
      window.fpaData.ses.length = MAX_SESSIONS;
      debugLog("old sessions removed to maintain max sessions");
    }
  }

  debugLog("updateUserLevelData() ->");
}

// 2. Update SESSION Level Data
function updateSessionLevelData() {
  debugLog("-> updateSessionLevelData()");
  if (!window.fpaData.ses[0].sid) {
    window.fpaData.ses[0].sid = crypto.randomUUID();
    window.fpaData.ses[0].sst = Date.now();
    window.fpaData.ses[0].ldp =
      window.fpaData.ses[0].ldp || window.location.pathname;
    window.fpaData.ses[0].ref = window.fpaData.ses[0].ref || document.referrer;
  }

  window.fpaData.ses[0].cpv = window.location.pathname;
  window.fpaData.ses[0].pgc += 1;
  debugLog("updateSessionLevelData() ->");
}

// 2.1 Populate ATTR Values
function populateAttrValues() {
  debugLog("-> populateAttrValues()");
  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);

  if (window.fpaData.ses[0].pvs.length > 1) {
    return; // Only run on first pageview of session
  }

  window.fpaData.ses[0].attr.src =
    window.fpaData.ses[0].attr.src || urlParams.get("utm_source");
  window.fpaData.ses[0].attr.med =
    window.fpaData.ses[0].attr.med || urlParams.get("utm_medium");
  window.fpaData.ses[0].attr.cmp =
    window.fpaData.ses[0].attr.cmp || urlParams.get("utm_campaign");
  window.fpaData.ses[0].attr.trm =
    window.fpaData.ses[0].attr.trm || urlParams.get("utm_term");
  window.fpaData.ses[0].attr.kwd =
    window.fpaData.ses[0].attr.kwd || urlParams.get("utm_keyword");
  window.fpaData.ses[0].attr.cnt =
    window.fpaData.ses[0].attr.cnt || urlParams.get("utm_content");

  debugLog("populateAttrValues() ->");
}

// 2.2 (If UTMs are empty, populate UTM values from from document.referrer etc)
// Only for first-touch of Session
function checkChannelAttribution() {
  debugLog("-> checkChannelAttribution()");

  if (window.fpaData.ses[0].pvs.length > 1) {
    return; // Only run on first pageview of session
  }

  // TODO: IF the utm gets poplated with just keyword, content, term, or campaign,
  // do we want src and med to stay empty? or put value in from the checkChannelAttribution()

  if (document.referrer === "") {
    window.fpaData.ses[0].attr.med = window.fpaData.ses[0].attr.med || "direct";
  } else if (AI_ENGINE_REGEX.test(document.referrer)) {
    window.fpaData.ses[0].attr.med =
      window.fpaData.ses[0].attr.med || "organic-ai";

    window.fpaData.ses[0].attr.src =
      window.fpaData.ses[0].attr.src ||
      extractDomain(document.referrer, AI_ENGINE_DOMAINS);
  } else if (SEARCH_ENGINE_REGEX.test(document.referrer)) {
    window.fpaData.ses[0].attr.med =
      window.fpaData.ses[0].attr.med || "organic-search";

    window.fpaData.ses[0].attr.src =
      window.fpaData.ses[0].attr.src ||
      extractDomain(document.referrer, SEARCH_ENGINE_DOMAINS);
  } else if (SOCIAL_MEDIA_REGEX.test(document.referrer)) {
    window.fpaData.ses[0].attr.med =
      window.fpaData.ses[0].attr.med || "organic-social";

    window.fpaData.ses[0].attr.src =
      window.fpaData.ses[0].attr.src ||
      extractDomain(document.referrer, SOCIAL_MEDIA_DOMAINS);
  } else {
    window.fpaData.ses[0].attr.med =
      window.fpaData.ses[0].attr.med || "web-referral";

    window.fpaData.ses[0].attr.src =
      window.fpaData.ses[0].attr.src || document.referrer;
  }

  debugLog("checkChannelAttribution() ->");
}

// 2.3 Populate ADS Values
function populateAdsValues() {
  debugLog("-> populateAdsValues()");
  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);

  // TODO: Adjust Names to match the URL Paramter Name (Once Confirmed)
  window.fpaData.ses[0].ads.gclid =
    window.fpaData.ses[0].ads.gclid || urlParams.get("gclid");
  // window.fpaData.ses[0].ads.dcl_id =
  //   window.fpaData.ses[0].ads.dcl_id || urlParams.get("dclid");
  window.fpaData.ses[0].ads.msclkid =
    window.fpaData.ses[0].ads.msclkid || urlParams.get("msclkid");
  window.fpaData.ses[0].ads.li_fat_id =
    window.fpaData.ses[0].ads.li_fat_id || urlParams.get("li_fat_id"); // TODO: Confirm with Paul all Param Names
  window.fpaData.ses[0].ads.fbclid =
    window.fpaData.ses[0].ads.fbclid || urlParams.get("fbclid");

  debugLog("populateAdsValues() ->");
}

// 3. Update PAGEVIEW Level Data
function updatePageviewData() {
  debugLog("-> updatePageviewData()");
  // Add new pageview object to pvs array
  let newPageview = structuredClone(fpaDataTemplate.ses[0].pvs[0]);
  newPageview.path = window.location.pathname;
  newPageview.pvst = Date.now();

  // Record Webflow Optimize Experiment and Variation Data if available
  // TODO: Troubleshoot why this isn't working as expected.
  wf.onVariationRecorded(function (result) {
    newPageview.expt.eid = result.experienceId || ""; // Webflow Optimize Experiment ID
    newPageview.expt.ena = result.experienceName || ""; // Webflow Optimize Experiment Name
    newPageview.expt.etp = result.experienceType || ""; // Webflow Optimize Experiment Type
    newPageview.expt.vid = result.variationId || ""; // Webflow Optimize Variant ID
    newPageview.expt.vna = result.variationName || ""; // Webflow Optimize Variant Name
  });

  if (!window.fpaData.ses[0].pvs[0].path) {
    window.fpaData.ses[0].pvs[0] = newPageview;
  } else {
    window.fpaData.ses[0].pvs.unshift(newPageview);
  }

  // If pvs is longer that max amount, remove the oldest pageview object.
  if (window.fpaData.ses[0].pvs.length > MAX_PAGEVIEWS) {
    window.fpaData.ses[0].pvs.length = MAX_PAGEVIEWS;
    debugLog("old pageviews removed to maintain max pageviews");
  }
  debugLog("updatePageviewData() ->");
}

/*****
 *** MAIN EXECUTION FLOW ***
 *****/

wf.ready(function () {
  // Initialize LS Item
  initFpaDataLsItem();

  // Read LS Item
  const itemValue = JSON.parse(localStorage.getItem("_fpa_data")); // Read LS Item and store in global variable
  window.fpaData = itemValue;
  debugLog("LS Item READ complete");

  // Update Global Variable fpaData
  updateUserLevelData();
  updateSessionLevelData();
  populateAttrValues();
  checkChannelAttribution();
  populateAdsValues();
  updatePageviewData();

  // Dispath event to signal form is ready to be populated with FPA Data
  window.dispatchEvent(fpaDataReadyEvent);

  // Write LS Item
  window.addEventListener("beforeunload", function () {
    // Time on Session, Time on Pageiew, and Last activity Record here
    window.fpaData.lact = Date.now();
    window.fpaData.ses[0].tsos = millisToMinutesAndSeconds(
      Date.now() - window.fpaData.ses[0].sst
    );
    window.fpaData.ses[0].pvs[0].top = millisToMinutesAndSeconds(
      Date.now() - window.fpaData.ses[0].pvs[0].pvst
    );

    // Write LS Item on page unload
    localStorage.setItem("_fpa_data", JSON.stringify(window.fpaData));
    debugLog("LS Item WRITE complete");

    // TODO: LATER: Consider using navigator.sendBeacon() for more reliable data sending. Send to Airtable?
  });
});
