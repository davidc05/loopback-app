const mysql = require("mysql");
const async = require('async');
const ipHelpers = require('./ipHelpers');
const dbConfig = require("../configs/dbConfig.json");
module.exports = {
    getIpDetail: (ip, listNeighbors, verbosity, notation, cb) =>{
        var connection = mysql.createConnection(dbConfig);
        
        connection.connect();
        
        if(!listNeighbors){
            listNeighbors = false;
        }

        var address = ip.split("."); 

        var min_address = address[0]+"."+address[1]+"."+address[2]+".0";
        var max_address = address[0]+"."+address[1]+"."+address[2]+".255";

        var minnum = ipHelpers.getIP(min_address);
        var maxnum = ipHelpers.getIP(max_address);

        var neighborthreats = [];
        
        var json = {};
		
		var sw_source = "";
		var ipaddress = "";
		var ipint = ipHelpers.getIP(ip);//CHANGE ME!
		var threat_fom = 0;
		var fom_classification = "";
		var blacklist_class = "unlisted";
		var blacklist_class_disp = "unlisted";
		var blclass_threatlevel = 1; // default for unlisted values
		var blacklist_network_neighbor_cnt = 0;
		var blacklist_network_neighbors = undefined;
		var blacklist_observations = 0;
		var country_code = "";
		var stateprov = "";
		var district = "";
		var city = "";
		var zipcode = "";
		var latitude = "";
		var longitude = "";
		var timezone_offset = "";
		var timezone_name = "";
		var ispname = "";
		var network_types = [];
		var network_names = [];
		var network_groups = [];
		var network_ticpi = 0;
        
        var blacklist_class_cnt = 0;
        


        var sqlPFGetCountryASN = "select country, network_asn_name from phishfry.phishfryCSV where ipint = " + ipint;
		var sqlSWGetCountrySource = "select country_code, source from JEDIBADGERDB.sw where ip_int = " + ipint;
		var sqlGetCountry = "select country, stateprov, district, city, zipcode, latitude, longitude, timezone_offset, timezone_name, " +
								"isp_name from JEDIBADGERDB.dbip_lookup_ipv4 where ip_end_int >= " + ipint + " LIMIT 1";
		var sqlGetNeighborCnt = "select count(distinct ipint) as blacklist_network_neighbors from JEDIBADGERDB.jb_ip_repo " + 
				                 "where ipint between " + minnum + " and " + maxnum + " and bl_date > subdate(curdate(), 90) LIMIT 1";
		var sqlGetNeighbors = "select distinct ipint from JEDIBADGERDB.jb_ip_repo where ipint between " + minnum + " and " + maxnum + " and bl_date > subdate(curdate(), 90)";
		var sqlGetNeighborhoodThreatlevels = "select threatlevel from JEDIBADGERDB.jb_ip_repo a " + 
				                                "left join JEDIBADGERDB.blclass_threatlevel b on a.blclass = b.blclass " +
                						   		"where a.ipint between " + minnum + " and " + maxnum;// and a.bl_date > curdate() - 90";
		var sqlGetRecentObs = "select count(ipint) as blacklist_observations from JEDIBADGERDB.jb_ip_repo where ipint = " + ipint + " and bl_date > subdate(curdate(), 90)  LIMIT 1";
		var sqlGetBLClassCnt = "select count(distinct blclass) as blacklist_class_cnt from JEDIBADGERDB.jb_ip_repo where ipint = " + ipint + " and bl_date > subdate(curdate(), 90)  LIMIT 1";
		var sqlGetNetClassType = "select ipaddress as ipaddress, " +
		                            "ipint as ipinteger, " +
		                            "blclass as blacklist_class, " +
		                            "count(*) as total_observations, " +
		                            "network_class as network_class, " +
		                            "network_type as network_type " +
		                            "from jb_ip_repo where ipint=INET_ATON('" + ip + "') " +
		                            "group by ipaddress, ipint, blclass, network_class, network_type " +
		                            "order by total_observations";
		var sqlGetKnownNetwork = "select network_name, network_group, network_type, network_ticpi from JEDIBADGERDB.caatu_known_networks " + 
		                            "where " + ipint + " between ip_start_int and ip_end_int";
		var sqlGetBlacklistClassDisp = "select displayval from blclass_display_lookup where blclass = ";
		var sqlGetBLClassThreatlevel = "select threatlevel from blclass_threatlevel where blclass = ";
		var sqlGetTicpi = "select country_ticpi from ticpi_lookup where cc = ";

        async.waterfall([
            // Check PhishFry first, set country, network_name, and blacklist_class if present
            (callback) => {
                connection.query(sqlPFGetCountryASN, function (error, results, fields) {
                    if (error) throw error;
                    results.forEach(function(row){
                        country_code = row.country;
                        network_names.push(row.network_asn_name);
                        blacklist_class = "PhishFry";
                    });
                    callback(null);
                });
            },
            // check Shadow Warrior next, set country and blacklist_class if present
            (callback) => {
                
                connection.query(sqlSWGetCountrySource, function (error, results, fields) {
                    if (error) throw error;
                    results.forEach(function(row){
                        country_code = row.country_code;
                        sw_source = row.source;
                    });
                    if(sw_source.toLowerCase() === "non-public")
                        blacklist_class = "Shadow Warrior NON PUBLIC";
                    else if(sw_source.toLowerCase() === "public")
                        blacklist_class = "Shadow Warrior PUBLIC";
                    callback(null);
                });
            },
            // get country of origin and ISP name
            (callback) => {
                
                connection.query(sqlGetCountry, function (error, results, fields) {
                    if (error) throw error;
                    results.forEach(function(row){
                        country_code = row.country;
                        stateprov = row.stateprov;
                        district = row.district;
                        city = row.city;
                        zipcode = row.zipcode;
                        latitude = row.latitude;
                        longitude = row.longitude;
                        timezone_offset = row.timezone_offset;
                        timezone_name = row.timezone_name;
                        ispname = row.isp_name;
                    });
                    callback(null);
                });
            },

            // get blacklisted neighbor count
            (callback) => {
                connection.query(sqlGetNeighborCnt, function (error, results, fields) {
                    if (error) throw error;
                    results.forEach(function(row){
                        blacklist_network_neighbor_cnt = row.blacklist_network_neighbor_cnt;
                    });
                    callback(null);
                });
            },
            // optionally get blacklisted network neighbors
            (callback) => {
                if(listNeighbors){
                    blacklist_network_neighbors = [];
                    connection.query(sqlGetNeighbors, function (error, results, fields) {
                        if (error) throw error;
                        results.forEach(function(row){
                            blacklist_network_neighbors.push(row.ipint);
                        });
                        callback(null);
                        
                    });
                }
                else{
                    callback(null);
                }
                
            },
            // get # recent observations
            (callback) => {
                connection.query(sqlGetRecentObs, function (error, results, fields) {
                    if (error) throw error;
                    results.forEach(function(row){
                        blacklist_observations = row.blacklist_observations;
                    });
                    callback(null);
                });
            },
            // get blacklist class count
            (callback) => {
                connection.query(sqlGetBLClassCnt, function (error, results, fields) {
                    if (error) throw error;
                    results.forEach(function(row){
                        blacklist_class_cnt = row.blacklist_class_cnt;
                    });
                    callback(null);
                });
            },
            // get network type and class
            (callback) => {
                connection.query(sqlGetNetClassType, function (error, results, fields) {
                    if (error) throw error;
                    var tmp = "";
                    results.forEach(function(row){
                        ipaddress = row.ipaddress;
                        ipint = row.ipint;
                        tmp = blacklist_class;
                    });

                    if(ipaddress.length == 0)
					    ipaddress = ip;
				    if(blacklist_class.toLowerCase() === "unlisted" && (tmp.length > 0))
                        blacklist_class = tmp;
                    
                    
                    callback(null);
                });
            },
            // get network name and group
            (callback) => {
                var count = 0;
                connection.query(sqlGetKnownNetwork, function (error, results, fields) {
                    if (error) throw error;
                    results.forEach(function(row){
                        count++;
                        var tmp = row.network_name;
                        if(tmp != null)
                            network_names.push(tmp);
                        tmp = row.network_group;
                        if(tmp != null)
                            network_groups.push(tmp);
                        tmp = row.network_type;
                        if(tmp != null)
                            network_types.push(tmp);
                        network_ticpi = row.network_ticpi;
                    });

                    // if we didn't get an answer for the network, get ticpi from the lookup table
                    if(count == 0)
                    {
                        sqlGetTicpi += "'" + country_code + "'";
                        connection.query(sqlGetTicpi, function (error, results, fields) { 
                            if (error) throw error;
                            results.forEach(function(row){
                                network_ticpi = row.country_ticpi;
                            });
                            callback(null);
                        })
                    }
                    else{
                        callback(null);
                    }

                    
                });
            },
            (callback) => {
                // get blacklist class threat level
                if(blacklist_class.toLowerCase() === "unlisted") {
                    blclass_threatlevel = 1;
                    callback(null);
                } else {
                    sqlGetBLClassThreatlevel += "'" + blacklist_class + "'";
                    connection.query(sqlGetBLClassThreatlevel, function (error, results, fields) { 
                        if (error) throw error;
                        results.forEach(function(row){
                            blclass_threatlevel = row.threatlevel;
                        });
                        callback(null);
                    });
                }
            },
            (callback) => {
                // get blacklist class for display
                if(blacklist_class.toLowerCase() === "PhishFry"){
                    blacklist_class_disp = "ransomware";
                    callback(null);
                }
                else if(blacklist_class.startsWith("Shadow Warrior")){
                    blacklist_class_disp = "tor";
                    callback(null);
                }
                else {
                    sqlGetBlacklistClassDisp += "'" + blacklist_class + "'";
                    connection.query(sqlGetBlacklistClassDisp, function (error, results, fields) {
                        if (error) throw error;
                        results.forEach(function(row){
                            blacklist_class_disp = row.displayval;
                        });
                        callback(null);
                    });
                }
                
            },
            (callback) => {
                // get neighborhood threat levels and calculate statistics
                var cur, nt_max = 0;
                connection.query(sqlGetNeighborhoodThreatlevels, function (error, results, fields) {
                    if (error) throw error;
                    results.forEach(function(row){
                        cur = row.threatlevel;
                        if(cur>nt_max)
                            nt_max = cur;
                        neighborthreats.push(row.threatlevel);
                    });
                    threat_fom = ipHelpers.getThreatFOM(blclass_threatlevel, nt_max, network_ticpi);
                    fom_classification = ipHelpers.getFomClassification(threat_fom, blacklist_class);
                    connection.end();
                    callback(null);
                });
            },
            (callback) => {
                // build JSON response
			    if(verbosity.toLowerCase() === "terse") {
                    json.ipaddress = ipaddress;
                    json.threat_potential_score_pct = threat_fom;
                    json.threat_classification = fom_classification;
                }
                else{
                    json.ipaddress = ipaddress;
                    json.ipint = ipint;
                    json.threat_potential_score_pct = threat_fom;
                    json.threat_classification = fom_classification;
                    json.blacklist_class = blacklist_class_disp;
                    json.blacklist_class_cnt = blacklist_class_cnt;
                    json.blacklist_network_neighbor_cnt = blacklist_network_neighbor_cnt;
                    json.blacklist_observations = blacklist_observations;
                    json.country = country_code;
                    json.stateprov = stateprov;
                    json.district = district;
                    json.city = city;
                    json.zipcode = zipcode;
                    json.location = latitude + "," + longitude;
                    json.latitude = latitude;
                    json.longitude = longitude;
                    json.timezone_offset = timezone_offset;
                    json.timezone_name = timezone_name;
                    json.ispname = ispname;
                    json.network_type = network_types;
                    json.network_group = network_groups;
                    json.network_name = network_names;
                    if(blacklist_network_neighbors){
                        // if int notation is specified, leave the list as longs, otherwise write
                        // dot notation
                        var bl_net_neighbors = [];
                        if(notation.toLowerCase() === "int") {
                            blacklist_network_neighbors.forEach(function(neighbor){
                                bl_net_neighbors.push(neighbor);
                            });
                        }
                        else {
                            blacklist_network_neighbors.forEach(function(neighbor){
                                bl_net_neighbors.push(ipHelpers.getIPOrdered(neighbor));
                            });
                        }
                        json.blacklist_network_neighbors = bl_net_neighbors;
                    }
                }
                callback(null);
                cb(null, json);
            }
        ]);
    }
}