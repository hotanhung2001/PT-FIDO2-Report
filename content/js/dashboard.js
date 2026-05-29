/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.88321654988322, "KoPercent": 0.11678345011678345};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7004921588254922, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4975, 500, 1500, "prepareCertificateForSignCloud - HTTP Request"], "isController": false}, {"data": [1.0, 500, 1500, "Open SIC Web - HTTP Request"], "isController": false}, {"data": [0.9958333333333333, 500, 1500, "registerUAFDeviceForSignCloud - HTTP Request"], "isController": false}, {"data": [0.010833333333333334, 500, 1500, "Confirm TnC - HTTP Request"], "isController": false}, {"data": [0.9983333333333333, 500, 1500, "prepareHashSigningForSignCloud - HTTP Request"], "isController": false}, {"data": [0.9945833333333334, 500, 1500, "Confirm Continue - createProcessID - HTTP Request"], "isController": false}, {"data": [0.5037688442211056, 500, 1500, "Confirm Change UAF - HTTP Request"], "isController": false}, {"data": [0.005833333333333334, 500, 1500, "authorizeHashSigningForSignCloud - HTTP Request"], "isController": false}, {"data": [0.9987437185929648, 500, 1500, "verify OTP - HTTP Request"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 11988, 14, 0.11678345011678345, 1297.7840340340326, 22, 132365, 289.0, 6622.300000000005, 6789.0, 6853.0, 0.5551835447079981, 1.1554562780309685, 18.864565789073485], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["prepareCertificateForSignCloud - HTTP Request", 1200, 1, 0.08333333333333333, 863.0450000000008, 545, 132365, 728.0, 787.0, 804.0, 959.7600000000002, 0.05560518060493154, 0.1639235113033516, 17.133555019579855], "isController": false}, {"data": ["Open SIC Web - HTTP Request", 2400, 0, 0.0, 39.686250000000044, 23, 246, 27.0, 64.0, 95.0, 166.0, 0.1111984585299017, 0.23247558952036537, 0.4756407733710318], "isController": false}, {"data": ["registerUAFDeviceForSignCloud - HTTP Request", 1200, 5, 0.4166666666666667, 122.05916666666674, 31, 15972, 96.0, 108.0, 111.0, 118.0, 0.05560974158477476, 0.1443518106508689, 0.06684844863650242], "isController": false}, {"data": ["Confirm TnC - HTTP Request", 1200, 1, 0.08333333333333333, 3693.6633333333384, 31, 7106, 3761.0, 4104.700000000001, 4217.0, 4687.67, 0.05559982434162163, 0.1814204440849478, 0.25804558090684887], "isController": false}, {"data": ["prepareHashSigningForSignCloud - HTTP Request", 1200, 1, 0.08333333333333333, 233.92000000000013, 60, 19964, 213.0, 227.0, 234.0, 271.93000000000006, 0.05561007402442321, 0.04905579684277512, 0.08593136732393294], "isController": false}, {"data": ["Confirm Continue - createProcessID - HTTP Request", 1200, 6, 0.5, 212.10083333333324, 22, 606, 218.0, 232.0, 238.0, 286.93000000000006, 0.055609635926494067, 0.07410327927010871, 0.2438375733016099], "isController": false}, {"data": ["Confirm Change UAF - HTTP Request", 1194, 0, 0.0, 697.712730318259, 228, 4072, 697.0, 712.0, 720.0, 761.0, 0.05533071338852657, 0.08083471409105054, 0.27189858376080633], "isController": false}, {"data": ["authorizeHashSigningForSignCloud - HTTP Request", 1200, 0, 0.0, 6768.461666666667, 46, 21567, 6789.0, 6851.0, 6883.9, 6980.860000000001, 0.055593237990621325, 0.09326285954695032, 0.09293856565867169], "isController": false}, {"data": ["verify OTP - HTTP Request", 1194, 0, 0.0, 299.51340033500867, 288, 537, 296.0, 307.0, 317.0, 351.1999999999998, 0.05533162108071739, 0.13665397432923268, 0.24645265991128126], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 1, 7.142857142857143, 0.008341675008341674], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to rssp.fptdev.site:443 [rssp.fptdev.site/113.161.43.188] failed: Connection timed out", 1, 7.142857142857143, 0.008341675008341674], "isController": false}, {"data": ["500/Internal Server Error", 6, 42.857142857142854, 0.05005005005005005], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: rssp.fptdev.site:443 failed to respond", 6, 42.857142857142854, 0.05005005005005005], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 11988, 14, "500/Internal Server Error", 6, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: rssp.fptdev.site:443 failed to respond", 6, "400/Bad Request", 1, "Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to rssp.fptdev.site:443 [rssp.fptdev.site/113.161.43.188] failed: Connection timed out", 1, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["prepareCertificateForSignCloud - HTTP Request", 1200, 1, "Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to rssp.fptdev.site:443 [rssp.fptdev.site/113.161.43.188] failed: Connection timed out", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["registerUAFDeviceForSignCloud - HTTP Request", 1200, 5, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: rssp.fptdev.site:443 failed to respond", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Confirm TnC - HTTP Request", 1200, 1, "500/Internal Server Error", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["prepareHashSigningForSignCloud - HTTP Request", 1200, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: rssp.fptdev.site:443 failed to respond", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Confirm Continue - createProcessID - HTTP Request", 1200, 6, "500/Internal Server Error", 5, "400/Bad Request", 1, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
