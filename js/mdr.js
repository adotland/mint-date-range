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
            INPUT_ERROR:        "#MDR_InputErrorMsg",
            RESET_DATE:         ".mdr-reset-button",
            INPUT_CONTAINER:    ".mdr-date-box-container"
        },

        selectorNames: {
            SUBMIT_READY:       "mdr-ready",
            INVALID_INPUT:      "mdr-invalid-input",
            DATE_BOX_FOCUS:     "mdr-date-box-focus",
            DATE_BOX:           "mdr-date-box"
        },

        INVALID_DATE_VALUE: "invalidDate",
        MINT_URLS: [/https\:\/\/wwws\.mint\.com\/(\w+)\.event/, /https\:\/\/mint\.intuit\.com\/(\w+)\.event/]
    };

    var MDR_cached = {

        $FromAndToInputs:   $(MDR_constants.selectors.MDR_FROM + "," + MDR_constants.selectors.MDR_TO),
        $SubmitButton:      $(MDR_constants.selectors.MDR_SUBMIT),
        $FromInput:         $(MDR_constants.selectors.MDR_FROM),
        $ToInput:           $(MDR_constants.selectors.MDR_TO),
        $ErrorMsgs:         $(MDR_constants.selectors.ERROR_MSGS),
        $InputError:        $(MDR_constants.selectors.INPUT_ERROR),
        $ResetDate:         $(MDR_constants.selectors.RESET_DATE),
        $InputContainers:   $(MDR_constants.selectors.INPUT_CONTAINER)

    };

    var MDR = {

        tabURL: "",

		valiDATE: function (date) {
			var dateStr = MDR_constants.INVALID_DATE_VALUE;

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

        validateAndStore: function ($inputField, fromNotTo) {

            var date = $inputField.val(),
                validatedDate = MDR.valiDATE(date),
                storageKeyObj = {},
                storageKeyName = fromNotTo ? "fromDate" : "toDate";

            storageKeyObj[storageKeyName] = validatedDate;

            if ((validatedDate === MDR_constants.INVALID_DATE_VALUE) || (validatedDate === "" && fromNotTo)) {

                MDR.resetDate(fromNotTo);
                $inputField.addClass(MDR_constants.selectorNames.INVALID_INPUT);
                MDR.updateSubmitDisplayStatus(false); // TODO: rewrite with MVC...

            } else {

                $inputField.removeClass(MDR_constants.selectorNames.INVALID_INPUT);
                if (fromNotTo || validatedDate !== "" && ! fromNotTo) {
                    $inputField.next().next().show(); // show reset button
                }
                chrome.storage.local.set(storageKeyObj, function() {});
                MDR.updateSubmitDisplayStatus(true);

            }
        },

        resetDate: function (fromNotTo) {
            var storageKeyName = fromNotTo ? "fromDate" : "toDate";
            chrome.storage.local.remove(storageKeyName, function() {});
        },

        updateSubmitDisplayStatus: function (inputValid) {
            if (inputValid) {
                MDR_cached.$InputError.hide();
                if (! MDR_cached.$FromInput.hasClass(MDR_constants.selectorNames.INVALID_INPUT) &&
                    ! MDR_cached.$ToInput.hasClass(MDR_constants.selectorNames.INVALID_INPUT))
                    MDR_cached.$SubmitButton.addClass(MDR_constants.selectorNames.SUBMIT_READY);
            } else {
                MDR_cached.$InputError.show();
                MDR_cached.$SubmitButton.removeClass(MDR_constants.selectorNames.SUBMIT_READY);  
            }
        },

        handleSubmit: function (event) {

            MDR.validateAndStore(MDR_cached.$FromInput, true);
            MDR.validateAndStore(MDR_cached.$ToInput, false);

            if (MDR_cached.$SubmitButton.hasClass(MDR_constants.selectorNames.SUBMIT_READY)) {

                return MDR.doSubmit();

            } else {

                event.preventDefault();
                return false;

            }

        },

        doSubmit: function () {

            chrome.tabs.getSelected(null, function (tab) {

                MDR_cached.$ErrorMsgs.hide();
                MDR.tabURL = tab.url;

                var mintUrls = MDR_constants.MINT_URLS,
                    validUrl,
                    matchUrlArr,
                    transactionPageMatch;
                
                for (var index = 0; index < mintUrls.length; index++) {
                    matchUrlArr = MDR.tabURL.match(mintUrls[index]);
                    if (matchUrlArr !== null) {
                        validUrl = true;
                        if (matchUrlArr.length > 1) {
                            transactionPageMatch = (matchUrlArr[1] === "transaction" ? true : false);
                        }
                    }
                }

                if (validUrl) {

                    var fromDate    = MDR.valiDATE(MDR_cached.$FromInput.val()),
                        toDate      = MDR.valiDATE(MDR_cached.$ToInput.val()),
                        fromDateObj = MDR_cached.$FromInput.data("theDate"),
                        toDateObj   = MDR_cached.$ToInput.data("theDate");

                    if (fromDateObj > toDateObj) {

                        $(MDR_constants.selectors.DATE_RANGE_ERROR).show();
                        return false;

                    }

                    if ((toDate !== MDR_constants.INVALID_DATE_VALUE) || (fromDate !== MDR_constants.INVALID_DATE_VALUE)) {

                        MDR.updateTabUrl(false, toDate);
                        MDR.updateTabUrl(true, fromDate);

                        if (MDR.tabURL !== "") {

                            if (transactionPageMatch) {

                                chrome.tabs.update(tab.id, {url: MDR.tabURL});
                                window.close();

                            } else {

                                $(MDR_constants.selectors.PAGE_ERROR).show();

                            }

                        }

                    } else {

                        MDR_cached.$InputError.show();

                    }

                } else {

                    $(MDR_constants.selectors.PAGE_ERROR).show();

                }

            });

        },

        updateTabUrl: function (startNotEnd, dateStr) {

            var queryStartStr = "?query=",
                queryStart = MDR.tabURL.indexOf(queryStartStr),
                locStartStr = "#location:%7B",
                locStart = MDR.tabURL.indexOf(locStartStr);

            if (queryStart > -1 && locStart === -1) {

                this.updateUrlQuery(startNotEnd, dateStr, queryStart);

            } else {

                this.updateUrlLocation(startNotEnd, dateStr, locStart, locStartStr);

            }

        },

        updateUrlQuery: function (startNotEnd, dateStr, queryStart) {

            var queryDateStr = null,
                queryDateToken = startNotEnd ? "startDate" : "endDate";

            if (dateStr !== "") {

                queryDateStr = queryDateToken + "=" + dateStr;

                if (MDR.tabURL.indexOf(queryDateToken) > -1) {

                    if (startNotEnd) {

                        MDR.tabURL = MDR.tabURL.replace(/startDate=\d{1,2}\/\d{1,2}\/\d{4}/, queryDateStr);

                    } else {

                        MDR.tabURL = MDR.tabURL.replace(/endDate\d{1,2}\/\d{1,2}\/\d{4}/, queryDateStr);

                    }

                } else {

                    MDR.tabURL += "&" + queryDateStr;

                }

            } else {

                if (MDR.tabURL.indexOf(queryDateToken) > -1) {

                    if (startNotEnd) {

                        MDR.tabURL = MDR.tabURL.replace(/&startDate=\d{1,2}\/\d{1,2}\/\d{4}/, "");

                    } else {

                        MDR.tabURL = MDR.tabURL.replace(/&endDate=\d{1,2}\/\d{1,2}\/\d{4}/, "");

                    }

                }

            }

        },

        updateUrlLocation: function (startNotEnd, dateStr, locStart, locStartStr) {

            var dateArray = [],
                locDateStr = null,
                locDateToken = startNotEnd ? "dateStart" : "dateEnd";

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

                    if (MDR.tabURL.slice(-1) === "#") {

                        MDR.tabURL = MDR.tabURL.slice(0, -1);

                    }

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

    fromDatePicker = {};
    toDatePicker = {};
    
    chrome.storage.local.get("fromDate", function(result) {
        var startDate = new Date(),
            selectedDate = -1; // gldp default value

        if (result.hasOwnProperty("fromDate") && result.fromDate !== "") {
            selectedDate = result.fromDate;
            startDate = selectedDate;
            MDR_cached.$FromInput.val(selectedDate);
            MDR_cached.$FromInput.data("theDate", new Date(selectedDate));
            MDR_cached.$FromInput.next().show(); // show reset button            
        }

        fromDatePicker = MDR_cached.$FromInput.glDatePicker({

            selectedDate    : new Date(selectedDate),
            startDate       : new Date(startDate),
            
            onChange        : function ($target, newDate) {

                var $fieldResetButton = $target.siblings(MDR_cached.$ResetDate);

                if ($target.val() !== "") {
                    $fieldResetButton.show();
                } else {
                    $fieldResetButton.hide();
                }

                MDR_cached.$SubmitButton.show();
                MDR.validateAndStore($target, true);
            }

        });
    });

    chrome.storage.local.get("toDate", function(result) {
        var startDate = new Date(),
            selectedDate = -1; // gldp default value

        if (result.hasOwnProperty("toDate") && result.toDate !== "") {
            selectedDate = result.toDate;
            startDate = selectedDate;
            MDR_cached.$ToInput.val(selectedDate);
            MDR_cached.$ToInput.data("theDate", new Date(selectedDate));
            MDR_cached.$ToInput.next().show(); // show reset button
        }

        toDatePicker = MDR_cached.$ToInput.glDatePicker({

            selectedDate    : new Date(selectedDate),
            startDate       : new Date(startDate),
            onChange        : function ($target, newDate) {

                var $fieldResetButton = $target.siblings(MDR_cached.$ResetDate);

                if ($target.val() !== "") {
                    $fieldResetButton.show();
                } else {
                    $fieldResetButton.hide();
                }

                MDR_cached.$SubmitButton.show();
                MDR.validateAndStore($target, false);

            }

        });
    });

    MDR_cached.$SubmitButton.click(function (event) {

        MDR.handleSubmit(event);

    });

    MDR_cached.$FromAndToInputs

        .change( function (event) {

            var $target = $(event.target);
            if (! $target.hasClass(MDR_constants.selectorNames.GLDP)) {
                MDR.validateAndStore($target, true);
                MDR.validateAndStore($target, false);
            }
        })

        .bind("keyup", function (event) {

            if (event.keyCode === 13) {

                $(MDR_constants.selectors.MDR_FROM_CAL + "," + MDR_constants.selectors.MDR_TO_CAL).hide();
                MDR.handleSubmit(event);
 
            }

        })

        .bind("focus", function (event) {

            MDR_cached.$InputError.hide();

        });

    MDR_cached.$ResetDate.click(function (event) {

        var $resetButton = $(event.target),
            input = $resetButton.parent().children()[0],
            today = new Date();

        input.value = "";
        $resetButton.hide();

        if (input.id === "MDR_From") {
            MDR_cached.$SubmitButton.removeClass(MDR_constants.selectorNames.SUBMIT_READY);
            MDR.resetDate(true);
            fromDatePicker.glDatePicker("setStartDate", today);
            fromDatePicker.glDatePicker("setSelectedDate", -1);
            MDR_cached.$FromInput.data("theDate", today);
            fromDatePicker.glDatePicker("update");
        } else {
            MDR.resetDate(false);
            toDatePicker.glDatePicker("setStartDate", today);
            toDatePicker.glDatePicker("setSelectedDate", -1);
            MDR_cached.$ToInput.data("theDate", today);
            toDatePicker.glDatePicker("update");
        }
    });

	// Init
    MDR_cached.$FromInput.focus();

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
