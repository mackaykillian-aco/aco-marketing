console.log("FPA -> FORM V1.2.2");

// PRODUCTION CODE
// var Webflow = Webflow || [];
// Webflow.push(function () {
//   window.onload = function () {
//     // add event listener to wait for fpaData to be ready
//     document.querySelectorAll("[hs-form]").forEach((form) => {
//       let fpaDataMapToFormField = {
//         gclid: window.fpaData?.ses[0].ads.gclid || "",
//         //dclid: window.fpaData?.ses[0].ads.dcl_id || "",
//         ga_client_id: window.fpaData?.ga_cid || "",
//         hsuid: window.fpaData?.hsu_id || "",
//         microsoft_clid: window.fpaData?.ses[0].ads.msclkid || "",
//         linkedin_id: window.fpaData?.ses[0].ads.li_fat_id || "",
//         meta_click_id: window.fpaData?.ses[0].ads.fbclid || "",
//         utm_source: window.fpaData?.ses[0].attr.src || "",
//         utm_medium: window.fpaData?.ses[0].attr.med || "",
//         utm_campaign: window.fpaData?.ses[0].attr.cmp || "",
//         utm_term: window.fpaData?.ses[0].attr.trm || "",
//         utm_content: window.fpaData?.ses[0].attr.cnt || "",
//         utm_keyword: window.fpaData?.ses[0].attr.kwd || "",
//         referring_url: window.fpaData?.ses[0].ref || "",
//         landing_page: window.fpaData?.ses[0].ldp || "",
//         converting_url: window.fpaData?.ses[0].cpv || "",
//         demo_referrer: window.fpaData?.ses[0].pvs[1].path || "",
//         webflow_form_id: form.getAttribute("name") || "",
//         hubspot_form_id: form.getAttribute("hs-form") || "", // TODO: Keep this
//         // variant_id: window.fpaData?.ses[0].pvs[0].expt.vid || "",
//         // experiment_id: window.fpaData?.ses[0].pvs[0].expt.eid || "",
//       };

//       Object.keys(fpaDataMapToFormField).forEach((key) => {
//         console.log(key, fpaDataMapToFormField[key]);
//         $(form)
//           .find(`[hs-form-field="${key}"]`)
//           .val(fpaDataMapToFormField[key]);
//       });
//     });
//   };
// });

// TESTING CODE
function populateFormFieldsFromFpaData() {
  document.querySelectorAll("[hs-form]").forEach((form) => {
    let fpaDataMapToFormField = {
      gclid: window.fpaData?.ses[0].ads.gclid || "",
      //dclid: window.fpaData?.ses[0].ads.dcl_id || "",
      ga_client_id: window.fpaData?.ga_cid || "",
      hsuid: window.fpaData?.hsu_id || "",
      microsoft_clid: window.fpaData?.ses[0].ads.msclkid || "",
      linkedin_id: window.fpaData?.ses[0].ads.li_fat_id || "",
      meta_click_id: window.fpaData?.ses[0].ads.fbclid || "",
      utm_source: window.fpaData?.ses[0].attr.src || "",
      utm_medium: window.fpaData?.ses[0].attr.med || "",
      utm_campaign: window.fpaData?.ses[0].attr.cmp || "",
      utm_term: window.fpaData?.ses[0].attr.trm || "",
      utm_content: window.fpaData?.ses[0].attr.cnt || "",
      utm_keyword: window.fpaData?.ses[0].attr.kwd || "",
      referring_url: window.fpaData?.ses[0].ref || "",
      landing_page: window.fpaData?.ses[0].ldp || "",
      converting_url: window.fpaData?.ses[0].cpv || "",
      demo_referrer:
        window.fpaData?.ses[0].pvs.length > 1
          ? window.fpaData?.ses[0].pvs[1].path
          : "",
      fpa_data: JSON.stringify(window.fpaData || { error: "no fpaData" }),
      webflow_form_id: form.getAttribute("name") || "",
      hubspot_form_id: form.getAttribute("hs-form") || "", // TODO: Keep this
      // variant_id: window.fpaData?.ses[0].pvs[0].expt.vid || "",
      // experiment_id: window.fpaData?.ses[0].pvs[0].expt.eid || "",
    };

    Object.keys(fpaDataMapToFormField).forEach((key) => {
      console.log(key, fpaDataMapToFormField[key]);
      $(form).find(`[hs-form-field="${key}"]`).val(fpaDataMapToFormField[key]);
    });
  });
}
