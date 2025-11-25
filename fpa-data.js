function genFpaDataInitValue(value) {
  value.cid = crypto.randomUUID();
  value.vts = Date.now();
  value.lvs = Date.now();

  // Generate UTM Data
  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);

  value.attr.src = urlParams.get("utm_source");
  value.attr.med = urlParams.get("utm_medum");
  value.attr.cmp = urlParams.get("utm_campaign");
  value.attr.trm = urlParams.get("utm_term");
  value.attr.kwd = urlParams.get("utm_term");
  value.attr.cnt = urlParams.get("utm_content");

  return value;
}

var fpaDataTemplate = {
  cid: 0,
  vts: 0, // first visit
  lvs: 0, // most recent session start
  attr: {
    src: "",
    med: "",
    cmp: "",
    trm: "",
    kwd: "",
    cnt: "",
    gac: "",
  },
  expt: {
    eid: "",
    ena: "",
    etp: "",
    vid: "",
    vna: "",
  },
  ses: [
    {
      sid: 1,
      pgc: 0,
      tsos: 0,
      lpv: "",
      pvh: [
        {
          ts: 0,
          url: "",
          ttl: "",
          top: 0,
        },
      ],
    },
  ],
};

if (!Cookies.get("_fpa_data")) {
  var value = JSON.stringify(genFpaDataInitValue(fpaDataTemplate));
  Cookies.set("_fpa_data", value, { expires: 365, path: "/" });
} else {
  var cc = Cookies.get("_fpa_data");
  console.log("currentCookie", cc);
  cc = JSON.parse(cc);
  cc.lvs = Date.now();
  Cookies.set("_fpa_data", JSON.stringify(cc));
}
