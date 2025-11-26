var Webflow = Webflow || [];
Webflow.push(function () {
  document.querySelectorAll("[hs-form]").forEach((form) => {
    let fpaDataMapToFormField = {
      gcl_id: window.fpaData?.ses[0].ads.gcl_id || "",
      dcl_id: window.fpaData?.ses[0].ads.dcl_id || "",
      ga_cid: window.fpaData?.ga_cid || "",
      hsu_id: window.fpaData?.hsu_id || "",
      msft_id: window.fpaData?.ses[0].ads.msft_id || "",
      lnkd_id: window.fpaData?.ses[0].ads.lnkd_id || "",
      meta_id: window.fpaData?.ses[0].ads.meta_id || "",
      utm_source: window.fpaData?.ses[0].attr.src || "",
      utm_medium: window.fpaData?.ses[0].attr.med || "",
      utm_campaign: window.fpaData?.ses[0].attr.cmp || "",
      utm_term: window.fpaData?.ses[0].attr.trm || "",
      utm_content: window.fpaData?.ses[0].attr.cnt || "",
      utm_keyword: window.fpaData?.ses[0].attr.kwd || "",
      ref_url: window.fpaData?.ses[0].ref || "",
      landing_page: window.fpaData?.ses[0].ldp || "",
      convert_url: window.fpaData?.ses[0].cpv || "",
      last_page_before_demo: window.fpaData?.ses[0].pvs[1].path || "",
      webflow_form_id: form.getAttribute("name") || "",
      hubspot_form_id: form.getAttribute("hs-form") || "",
      // optimize_variant_id: window.fpaData?.ses[0].pvs[0].expt.vid || "",
      // optimize_exp_id: window.fpaData?.ses[0].pvs[0].expt.eid || "",
    };

    Object.keys(fpaDataMapToFormField).forEach((key) => {
      $(form).find(`[hs-form-field="${key}"]`).val(fpaDataMapToFormField[key]);
    });
  });
});
