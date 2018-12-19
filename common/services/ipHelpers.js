const MULTIPLIER = [16777216,65536,256,1];
module.exports = { 
    getIP: (ip) => {
        var st = ip.split(".");
        if (st.length != 4) throw new Error("Invalid IPv4 address: " + ip);
        var ipNumeric = 0;
        var z = st.length - 1;
        
        for (var n = 0; n < st.length; n++) {
            ipNumeric += st[n] * MULTIPLIER[n];
        }
        return ipNumeric;
    },
    getIPOrdered: (ipInt) => {
        var part1 = ipInt & 255;
        var part2 = ((ipInt >> 8) & 255);
        var part3 = ((ipInt >> 16) & 255);
        var part4 = ((ipInt >> 24) & 255);
        return part4 + "." + part3 + "." + part2 + "." + part1;	
    },
    getFomClassification: (fom, blclass) =>{
        /*High > Greater than 75% threat score
        - Medium > Greater than 50% and less than 75%
        - Low < Less than 50%
        - Nuisance - less than 20%*/
        
        if(fom > 70)
            return "High";
        if(fom > 40)
            return "Medium";
        if((fom <= 20) && (blclass.toLowerCase() === "unlisted"))
            return "Low";
        
        return "Nuisance";
    },
    getThreatFOM: (blclass_threatlevel, nt_max, network_ticpi) => {
        // 50, 30, 20 weighting
        var fom = blclass_threatlevel*10 + nt_max*6 + ((100-network_ticpi) / 5);
        
        return fom;
    }
}