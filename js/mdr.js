$(document).ready(function () {

    var MDR = {
    
        tabURL : "",
       
        doSubmit: function () {
            
            chrome.tabs.getSelected(null, function (tab) {
            
                $(".mdr-error").hide();
                MDR.tabURL = tab.url;
                
                if (MDR.tabURL.match(/https\:\/\/wwws\.mint\.com\/(\w+)\.event/) !== null) {
            
                    var fromDate    = $("#MDR_From").val(),
                        toDate      = $("#MDR_To").val(),
                        fromDateObj = $("#MDR_From").data("theDate"),
                        toDateObj   = $("#MDR_To").data("theDate"),
                        setTo       = false;
                        
                    if (fromDateObj > toDateObj) {
                    
                        $("#MDR_DateRangeErrorMsg").show();
                        return false;
                        
                    }
                    
                    if ((toDate !== "") || (fromDate !== "")) {
                    
                        if (MDR.tabURL.indexOf("endDate") > -1) {
                        
                            MDR.tabURL = MDR.tabURL.replace(/endDate=\d{1,2}\/\d{1,2}\/\d{4}\&?/, "");

                        }
                        
                        if (MDR.tabURL.indexOf("startDate") > -1) {
                        
                            MDR.tabURL = MDR.tabURL.replace(/startDate=\d{1,2}\/\d{1,2}\/\d{4}\&?/, "");

                        }
                   
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
                        
                            $("#MDR_PageErrorMsg").show();
                        
                        }
                   
                    }
               
                } else {
                        
                    $("#MDR_PageErrorMsg").show();
                
                }
               
            });

        } 
            
    };

	$("#MDR_From").glDatePicker({
                        
        onChange : function (target, newDate) {
                        
            $("#MDR_Submit").show();
            $("#MDR_To").data("theDate", newDate);
            $("#MDR_To").data("settings").startDate = newDate;
        }
		
    });

    $("#MDR_To").glDatePicker({
                    
        allowOld	: false,
        onChange    : function (target, newDate) {
                        
            $("#MDR_Submit").show();
                       
        }
                
    });
                    
    $(".mdr-error, #MDR_Submit").hide();

	$("#MDR_Submit").click(function () { return MDR.doSubmit(); });
	
	$("#MDR_From, #MDR_To")
		.click(function () {
		
			$("#MDR_Choose").hide();
			
		})
		.bind("change blur", function (event) { 
		
			if (($("#MDR_From").val() === "") && ($("#MDR_To").val() === "")) {
			
				$("#MDR_Submit").hide();
			   
			}
			
			if ($("#MDR_From").val() !== "") {
			
				$("#MDR_Submit").show();
			   
			}
		
		})
		.focus(function () { $("#MDR_Choose").hide(); });
		
	$("#MDR_From").focus();
    
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-5555595-9']);
    _gaq.push(['_trackPageview']);
    (function() {
      var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
      ga.src = 'https://ssl.google-analytics.com/ga.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();
});