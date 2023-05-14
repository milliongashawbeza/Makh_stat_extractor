// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages. 
// document.getElementsByClassName("nav-tabs").innerHtml("<li>Export</li>") 
//window.addEventListener('load', function () {
    const node = document.createElement("li");
    const createButton = document.createElement('button')
    createButton.innerText = 'Export'
    createButton.id = "buttonId";
    createButton.className = "btn btn-danger btn-xs";
    node.appendChild(createButton)
    //Select The Stastic Page   
    var url = []
    if (document.getElementsByClassName("breadcrumb")[0]) {

        document.getElementsByClassName("breadcrumb")[0].appendChild(node);
        document.getElementById("buttonId").onclick = function jsFunc() {
            var v = document.getElementsByClassName('ibox-title');
            for (x = 0; x < v.length; x++) {
                var u = v[x].getElementsByTagName('a')[0].href
                url.push();
               // exportUrl(v[x]) 
                if(x==v.length-1){
                    startScraping();
                }
            }
            //document.getElementsByClassName('ibox-title')[0].getElementsByTagName('a')[0].click();    

            console.log("Scraping Started")
        }
    } else {

    }

    function startScraping(){

        chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
            for(let i=0; i<url.length; i++) {
                // navigate to next url
                await goToPage(url[i], i+1, tabs[0].id);
                
                // wait for 5 seconds
                await waitSeconds(5);
            }
    
            // navigation of all pages is finished
            alert('Navigation Completed');
        });

    } 

    async function goToPage(url, url_index, tab_id) {
        return new Promise(function(resolve, reject) {
            // update current tab with new url
            chrome.tabs.update({url: url});
            
            // fired when tab is updated
            chrome.tabs.onUpdated.addListener(function openPage(tabID, changeInfo) {
                // tab has finished loading, validate whether it is the same tab
                if(tab_id == tabID && changeInfo.status === 'complete') {
                    // remove tab onUpdate event as it may get duplicated
                    chrome.tabs.onUpdated.removeListener(openPage);
    
                    // fired when content script sends a message
                    chrome.runtime.onMessage.addListener(function getDOMInfo(message) {
                        // remove onMessage event as it may get duplicated
                        chrome.runtime.onMessage.removeListener(getDOMInfo);
    
                        // save data from message to a JSON file and download
                        let json_data = {
                            title: JSON.parse(message).title,
                            h1: JSON.parse(message).h1,
                            url: url
                        };
    
                        let blob = new Blob([JSON.stringify(json_data)], {type: "application/json;charset=utf-8"});
                        let objectURL = URL.createObjectURL(blob);
                        chrome.downloads.download({ url: objectURL, filename: ('content/' + url_index + '/data.json'), conflictAction: 'overwrite' });
                   
                   
                    });
    
                    // execute content script
                    chrome.tabs.executeScript({ file: 'script.js' }, function() {
                        // resolve Promise after content script has executed
                        resolve();
                    });
                }
            });
        });
    }
    
    // async function to wait for x seconds 
    async function waitSeconds(seconds) {
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                resolve();
            }, seconds*1000);
        });
    }
    // Get the first table in the document. 

    var i = 0;
    function exportUrl(v) {
        var u = v.getElementsByTagName('a')[0].href
        chrome.runtime.sendMessage({
            message: "url",
            data: u,
          })
        console.log(u)
        url.push(u)
        // v.getElementsByTagName('a')[0].click();  
        window.open(v.getElementsByTagName('a')[0].href, "_blank");
        console.log("clicking " + v)
    }
    var data = []
    if (document.getElementById('graph_values_listing')) {

        var tbody = document.getElementById("graph_values_listing");
        var tr = tbody.getElementsByTagName("tr")
        var graph_name = document.getElementsByClassName("pull-left graph-name")[0].textContent;

        for (t = 0; t < tr.length; t++) {
            var td = tr[t].getElementsByTagName("td")
            r(td,graph_name);
            if (t == tr.length - 1) {
                //end of the table 
                fetch("http://localhost:5001/export", {
                    method: "POST",
                    body: JSON.stringify(data),
                    headers: {
                        "Content-type": "application/json; charset=UTF-8"
                    }
                }).then((response) => response.json())
                .then((json) => console.log(json));;

            }
        }


    } else {

    }
    function r(td,graph_name) {
        var entry = new Map();
        for (d = 0; d < td.length; d++) {
            if (d == 0) {
                entry.set('graph_name',graph_name);
                entry.set('date', td[d].textContent)
            }
            else if (d == 1) {
                // console.log(td[d])
                console.log(td[d].getElementsByClassName("graph_values")[0].value)
                entry.set('value', td[d].getElementsByClassName("graph_values")[0].value)

            }
            else if (d == 2) {
                entry.set('by', td[d].textContent)
            } else if (d == 3) {
                entry.set('change', td[d].textContent)
            } else if (d == 4) {
                entry.set('change', td[d].textContent)
            } 
            if(d==td.length-1){
                const obj = Object.fromEntries(entry);
                data.push(obj);
                console.log(td[d].textContent) 
                return;
            }
          
         
        }

    }


//})  
