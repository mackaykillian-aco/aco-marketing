var Webflow = Webflow || [];
Webflow.push(function () {
  const cookieValue = JSON.parse(Cookies.get("_fpa_data"));

  const cookieValueUTM = cookieValue.ses[0].attr;

  let UTMs = {
    utm_source: cookieValueUTM.src || "",
    utm_medium: cookieValueUTM.med || "",
    utm_campaign: cookieValueUTM.cmp || "",
    utm_term: cookieValueUTM.trm || "",
    utm_content: cookieValueUTM.cnt || "",
    utm_keyword: cookieValueUTM.kwd || "",
  };

  Object.keys(UTMs).forEach((key) => {
    $(`[hs-form-field]="${key}"]`).val(UTMs[key]);
  });
});
