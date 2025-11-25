var Webflow = Webflow || [];
Webflow.push(function () {
  let hsApiUrl =
    "https://api.hsforms.com/submissions/v3/integration/submit/7014026/";
  let formData = {
    fields: [],
  };
  let UTMs = [
    "utm_medium",
    "utm_source",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ];

  $("[hs-form]").on("submit", function (event) {
    event.preventDefault(); // Prevent default form submission
    let hsForm = $(this);
    let hsFormID = $(this).attr("hs-form");
    if (hsFormID == undefined) return false;
    let hsEndPoint = hsApiUrl + hsFormID;
    let redirectURL = $(this).attr("redirect-url");
    // Reset formData for each submission
    formData = { fields: [] };
    // Add the form data to the formData object
    hsForm.find("[hs-form-field]").each(function () {
      let field = {
        name: $(this).attr("hs-form-field"),
        value: $(this).val(),
      };
      formData.fields.push(field);
    });
    // Add the UTM parameters to the formData object
    UTMs.forEach((utm) => {
      let utmValue = new URLSearchParams(window.location.search).get(utm);
      if (utmValue != null) {
        let field = {
          name: `${utm}`,
          value: utmValue,
        };
        formData.fields.push(field);
      }
    });
    console.log("HubSpot Form Data:", formData);
    // Get page information
    let pageName = document.title; // Use the page title as the name
    let pageUrl = window.location.href; // Get the full URL of the page
    let hubspotCookie = document.cookie.match(
      /(?:^|;\s*)hubspotutk\s*=\s*([^;]*)/
    );
    let htuk = hubspotCookie ? hubspotCookie[1] : null;
    // Create the hs_context object
    if (htuk) {
      formData.context = {
        hutk: htuk,
        pageUri: pageUrl,
        pageName: pageName,
      };
    }
    // Hide previous error
    hsForm.find('[hs-error="email"]').attr("aria-hidden", "true").hide();
    // Make a POST request to HubSpot
    fetch(hsEndPoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "error" && Array.isArray(data.errors)) {
          // Check for BLOCKED_EMAIL error
          const blockedEmailError = data.errors.find(
            (e) => e.errorType === "BLOCKED_EMAIL"
          );
          if (blockedEmailError) {
            const errorElem = hsForm.find('[hs-error="email"]');
            errorElem
              .text("Submission from this email address are not allowed.")
              .attr("aria-hidden", "false")
              .show();
            return false; // Stop further actions and prevent submission
          }
          // Handle other errors if needed
          return false;
        }
        // Success flow
        console.log("HubSpot Form Submission Successful:", data);
        const { redirectUri } = data;
        submitWebflowForm(hsForm, redirectUri);
      })
      .catch((error) => {
        console.error("HubSpot Form Submission Error:", error);
        // Optionally show a generic error message
      });
    return false; // Always prevent default form submission
  });

  // Hide error on input click
  $(document).on("click", ".form_input", function () {
    $(this)
      .closest("form")
      .find(".form_field-error")
      .attr("aria-hidden", "true")
      .hide();
  });

  // Define a Custom Event for Gated Form submitted
  const gatedFormSubmittedEvent = new CustomEvent("gatedFormSubmitted", {
    bubbles: true,
    cancelable: false,
  });

  function submitWebflowForm(form, redirectURL) {
    //console.log('submitWebflowForm', form, redirectURL);

    // Gated form logic
    const gatedForm = document.querySelector("[gated-form]");
    if (gatedForm) {
      const slug = gatedForm.getAttribute("gated-form");
      localStorage.setItem(`form-submitted-${slug}`, "true");
      // Dispatch the custom event "gatedFormSubmitted"
      gatedForm.dispatchEvent(gatedFormSubmittedEvent);
    }

    // WEBFLOW OPTIMIZE: Fire custom events to record form submission conversion
    intellimize.ready(function () {
      try {
        let hsFormId = form.attr("hs-form");
        if (hsFormId == "b964287e-2634-46f0-bc44-d03b78596b7c") {
          intellimize.sendEvent("global-demo-request"); // Debug ID 157047636
        } else if (hsFormId == "b22428dc-6515-4699-b27c-b626dea09953") {
          intellimize.sendEvent("global-content-download"); // Debug ID 157047636
        } else if (hsFormId == "dce114b9-c3ca-4bb4-bb27-af9e44f70e20") {
          intellimize.sendEvent("global-on-demand-video"); // Debug ID 157047638
        } else if (hsFormId == "8e7a3afb-438a-452a-bb43-ef03fe926311") {
          intellimize.sendEvent("global-request-for-proposal"); // Debuf ID 157047639
        } else {
          console.log("E: OPT: No Matching Form ID");
        }
      } catch (err) {
        console.error("E: OPT: ", err.message);
      }
    });

    form.off("submit"); // Unlink the on event from the form
    form.submit();

    if (redirectURL != undefined) {
      setTimeout(() => {
        window.location = redirectURL;
      }, 2000);
    }
  }
});
