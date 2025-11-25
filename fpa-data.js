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
      tsos: 0, // Time spent on site
      ldp: "", // Landing page (session entry point)
      cvp: "", // Conversion page (session conversion point)
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

// Init FPA DATA Cookie
function initFpaDataCookie() {
  if (!Cookies.get("_fpa_data")) {
    const value = structuredClone(fpaDataTemplate);
    value.cid = crypto.randomUUID();
    value.fact = Date.now();
    Cookies.set("_fpa_data", JSON.stringify(value), {
      expires: 183,
      path: "/",
    });
  }
}

function populateFPADataValues() {
  var value = JSON.parse(Cookies.get("_fpa_data"));

  // Update last activity timestamp
  value.lact = Date.now();

  // TODO: Populate GA Client ID (If it's null keep as is)
  value.ga_cid =
    JSON.parse(Cookies.get("_ga", { domain: ".awardco.com" })) || value.ga_cid;
  console.log("ga_cid", value.ga_cid);

  // TODO: Populate HSU ID (If doesn't match, replace)
  // value.hsu_id =

  // TODO: Populate Wf Attribute

  // TODO: If last session is 24+ hours old, create new session object and push to ses array.
  // if ses is more than 5 items long, remove the oldest session object.

  Cookies.set("_fpa_data", JSON.stringify(value), {
    expires: 183,
    path: "/",
  });
}

// 1. Populate ATTR Values
function populateAttrValues() {
  var value = JSON.parse(Cookies.get("_fpa_data"));

  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);

  console.log("attr.src 1", value.ses[0].attr.src);
  value.ses[0].attr.src = value.ses[0].attr.src || urlParams.get("utm_source");
  console.log("attr.src 2", value.ses[0].attr.src);
  value.ses[0].attr.med = value.ses[0].attr.med || urlParams.get("utm_medium");
  value.ses[0].attr.cmp =
    value.ses[0].attr.cmp || urlParams.get("utm_campaign");
  value.ses[0].attr.trm = value.ses[0].attr.trm || urlParams.get("utm_term");
  value.ses[0].attr.kwd = value.ses[0].attr.kwd || urlParams.get("utm_keyword");
  value.ses[0].attr.cnt = value.ses[0].attr.cnt || urlParams.get("utm_content");

  Cookies.set("_fpa_data", JSON.stringify(value), { expires: 365, path: "/" });
}

// 2. Populate EXPT Values

// 3. Populate SES Values

// Execute Functions
initFpaDataCookie();
populateFPADataValues();
populateAttrValues();

console.log("Dev Version: 1.0.3");
