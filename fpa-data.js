console.log("FPA V1.2.12");

const DEBUG = true;
function debugLog(message) {
  if (DEBUG) {
    console.log(message);
  }
}

const DOMAIN = "awardco-stg.webflow.io";
const MAX_SESSIONS = 5;
const MAX_PAGEVIEWS = 20;

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
      tsos: "", // Time spent on site
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

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return seconds == 60
    ? minutes + 1 + ":00"
    : minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

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

    if (window.fpaData.ses.length > MAX_SESSIONS) {
      window.fpaData.ses.length = MAX_SESSIONS;
      debugLog("old sessions removed to maintain max sessions");
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
function updatePageviewData() {
  debugLog("-> updatePageviewData()");
  // Add new pageview object to pvs array
  let newPageview = structuredClone(fpaDataTemplate.ses[0].pvs[0]);
  newPageview.path = window.location.pathname;
  newPageview.ttl = document.title;
  newPageview.pvst = Date.now();

  // Record Webflow Optimize Experiment and Variation Data if available
  //   wf.onVariationRecorded(function (result) {
  //     newPageview.expt.eid = result.experienceId || ""; // Webflow Optimize Experiment ID
  //     newPageview.expt.ena = result.experienceName || ""; // Webflow Optimize Experiment Name
  //     newPageview.expt.etp = result.experienceType || ""; // Webflow Optimize Experiment Type
  //     newPageview.expt.vid = result.variationId || ""; // Webflow Optimize Variant ID
  //     newPageview.expt.vna = result.variationName || ""; // Webflow Optimize Variant Name
  //   });

  if (!window.fpaData.ses[0].pvs[0].path) {
    window.fpaData.ses[0].pvs[0] = newPageview;
  } else {
    window.fpaData.ses[0].pvs.unshift(newPageview);
  }

  // If pvs is more than 20 items long, remove the oldest pageview object.
  if (window.fpaData.ses[0].pvs.length > MAX_PAGEVIEWS) {
    window.fpaData.ses[0].pvs.length = MAX_PAGEVIEWS;
    debugLog("old pageviews removed to maintain max pageviews");
  }
}

/*****
 *** MAIN EXECUTION FLOW ***
 *****/

wf.ready(function () {
  // Initialize Cookie
  initFpaDataCookie();

  // Read Cookie
  const cookieValue = JSON.parse(Cookies.get("_fpa_data")); // Read cookie and store in global variable
  window.fpaData = cookieValue;
  debugLog("Cookie READ complete");

  // Update Global Variable fpaData
  updateUserLevelData();
  updateSessionLevelData();
  populateAttrValues();
  populateAdsValues();
  updatePageviewData();

  // Write Cookie
  window.addEventListener("beforeunload", function () {
    // Time on Session, Time on Pageiew, and Last activity Record here
    window.fpaData.lact = Date.now();
    window.fpaData.ses[0].tsos = millisToMinutesAndSeconds(
      Date.now() - window.fpaData.ses[0].sst
    );
    window.fpaData.ses[0].pvs[0].top = millisToMinutesAndSeconds(
      Date.now() - window.fpaData.ses[0].pvs[0].pvst
    );

    // Write cookie on page unload
    Cookies.set("_fpa_data", JSON.stringify(window.fpaData), {
      expires: 183,
      path: "/",
    });
    debugLog("Cookie WRITE complete");

    // TODO: LATER: Consider using navigator.sendBeacon() for more reliable data sending
  });
});
