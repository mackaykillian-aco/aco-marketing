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
  // Check if _fpa_data cookie exists
  if (!Cookies.get("_fpa_data")) {
    var value = structuredClone(fpaDataTemplate);
    value.cid = crypto.randomUUID();
    value.vts = Date.now();
    value.lvs = Date.now();

    var value = JSON.stringify(value);
    Cookies.set("_fpa_data", value, { expires: 365, path: "/" });
  }
}

// 1. Populate ATTR Values
function populateAttrValues() {
  var value = JSON.parse(Cookies.get("_fpa_data"));

  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);

  value.ses[0].attr.src = urlParams.get("utm_source");
  value.ses[0].attr.med = urlParams.get("utm_medium");
  value.ses[0].attr.cmp = urlParams.get("utm_campaign");
  value.ses[0].attr.trm = urlParams.get("utm_term");
  value.ses[0].attr.kwd = urlParams.get("utm_keyword");
  value.ses[0].attr.cnt = urlParams.get("utm_content");

  Cookies.set("_fpa_data", JSON.stringify(value), { expires: 365, path: "/" });
}

// 2. Populate EXPT Values

// 3. Populate SES Values

// Execute Functions
initFpaDataCookie();
populateAttrValues();
