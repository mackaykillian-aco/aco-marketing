console.log("FPA V1.2.4");

const DEBUG = true;
function debugLog(message) {
  if (DEBUG) {
    console.log(message);
  }
}

const DOMAIN = "awardco-stg.webflow.io";

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
      tsos: 0, // Time spent on site
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
        // TODO: Adjust Names to match the URL Paramter Name
        gcl_id: "", // GCLID (Google Ads)
        dcl_id: "", // DCLID (Doubleclick Ads)
        msft_id: "", // Microsoft Ads ID
        lnkd_id: "", // LinkedIn Ads ID
        meta_id: "", // Meta Ads ID
      },
      pvs: [
        {
          path: "", // Page path
          ttl: "", // Page title
          top: "", // Time on page
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

/*** INITIALIZE COOKIE ***/
function initFpaDataCookie() {
  debugLog("-> initFpaDataCookie()");
  if (!Cookies.get("_fpa_data")) {
    debugLog("FPA Cookie not found. Creating new cookie.");
    const value = structuredClone(fpaDataTemplate);
    value.cid = crypto.randomUUID();
    value.fact = Date.now();
    Cookies.set("_fpa_data", JSON.stringify(value), {
      expires: 183,
      path: "/",
    });
  }
  debugLog("initFpaDataCookie() ->");
}
initFpaDataCookie();

/*** READ COOKIE ***/
const cookieValue = JSON.parse(Cookies.get("_fpa_data")); // Read cookie and store in global variable
window.fpaData = cookieValue;
debugLog("Cookie READ complete");

/*** UPDATE COOKIE ***/
// 1. Update USER Level Data
function updateUserLevelData() {
  // Populate GA Client ID (If it's null keep as is)
  // TODO: Test in Production
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
      Date.now() - window.fpaData.lact > 24 * 60 * 60 * 1000;

    if (sessionExpired) {
      window.fpaData.ses.unshift(structuredClone(fpaDataTemplate.ses[0]));
      console.log("new session started");
    }
  }

  // Update last activity timestamp
  window.fpaData.lact = Date.now();
}

// 2. Update SESSION Level Data
function updateSessionLevelData() {
  debugLog("-> updateSessionLevelData()");
  if (!window.fpaData.ses[0].sid) {
    window.fpaData.ses[0].sid = crypto.randomUUID();
    window.fpaData.ses[0].sst = Date.now();
    window.fpaData.ses[0].ldp =
      window.fpaData.ses[0].ldp || window.location.pathname;
  }

  window.fpaData.ses[0].cpv = window.location.pathname;
  window.fpaData.ses[0].pgc += 1;
  window.fpaData.ses[0].tsos = Date.now() - window.fpaData.ses[0].sst; // We could only store the sst and subtract it from Date.now() when form submits
  debugLog("updateSessionLevelData() ->");
}

// 2.1 Populate ATTR Values
function populateAttrValues() {
  debugLog("-> populateAttrValues()");
  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);

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

// 2.2 Populate ADS Values
function populateAdsValues() {
  debugLog("-> populateAdsValues()");
  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);

  // TODO: Adjust Names to match the URL Paramter Name (Once Confirmed)
  window.fpaData.ses[0].ads.gcl_id =
    window.fpaData.ses[0].ads.gcl_id || urlParams.get("gclid");
  window.fpaData.ses[0].ads.dcl_id =
    window.fpaData.ses[0].ads.dcl_id || urlParams.get("dclid");
  window.fpaData.ses[0].ads.msft_id =
    window.fpaData.ses[0].ads.msft_id || urlParams.get("msclkid");
  window.fpaData.ses[0].ads.lnkd_id =
    window.fpaData.ses[0].ads.lnkd_id || urlParams.get("linkd"); // TODO: Confirm with Paul all Param Names
  window.fpaData.ses[0].ads.meta_id =
    window.fpaData.ses[0].ads.meta_id || urlParams.get("fbclid");

  debugLog("populateAdsValues() ->");
}

// 3. Update PAGEVIEW Level Data

// 3.1 Populate EXPT Values

// 4. Execute Update Functions In Order
updateUserLevelData();
updateSessionLevelData();
populateAttrValues();
populateAdsValues();

/*** WRITE COOKIE ***/
window.addEventListener("beforeunload", function () {
  // Write cookie on page unload
  Cookies.set("_fpa_data", JSON.stringify(window.fpaData), {
    expires: 183,
    path: "/",
  });
  debugLog("Cookie WRITE complete");

  // TODO: LATER: Consider using navigator.sendBeacon() for more reliable data sending
});
