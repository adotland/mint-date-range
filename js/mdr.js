$(document).ready(function () {
    var MDR_constants = {
        selectors: {
            ERROR_MSGS :        ".mdr-error",
            MDR_FROM:           "#MDR_From",
            MDR_TO:             "#MDR_To",
            MDR_FROM_CAL:       "#MDR_From-gldp",
            MDR_TO_CAL:         "#MDR_To-gldp",
            MDR_SUBMIT:         "#MDR_Submit",
            DATE_RANGE_ERROR:   "#MDR_DateRangeErrorMsg",
            PAGE_ERROR:         "#MDR_PageErrorMsg",
            INPUT_ERROR:        "#MDR_InputErrorMsg"
        },

        invalidDateValue: "invalidDate"
    };

    var MDR = {

        tabURL: "",

		valiDATE: function (date) {
			var dateStr = MDR_constants.invalidDateValue;

            if (date !== "") {
            //TODO: set object somewhere here for comparison on submit
                var dateObj = new Date(date),
                    month = dateObj.getMonth(),
                    day = dateObj.getDate(),
                    year = dateObj.getFullYear();

                if (!isNaN(year) && year < 9999) {

                    dateStr = (month + 1) + "/" + day + "/" + year;

                }

            } else {

                return "";

            }

			return dateStr;
		},

        runValidation: function () {

            $(MDR_constants.selectors.MDR_TO + "," + MDR_constants.selectors.MDR_FROM).each(function () {
                var date = $(this).val(),
                    validatedDate = MDR.valiDATE(date);

                if (validatedDate === MDR_constants.invalidDateValue || (validatedDate === "" && $(this).attr("id") !== "MDR_To")) {

                    $(MDR_constants.selectors.MDR_SUBMIT).removeClass("ready");
                    $(MDR_constants.selectors.INPUT_ERROR).show();
                    return false;

                } else {

                    $(MDR_constants.selectors.MDR_SUBMIT).addClass("ready");
                    $(MDR_constants.selectors.INPUT_ERROR).hide();

                }
            });
        },

        handleSubmit: function(event) {

            if ($(MDR_constants.selectors.MDR_SUBMIT).hasClass("ready")) {

                return MDR.doSubmit();

            } else {

                event.preventDefault();
                return false;

            }

        },

        doSubmit: function () {

            chrome.tabs.getSelected(null, function (tab) {

                $(MDR_constants.selectors.ERROR_MSGS).hide();
                MDR.tabURL = tab.url;

                if (MDR.tabURL.match(/https\:\/\/wwws\.mint\.com\/(\w+)\.event/) !== null) {

                    var fromDate    = MDR.valiDATE($(MDR_constants.selectors.MDR_FROM).val()),
                        toDate      = MDR.valiDATE($(MDR_constants.selectors.MDR_TO).val()),
                        fromDateObj = $(MDR_constants.selectors.MDR_FROM).data("theDate"),
                        toDateObj   = $(MDR_constants.selectors.MDR_TO).data("theDate");

                    if (fromDateObj > toDateObj) {

                        $(MDR_constants.selectors.DATE_RANGE_ERROR).show();
                        return false;

                    }

                    if ((toDate !== MDR_constants.invalidDateValue) || (fromDate !== MDR_constants.invalidDateValue)) {

                        MDR.updateTabUrl(false, toDate);
                        MDR.updateTabUrl(true, fromDate);

                        if (MDR.tabURL !== "") {

                            if (MDR.tabURL.match(/https\:\/\/wwws\.mint\.com\/(\w+)\.event/)[1] === "transaction") {

                                chrome.tabs.update(tab.id, {url: MDR.tabURL});
                                window.close();

                            } else {

                                $(MDR_constants.selectors.PAGE_ERROR).show();

                            }

                        }

                    } else {

                        $(MDR_constants.selectors.INPUT_ERROR).show();

                    }

                } else {

                    $(MDR_constants.selectors.PAGE_ERROR).show();

                }

            });

        },

        updateTabUrl: function (startNotEnd, dateStr) {

            var dateArray = [],
                locStartStr = "#location:%7B",
                locStart = MDR.tabURL.indexOf(locStartStr),
                locDateStr = null,
                locDateToken = startNotEnd ? "dateStart" : "dateEnd";

            if (MDR.tabURL === "") {

                MDR.tabURL = tab.url;

            }

            if (dateStr !== "") {

                MDR.tabURL = MDR.tabURL.replace(/%22period%22%3A%22ALL%22%2C/, "");

                dateArray = dateStr.split("/");
                locDateStr = "%22" + locDateToken + "%22%3A%22" + dateArray[0] + "%2F" + dateArray[1] + "%2F" + dateArray[2] + "%22";

                if (MDR.tabURL.indexOf(locDateToken) > -1) {

                    if (startNotEnd) {

                        MDR.tabURL = MDR.tabURL.replace(/%22dateStart%22%3A%22\d{1,2}%2F\d{1,2}%2F\d{4}%22/, locDateStr);

                    } else {

                        MDR.tabURL = MDR.tabURL.replace(/%22dateEnd%22%3A%22\d{1,2}%2F\d{1,2}%2F\d{4}%22/, locDateStr);

                    }

                } else if (locStart > -1) {

                    MDR.tabURL = MDR.tabURL.slice(0, locStart + 13) + locDateStr + "%2C" + MDR.tabURL.slice(locStart + 13);

                } else {

                    MDR.tabURL += locStartStr + locDateStr + "%2C%22query%22%3A%22%22%2C%22offset%22%3A0%2C%22typeFilter%22%3A%22cash%22%7D";

                }

            } else {
                
                if (MDR.tabURL.indexOf(locDateToken) > -1) {

                    if (startNotEnd) {

                        MDR.tabURL = MDR.tabURL.replace(/%22dateStart%22%3A%22\d{1,2}%2F\d{1,2}%2F\d{4}%22%2C/, "");

                    } else {

                        MDR.tabURL = MDR.tabURL.replace(/%22dateEnd%22%3A%22\d{1,2}%2F\d{1,2}%2F\d{4}%22%2C/, "");

                    }

                }

            }

        }

    };

    // Event binding
    $(MDR_constants.selectors.MDR_FROM).glDatePicker({

        onChange : function ($target, newDate) {

            $(MDR_constants.selectors.MDR_SUBMIT).show();
            $(MDR_constants.selectors.MDR_TO).data("theDate", newDate);
            $(MDR_constants.selectors.MDR_TO).data("settings").startDate = newDate;
            MDR.runValidation($target);
        }

    });

    $(MDR_constants.selectors.MDR_TO).glDatePicker({

        allowOld    : false,
        onChange    : function ($target, newDate) {

            $(MDR_constants.selectors.MDR_SUBMIT).show();
            MDR.runValidation($target);

        }

    });

    $(MDR_constants.selectors.MDR_SUBMIT).click(function (event) {

        MDR.handleSubmit(event);

    });

    $(MDR_constants.selectors.MDR_FROM + "," + MDR_constants.selectors.MDR_TO)
        .bind("blur", function (event) {

            var $target = $(event.target);
            MDR.runValidation($target);

        })

        .bind("keyup", function (event) {

            if (event.keyCode === 13) {

                $(MDR_constants.selectors.MDR_FROM_CAL + "," + MDR_constants.selectors.MDR_TO_CAL).hide();
                MDR.handleSubmit(event);
 
            }

        })

        .bind("focus", function (event) {

            $(MDR_constants.selectors.INPUT_ERROR).hide();

        });

	// Init
    $(MDR_constants.selectors.MDR_FROM).focus();

    // GA
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-5555595-9']);
    _gaq.push(['_trackPageview']);
    (function () {
      var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
      ga.src = 'https://ssl.google-analytics.com/ga.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();
});
