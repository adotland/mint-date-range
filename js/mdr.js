$(document).ready(function () {
    var MDR_constants = {
        selectors: {
            ERROR_MSGS :        ".mde-error",
            MDR_FROM:           "#MDR_From",
            MDR_TO:             "#MDR_To",
            MDR_FROM_CAL:       "#MDR_From-gldp",
            MDR_TO_CAL:         "#MDR_To-gldp",
            MDR_SUBMIT:         "#MDR_Submit",
            DATE_RANGE_ERROR:   "#MDR_DateRangeErrorMsg",
            PAGE_ERROR:         "#MDR_PageErrorMsg",
            INPUT_ERROR:        "#MDR_InputErrorMsg"
        }
    }

    var MDR = {
    
        tabURL: "",
		
		valiDATE: function (date) {
			var dateStr = "";
            
            if (date !== "") {
            
                var dateObj = new Date(date),
                    month = dateObj.getMonth(),
                    day = dateObj.getDate(),
                    year = dateObj.getFullYear();
                    
                if (!isNaN(year) && year < 9999) {
                    dateStr = (month + 1) + "/" + day + "/" + year;
                }
                
            }
            
			return dateStr;
		},
        
        doSubmit: function () {
            
            chrome.tabs.getSelected(null, function (tab) {
            
                $(MDR_constants.selectors.ERROR_MSGS).hide();
                MDR.tabURL = tab.url;
					
                if (MDR.tabURL.match(/https\:\/\/wwws\.mint\.com\/(\w+)\.event/) !== null) {
            
                    var fromDate    = MDR.valiDATE($(MDR_constants.selectors.MDR_FROM).val()),
                        toDate      = MDR.valiDATE($(MDR_constants.selectors.MDR_TO).val()),
                        fromDateObj = $(MDR_constants.selectors.MDR_FROM).data("theDate"),
                        toDateObj   = $(MDR_constants.selectors.MDR_TO).data("theDate"),
                        setTo       = false;
                                                
                    if (fromDateObj > toDateObj) {
                    
                        $(MDR_constants.selectors.DATE_RANGE_ERROR).show();
                        return false;
                        
                    }
                    
                    if ((toDate !== "") || (fromDate !== "")) {
                    
                        if (MDR.tabURL.indexOf("endDate") > -1) {
                        
                            MDR.tabURL = MDR.tabURL.replace(/endDate=\d{1,2}\/\d{1,2}\/\d{4}\&?/, "");

                        }
                        
                        if (MDR.tabURL.indexOf("startDate") > -1) {
                        
                            MDR.tabURL = MDR.tabURL.replace(/startDate=\d{1,2}\/\d{1,2}\/\d{4}\&?/, "");

                        }
                                       
                        var dateArray = [],
                            locStart = null,
                            qStart = null,
                            pStart = null;
                       
                        if (toDate !== "") {

                            dateArray = [];
                            qStart = MDR.tabURL.indexOf("?");
                            pStart = MDR.tabURL.indexOf("#");
                                                    
                            if (qStart > -1) {
                            
                                MDR.tabURL = MDR.tabURL.slice(0, qStart + 1) + "endDate=" + toDate + "&" + MDR.tabURL.slice(qStart + 1);
                            
                            } else if (pStart > -1) {
                            
                                MDR.tabURL = MDR.tabURL.slice(0, pStart) + "?endDate=" + toDate + "&" + MDR.tabURL.slice(pStart);
                            
                            } else {
                            
                                MDR.tabURL += "?endDate=" + toDate;                            
                            
                            }

                            if (MDR.tabURL.indexOf("dateEnd") > -1) {
                            
                                dateArray = toDate.split("/");                       
                                MDR.tabURL = MDR.tabURL.replace(/%22dateEnd%22%3A%22\d{1,2}%2F\d{1,2}%2F\d{4}/, "%22dateEnd%22%3A%22" + dateArray[0] + "%2F" + dateArray[1] + "%2F" + dateArray[2]);

                            } else if (MDR.tabURL.indexOf("#location:%7B") > -1) {
                                 
                                dateArray = toDate.split("/");
                                locStart = MDR.tabURL.indexOf("#location:%7B");
                                MDR.tabURL = MDR.tabURL.slice(0, locStart + 13) + "%22dateEnd%22%3A%22" + dateArray[0] + "%2F" + dateArray[1] + "%2F" + dateArray[2] + "%22%2C" + MDR.tabURL.slice(locStart + 13);
                            
                            }
                            
                            setTo = true;

                        }
                        
                        if (fromDate !== "") {
                        
                            if (MDR.tabURL === "") { 
                            
                                MDR.tabURL = tab.url; 
                                
                            }
                            
                            dateArray = [];
                            qStart = MDR.tabURL.indexOf("?");
                            pStart = MDR.tabURL.indexOf("#");
                            
                            if (qStart > -1) {
                            
                                MDR.tabURL = MDR.tabURL.slice(0, qStart + 1) + "startDate=" + fromDate + "&" + MDR.tabURL.slice(qStart + 1);
                            
                            } else if (pStart > -1) {
                            
                                MDR.tabURL = MDR.tabURL.slice(0, pStart) + "?startDate=" + fromDate + "&" + MDR.tabURL.slice(pStart);
                            
                            } else {
                            
                                MDR.tabURL += "?startDate=" + fromDate;                            
                            
                            }
                            
                            if (MDR.tabURL.indexOf("dateStart") > -1) {
                            
                                dateArray = fromDate.split("/");                       
                                MDR.tabURL = MDR.tabURL.replace(/%22dateStart%22%3A%22\d{1,2}%2F\d{1,2}%2F\d{4}/, "%22dateStart%22%3A%22" + dateArray[0] + "%2F" + dateArray[1] + "%2F" + dateArray[2]);

                            } else if (MDR.tabURL.indexOf("#location:%7B") > -1) {
                                 
                                dateArray = fromDate.split("/");
                                locStart = MDR.tabURL.indexOf("#location:%7B");
                                MDR.tabURL = MDR.tabURL.slice(0, locStart + 13) + "%22dateStart%22%3A%22" + dateArray[0] + "%2F" + dateArray[1] + "%2F" + dateArray[2] + "%22%2C" + MDR.tabURL.slice(locStart + 13);
                            
                            }
                            
                        }
                            
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

        } 
            
    };

    // Event binding
    $(MDR_constants.selectors.MDR_FROM).glDatePicker({
                        
        onChange : function (target, newDate) {
                        
            $(MDR_constants.selectors.MDR_SUBMIT).show();
            $(MDR_constants.selectors.MDR_TO).data("theDate", newDate);
            $(MDR_constants.selectors.MDR_TO).data("settings").startDate = newDate;
            $(MDR_constants.selectors.MDR_SUBMIT).removeClass("ready").addClass("ready");
        }
        
    });

    $(MDR_constants.selectors.MDR_TO).glDatePicker({
                    
        allowOld    : false,
        onChange    : function (target, newDate) {
            
            $(MDR_constants.selectors.MDR_SUBMIT).show();
            $(MDR_constants.selectors.MDR_SUBMIT).removeClass("ready").addClass("ready");
            
        }
        
    });

    $(MDR_constants.selectors.MDR_SUBMIT).click(function () { return MDR.doSubmit(); });

    $(MDR_constants.selectors.MDR_FROM + "," + MDR_constants.selectors.MDR_TO)
        .bind("blur", function (event) { 
        
            runValidation(event);
        
        })
		
		.bind("focus", function () {
			$(MDR_constants.selectors.MDR_SUBMIT).removeClass("notReady").addClass("notReady");
		})
        
        .bind("keyup", function (event) {
        
            if (event.keyCode === 13) {
            
                $(MDR_constants.selectors.MDR_FROM_CAL + "," + MDR_constants.selectors.MDR_TO_CAL).hide();
                MDR.doSubmit();
                
            } else {
                runValidation(event);
            }
        
        });

    var runValidation = function (event) {
        var date = $(event.target).val();
        if (MDR.valiDATE(date) === "") {
            
            $(MDR_constants.selectors.MDR_SUBMIT).removeClass("notReady").addClass("notReady");
        
        } else {
    
            $(MDR_constants.selectors.MDR_SUBMIT).removeClass("ready").addClass("ready");
    
        }
    }

	// Init
    $(MDR_constants.selectors.MDR_FROM).focus();

    // GA
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-5555595-9']);
    _gaq.push(['_trackPageview']);
    (function() {
      var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
      ga.src = 'https://ssl.google-analytics.com/ga.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();
});