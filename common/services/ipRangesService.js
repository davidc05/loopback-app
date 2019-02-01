const mysql = require("mysql");
const async = require('async');
const ipHelpers = require('./ipHelpers');
const dbConfig = require("../configs/dbConfig.json");
module.exports ={
    knownNetworkLookup: (network,
        page, pageBy, notation, cb) => {
        var resultCount = 0;
        var resultsPage = undefined;
        var ip_start_int = 0;
        var ip_end_int = 0;
        var nw_name = undefined;
        var nw_type = undefined;
        var nw_group = undefined;

        //Default pages
        page = page ? page : 1;
        pageBy = pageBy ? pageBy : 50;
        notation = "string";

        var finalResult = {};

        var connection = mysql.createConnection(dbConfig);

        // build "where" clause
        var where = "";
        if(network.networkName)
            where += "network_name like \'" + network.networkName + "\'";

        if((network.networkType) && (where.length > 0))
            where += " and network_type like \'" + network.networkType + "\'";
        else if (network.networkType != null)
            where += "network_type like \'" + network.networkType+ "\'";

        if((network.networkGroup) && (where.length > 0))
            where += " and network_group like \'" + network.networkGroup+ "\'";
        else if (network.networkGroup)
            where += "network_group like \'" + network.networkGroup+ "\'";

        // first we count
        var sqlGetKNCount = "select count(*) as knownNetworksCount from caatu_known_networks " +
                    "where " + where;
        // then we pull a page
        var sqlGetKNPaged = "select ip_start_int, ip_end_int, network_name, network_type, network_group " +
                    "from JEDIBADGERDB.caatu_known_networks where " +
                    where + " order by date_expires desc limit " + (page - 1)*pageBy + "," + pageBy;

        async.waterfall([
            // Execute count query
            (callback) => {
            connection.query(sqlGetKNCount, function (error, results, fields) {
                if (error) throw error;
                results.forEach(function(row){
                    resultCount = row.knownNetworksCount;
                });
                callback(null);
            });
            },
            (callback) => {
            if((resultCount > 0) && ((page - 1)*pageBy < resultCount)) { // don't try to paginate past the end of the list
                connection.query(sqlGetKNPaged, function (error, results, fields) {
                if (error) throw error;
                var entries = [];
                results.forEach(function(row){
                    if(notation.toLowerCase() === "int") {
                    entries.push({
                        ip_start_int: row.ip_start_int,
                        ip_end_int: row.ip_end_int,
                        network_name: row.network_name,
                        network_type: row.network_type,
                        network_group: row.network_group
                    });
                    } else {
                    entries.push({
                        ip_start_int: ipHelpers.getIPOrdered(row.ip_start_int),
                        ip_end_int: ipHelpers.getIPOrdered(row.ip_end_int),
                        network_name: row.network_name,
                        network_type: row.network_type,
                        network_group: row.network_group
                    });

                    }

                });

                finalResult.result_count = resultCount;
                finalResult.result_page = page;
                finalResult.page_size = entries.length;
                finalResult.entries = entries;

                connection.end();
                callback(null);
                cb(null, finalResult)
                });
            }
            else{
                finalResult.result_count = 0;
                finalResult.result_page = page;
                finalResult.page_size = 0;
                connection.end();
                callback(null);
                cb(null, finalResult)
            }
            }
        ]);
    },
    ispLookup: (isp, page, pageBy, cb) =>{
        // returns the IP ranges in Known Networks for a given network name
        var resultCount = 0;
        var resultsPage = undefined;
        var ipaddress = undefined;
        var ipint = 0;
        var source = undefined;
        var blclass = undefined;
        var date_loaded = undefined;
        var bl_date = undefined;
        var date_delisted = undefined;
        var category = undefined;
        var activity = undefined;
        var loc_id = 0;
        var network_class = undefined;
        var network_type = undefined;
        var isp_name = undefined;

        //Default pages
        page = page ? page : 1;
        pageBy = pageBy ? pageBy : 50;

        var finalResult = {};

        var connection = mysql.createConnection(dbConfig);

        // first we count
        var sqlGetISPCount = "select count(*) as sqlGetISPCount from JEDIBADGERDB.jb_ip_repo_enh " +
            "where isp_name like " + "\'%" + isp + "%\'";

        // then we pull a page
        var sqlGetISPPaged = "select IPADDRESS, IPINT, SOURCE, BLCLASS, DATE_LOADED, " +
            "BL_DATE, DATE_DELISTED, CATEGORY, ACTIVITY, LOC_ID, " +
            "NETWORK_CLASS, NETWORK_TYPE, ISP_NAME " +
            "from JEDIBADGERDB.jb_ip_repo_enh where isp_name like " + "\'%" + isp + "%\'" + " order by bl_date desc limit " + (page - 1)*pageBy + "," + pageBy;

        async.waterfall([
            // Execute count query
            (callback) => {
            connection.query(sqlGetISPCount, function (error, results, fields) {
                if (error) throw error;
                results.forEach(function(row){
                    resultCount = row.sqlGetISPCount;
                });
                callback(null);
            });
            },
            (callback) => {
            if((resultCount > 0) && ((page - 1)*pageBy < resultCount)) { // don't try to paginate past the end of the list
                connection.query(sqlGetISPPaged, function (error, results, fields) {
                if (error) throw error;
                var entries = [];
                results.forEach(function(row){
                    entries.push({
                    ipaddress: row.IPADDRESS,
                    ipint: row.IPINT,
                    source: row.SOURCE,
                    blclass: row.BLCLASS,
                    date_loaded: row.DATE_LOADED,
                    bl_date: row.BL_DATE,
                    date_delisted: row.DATE_DELISTED,
                    category: row.CATEGORY,
                    activity: row.ACTIVITY,
                    loc_id: row.LOC_ID,
                    network_class: row.NETWORK_CLASS,
                    network_type: row.NETWORK_TYPE,
                    isp_name: row.ISP_NAME
                    });
                });

                finalResult.result_count = resultCount;
                finalResult.result_page = page;
                finalResult.page_size = entries.length;
                finalResult.entries = entries;

                connection.end();
                callback(null);
                cb(null, finalResult)
                });
            }
            else{
                finalResult.result_count = 0;
                finalResult.result_page = page;
                finalResult.page_size = 0;
                connection.end();
                callback(null);
                cb(null, finalResult)
            }
            }
        ])
    }
}
