
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("esri.map");
dojo.require("esri.arcgis.utils");
dojo.require("esri.dijit.Legend");
dojo.require("esri.dijit.Scalebar");
dojo.require("esri.dijit.Geocoder");

dojo.require("esri.geometry.Point");
dojo.require("esri.SpatialReference");

var feat={};
 feat.popstring=null;
 feat.agestring=null;
 feat.household=null;  
 feat.houstring=null;
 feat.gqstring=null;
  
 feat.pop_piedata=[];
 
feat.vacdata=[];
feat.vacset=[];
feat.agedata=[];
feat.ageset=[];
 
	  
var app ={};
app.printer=null;
app.map=null;
app.Geocoder=null;
app.FeatureXName=null;
app.movescroll=null;
app.legend=null;
app.resizeTimer=null;
app.legendLayers = [];
app.selectedbtn=null;

var themevar="None";  //global for print
var passlayer = null;

var csvobj=new Object();

var outlinelayer="None";
var countyLayer="None";
var basemap;
var basemapname;
var chgflag=0;

var params;





	function chgFunction(lnglayername){
	

				app.map.infoWindow.hide();
				if (document.getElementById("accordion") === null) {
					//initaccordion(lnglayername);  deleted
				}
	
		//outlinelayer="None";
		//if(countyLayer!="None"){app.map.removeLayer(countyLayer);};
	    //countyLayer="None";
	
		passlayer = lnglayername;
		
		var clayer = app.map.getLayer(lnglayername);
		var currentlayer;
		
		clayer.setVisibility(true);


		dojo.forEach(app.map.graphicsLayerIds, function (id) {
		currentlayer=app.map.getLayer(id);
		if(currentlayer!=clayer){currentlayer.setVisibility(false);}		
		});
				
				chgflag=1;
				myFunction(themevar);		
	}

	


function commafy(nStr) {
	var x, x1, x2, rgx;

	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}


function chartmaker(homevaldata, thedivid, labelset) {

	var w, h, barPadding, dataset, maxval, svg, increase, dchange, label;

	//Width and height
	w = 274;
	h = 185;
	barPadding = 1;

	dataset = homevaldata;
	maxval = d3.max(dataset);


	//Create SVG element
	svg = d3.select(thedivid)
		.append("svg")
		.attr("width", w+11)
		.attr("height", h);

	svg.selectAll("rect")
		.data(dataset)
		.enter()
		.append("rect")
		.attr("x", function (d, i) {
		return ((i * (w / dataset.length)) + 11);
	})
		.attr("y", function (d) {
		return ((100 - 20) - (((100 - 20) / maxval) * d) + 20);
	})
		.attr("width", w / dataset.length - barPadding)
		.attr("height", function (d) {
		return (((100 - 20) / maxval) * d);
	})
		.attr("fill", "#62BBE9");

	svg.selectAll("text")
		.data(dataset)
		.enter()
		.append("text")
		.text(function (d) {
		return commafy(d);
	})
		.attr("text-anchor", "middle")
		.attr("x", function (d, i) {
		return ((i * (w / dataset.length) + (w / dataset.length - barPadding) / 2) + 10);
	})
		.attr("y", function (d) {
		return ((100 - 20) - (((100 - 20) / maxval) * d) + 20) - 5;
	})
		.attr("font-family", "sans-serif")
		.attr("font-size", "9px")
		.attr("fill", "#474747");


	// horizontal line for the x-axis
	svg.append("line")
		.attr("x1", 10)
		.attr("x2", w+11)
		.attr("y1", 101)
		.attr("y2", 101)
		.style("stroke", "navy");

	increase = -6;
	dchange = (w / labelset.length);

	for (label in labelset) {
		svg.append("text")
			.attr("class", "x label")
			.attr("x", 106)
			.attr("y", increase - (dchange / 2))
			.attr("transform", "rotate(90)")
			.text(labelset[label])
			.attr("font-family", "sans-serif")
			.attr("font-size", "11px")
			.attr("fill", "#474747");

		increase = increase - dchange;

	}


}

function piemaker(data, div, domain, range) {

	var v_pie, radians, degrees, a, width, height, radius, color, arc, pie, svg, g;

	function edge(d, i) {
		var r = radius,
			a = (d.startAngle + d.endAngle) / 2 - v_pie / 2;
		return [Math.cos(a) * r, Math.sin(a) * r];
	}

	function angle(d, i) {
		var a = degrees * ((d.startAngle + d.endAngle) / 2 - v_pie / 2);
		return a;
	}


	v_pie = Math.PI;
	radians = v_pie / 180;
	degrees = 180 / v_pie;

	width = 276;
	height = 220;
	radius = Math.min(width, height * 0.32) / 2;

	color = d3.scale.ordinal()
		.domain(domain)
		.range(range);

	arc = d3.svg.arc()
		.outerRadius(radius + 63)
		.innerRadius(0);

	pie = d3.layout.pie()
		.sort(null)
		.value(function (d) {
		return d.population;
	});

	svg = d3.select(div).append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	data.forEach(function (d) {
		d.population = +d.population;
	});

	g = svg.selectAll(".arc")
		.data(pie(data))
		.enter().append("g")
		.attr("class", "arc");

	g.append("path")
		.attr("d", arc)
		.style("fill", function (d) {
		return color(d.data.age);
	})
		.style("stroke", "#fff");


	g.append("text")
		.attr("transform", function (d) {
		var rstr = "translate(" + edge(d) + ") " + "rotate(" + (a = angle(d), (a > 90 ? a - 180 : a)) + ")";
		return rstr;
	})
		.attr("dy", ".35em")
		.style("text-anchor", function (d) {
		return angle(d) > 90 ? "end" : "start";
	})
		.text(function (d) {
		return d.data.age;
	})
		.attr("font-family", "sans-serif")
		.attr("font-size", "11px")
		.attr("fill", "#fff");


}





//Handle resize of browser

function resizeMap() {
	clearTimeout(app.resizeTimer);
	app.resizeTimer = setTimeout(function () {
		app.map.resize();
		app.map.reposition();
		  var paneheight=($('#rightPane').height());
  var contentheight=paneheight-125-40;
  $('#richcontent').height(contentheight+'px');
	}, 800);
}

function aboveboxclick() {

	$("#thematicbox").toggle();

	if ($('#thematicbox').is(':visible')) {
		$('#arrowdir').attr('src',
			'https://dola.colorado.gov/gis-php/files/gis-images/menu_arrow2.png');
	} else {
		$('#arrowdir').attr('src',
			'https://dola.colorado.gov/gis-php/files/gis-images/expand_arrow2.png');
	}
}



function chgoutline() {
outlinelayer=$('#outlinelayer').val();

if(outlinelayer=="None"){
countyLayer="None";
}else{

   if(outlinelayer=='Block Group'){layerurl="https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/BlockGroupC2010v3/FeatureServer/0";}
   if(outlinelayer=='Tract'){layerurl="https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/Tract_C2010v3/FeatureServer/0";}
   if(outlinelayer=='County'){layerurl="https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/County_C2010v3/FeatureServer/0";}
   if(outlinelayer=='County Subdivision'){layerurl="https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/CountySub_C2010v3/FeatureServer/0";}
   if(outlinelayer=='Place'){layerurl="https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/Place_C2010v3/FeatureServer/0";}
   if(outlinelayer=='School District'){layerurl="https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/SchoolDist_C2010v3/FeatureServer/0";}
   if(outlinelayer=='CBSA'){layerurl="https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/CBSA_C2010v3/FeatureServer/0";}
   if(outlinelayer=='CSA'){layerurl="https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/CSA_C2010v3/FeatureServer/0";}
   if(outlinelayer=='State'){layerurl="https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/State_C2010v3/FeatureServer/0";}
   if(outlinelayer=='Zipcode'){layerurl="https://services.arcgis.com/IamIM3RJ5xHykalK/ArcGIS/rest/services/Zipcode_C2010v3/FeatureServer/0";}
   
   countyLayer = new esri.layers.FeatureLayer(layerurl,{
          mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
          outFields: ["*"]
        });
		
		var defaultSymbol;
		
				//for county layer
		defaultSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NULL, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,0]), 2.5),new dojo.Color([0,0,0,0.8]));
		if(outlinelayer=='Place'){defaultSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NULL, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,0]), 2),new dojo.Color([0,0,0,0.8]));}
		
		var renderer2 = new esri.renderer.SimpleRenderer(defaultSymbol);
		
		countyLayer.setRenderer(renderer2);
		app.map.addLayer(countyLayer);
}


};	


//you can also call different infowindows depending upon what layer or style you want
//var template = "<b>${STATENAME}</b>: has an activity level of ${ACTIVITY_LEVEL}";

function getTextContent(graphic) {


  var graphicAttributes, population, hispanic, pcthispanic, white, pctwhite, black, pctblack, namerican,
                        pctnamerican, asian, pctasian, hawaiian, pcthawaiian, otherr, pctotherr, twoplus, pcttwoplus,
                        male, pctmale, female, pctfemale, ageless18, pctageless18, age65plus, pctage65plus, medage,
                        age1824, pctage1824, age2534, pctage2534, age3544, pctage3544, age4564, pctage4564, housingu,
                        occhu, pctocchu, vachu, pctvachu, owned, pctowned, rented, pctrented, households, famhh,
                        pctfamhh, nonfam, pctnonfam, hhalone, pcthhalone, avgfam, avghh, gqpop, gqinst, pctgqinst,
                        gqcorrec, pctgqcorrec, gqjuvenile, pctgqjuvenile, gqnurs, pctgqnurs, gqothinst, pctgqothinst, 
						gqnoninst, pctgqnoninst, gqcollege, pctgqcollege, gqmilitary, pctgqmilitary, gqothnoni, pctgqothnoni, 
						vvacancy, vforrent, pctvforrent, vforsale, pctvforsale, vrnotocc, pctvrnotocc, vsnotocc, pctvsnotocc, 
						vseasonal, pctvseasonal, vmigrant, pctvmigrant, vother, pctvother, vacdata, vacset, agedata, ageset, 
						namegeo, template, active, pop_piedata, tempinc, allother, obj;


	graphicAttributes = graphic.attributes;
	
	
	//for CSV export
	  csvobj.elements=[graphicAttributes.GEOID10, graphicAttributes.NAME10, graphicAttributes.NAMELSAD10, graphicAttributes.INTPTLAT10, graphicAttributes.INTPTLON10, graphicAttributes.POP2010, graphicAttributes.HISPANIC, graphicAttributes.WHITE_NH, graphicAttributes.BLACK_NH, graphicAttributes.AMERIND_NH, graphicAttributes.ASIAN_NH, graphicAttributes.HAWPAC_NH, graphicAttributes.OTHER_NH, graphicAttributes.MULT_NH, graphicAttributes.MALE, graphicAttributes.FEMALE, graphicAttributes.AGEUNDER18, graphicAttributes.AGE18TO24, graphicAttributes.AGE25TO34, graphicAttributes.AGE35TO44, graphicAttributes.AGE45TO64, graphicAttributes.AGE65PLUS, graphicAttributes.AGE0TO9, graphicAttributes.AGE10TO19, graphicAttributes.AGE20TO29, graphicAttributes.AGE30TO39, graphicAttributes.AGE40TO49, graphicAttributes.AGE50TO59, graphicAttributes.AGE60TO69, graphicAttributes.AGE70TO79, graphicAttributes.AGE80P, graphicAttributes.MED_AGE, graphicAttributes.HOUSEHOLDS, graphicAttributes.FAMILY_HH, graphicAttributes.NON_FAM, graphicAttributes.HH_ALONE, graphicAttributes.HH_N_ALONE, graphicAttributes.HOUSING_UN, graphicAttributes.OCCUPIED, graphicAttributes.VACANT, graphicAttributes.OWNER, graphicAttributes.RENTER, graphicAttributes.V_FORRENT, graphicAttributes.V_R_NOTOCC, graphicAttributes.V_FORSALE, graphicAttributes.V_S_NOTOCC, graphicAttributes.V_SEASONAL, graphicAttributes.V_MIGRANT, graphicAttributes.V_OTHER, graphicAttributes.GQ_POP, graphicAttributes.GQ_INST, graphicAttributes.GQ_CORREC, graphicAttributes.GQ_JUVENL, graphicAttributes.GQ_NURS, graphicAttributes.GQ_OT_INST, graphicAttributes.GQ_NONINST, graphicAttributes.GQ_COLLEGE, graphicAttributes.GQ_MILTRY, graphicAttributes.GQ_O_NONI, graphicAttributes.PCT_HISP, graphicAttributes.PCT_WHITE, graphicAttributes.PCT_BLACK, graphicAttributes.PCT_AMIND, graphicAttributes.PCT_ASIAN, graphicAttributes.PCT_HAWPI, graphicAttributes.PCT_OTHER, graphicAttributes.PCT_MULT, graphicAttributes.PCT_MALE, graphicAttributes.PCT_FEM, graphicAttributes.PCT_U18, graphicAttributes.PCT18T24, graphicAttributes.PCT25T34, graphicAttributes.PCT35T44, graphicAttributes.PCT45T64, graphicAttributes.PCT_65PLUS, graphicAttributes.PCT0T9, graphicAttributes.PCT10T19, graphicAttributes.PCT20T29, graphicAttributes.PCT30T39, graphicAttributes.PCT40T49, graphicAttributes.PCT50T59, graphicAttributes.PCT60T69, graphicAttributes.PCT70T79, graphicAttributes.PCT80P, graphicAttributes.PCTFAMHH, graphicAttributes.PCTNFAMHH, graphicAttributes.PCTHHALN, graphicAttributes.PCTHHNALN, graphicAttributes.PCT_OCC, graphicAttributes.PCT_VAC, graphicAttributes.PCT_OWN, graphicAttributes.PCT_RENT].join(',');
	
	population = commafy(graphicAttributes.POP2010);
                hispanic = commafy(graphicAttributes.HISPANIC);
                pcthispanic = ((graphicAttributes.HISPANIC / graphicAttributes.POP2010) * 100).toFixed(1);
                white = commafy(graphicAttributes.WHITE_NH);
                pctwhite = ((graphicAttributes.WHITE_NH / graphicAttributes.POP2010) * 100).toFixed(1);
                black = commafy(graphicAttributes.BLACK_NH);
                pctblack = ((graphicAttributes.BLACK_NH / graphicAttributes.POP2010) * 100).toFixed(1);
                namerican = commafy(graphicAttributes.AMERIND_NH);
                pctnamerican = ((graphicAttributes.AMERIND_NH / graphicAttributes.POP2010) * 100).toFixed(1);
                asian = commafy(graphicAttributes.ASIAN_NH);
                pctasian = ((graphicAttributes.ASIAN_NH / graphicAttributes.POP2010) * 100).toFixed(1);
                hawaiian = commafy(graphicAttributes.HAWPAC_NH);
                pcthawaiian = ((graphicAttributes.HAWPAC_NH / graphicAttributes.POP2010) * 100).toFixed(1);
                otherr = commafy(graphicAttributes.OTHER_NH);
                pctotherr = ((graphicAttributes.OTHER_NH / graphicAttributes.POP2010) * 100).toFixed(1);
                twoplus = commafy(graphicAttributes.MULT_NH);
                pcttwoplus = ((graphicAttributes.MULT_NH / graphicAttributes.POP2010) * 100).toFixed(1);

                male = commafy(graphicAttributes.MALE);
                pctmale = ((graphicAttributes.MALE / graphicAttributes.POP2010) * 100).toFixed(1);
                female = commafy(graphicAttributes.FEMALE);
                pctfemale = ((graphicAttributes.FEMALE / graphicAttributes.POP2010) * 100).toFixed(1);
                ageless18 = commafy(graphicAttributes.AGEUNDER18);
                pctageless18 = ((graphicAttributes.AGEUNDER18 / graphicAttributes.POP2010) * 100).toFixed(1);
                age65plus = commafy(graphicAttributes.AGE65PLUS);
                pctage65plus = ((graphicAttributes.AGE65PLUS / graphicAttributes.POP2010) * 100).toFixed(1);
                medage = commafy(graphicAttributes.MED_AGE);


                age1824 = commafy(graphicAttributes.AGE18TO24);
                pctage1824 = ((graphicAttributes.AGE18TO24 / graphicAttributes.POP2010) * 100).toFixed(1);
                age2534 = commafy(graphicAttributes.AGE25TO34);
                pctage2534 = ((graphicAttributes.AGE25TO34 / graphicAttributes.POP2010) * 100).toFixed(1);
                age3544 = commafy(graphicAttributes.AGE35TO44);
                pctage3544 = ((graphicAttributes.AGE35TO44 / graphicAttributes.POP2010) * 100).toFixed(1);
                age4564 = commafy(graphicAttributes.AGE45TO64);
                pctage4564 = ((graphicAttributes.AGE45TO64 / graphicAttributes.POP2010) * 100).toFixed(1);

                //to eliminate showing NaN% when no Pop.
                if (graphicAttributes.POP2010 == '0') {
                    pcthispanic = '0';
                    pctwhite = '0';
                    pctblack = '0';
                    pctnamerican = '0';
                    pctasian = '0';
                    pcthawaiian = '0';
                    pctotherr = '0';
                    pcttwoplus = '0';
                    pctmale = '0';
                    pctfemale = '0';
                    pctageless18 = '0';
                    pctage65plus = '0';
                    pctage1824 = '0';
                    pctage2534 = '0';
                    pctage3544 = '0';
                    pctage4564 = '0';
                }


                housingu = commafy(graphicAttributes.HOUSING_UN);
                occhu = commafy(graphicAttributes.OCCUPIED);
                pctocchu = ((graphicAttributes.OCCUPIED / graphicAttributes.HOUSING_UN) * 100).toFixed(1);
                vachu = commafy(graphicAttributes.VACANT);
                pctvachu = ((graphicAttributes.VACANT / graphicAttributes.HOUSING_UN) * 100).toFixed(1);
                owned = commafy(graphicAttributes.OWNER);
                pctowned = ((graphicAttributes.OWNER / graphicAttributes.OCCUPIED) * 100).toFixed(1);
                rented = commafy(graphicAttributes.RENTER);
                pctrented = ((graphicAttributes.RENTER / graphicAttributes.OCCUPIED) * 100).toFixed(1);
                //to eliminate showing NaN% when no HU.
                if (graphicAttributes.HOUSING_UN == '0') {
                    pctocchu = '0';
                    pctvachu = '0';
                    pctowned = '0';
                    pctrented = '0';
                }



                households = commafy(graphicAttributes.HOUSEHOLDS);
                famhh = commafy(graphicAttributes.FAMILY_HH);
                pctfamhh = ((graphicAttributes.FAMILY_HH / graphicAttributes.HOUSEHOLDS) * 100).toFixed(1);
                nonfam = commafy(graphicAttributes.NON_FAM);
                pctnonfam = ((graphicAttributes.NON_FAM / graphicAttributes.HOUSEHOLDS) * 100).toFixed(1);
                hhalone = commafy(graphicAttributes.HH_ALONE);
                pcthhalone = ((graphicAttributes.HH_ALONE / graphicAttributes.HOUSEHOLDS) * 100).toFixed(1);
                avgfam = commafy(graphicAttributes.AVG_FAM);
                avghh = commafy(graphicAttributes.AVG_HH);
                //to eliminate showing NaN% when no HH.
                if (graphicAttributes.HOUSEHOLDS == '0') {
                    pctfamhh = '0';
                    pctnonfam = '0';
                    pcthhalone = '0';
                }

                gqpop = commafy(graphicAttributes.GQ_POP);
                gqinst = commafy(graphicAttributes.GQ_INST);
                pctgqinst = ((graphicAttributes.GQ_INST / graphicAttributes.GQ_POP) * 100).toFixed(1);
                gqcorrec = commafy(graphicAttributes.GQ_CORREC);
                pctgqcorrec = ((graphicAttributes.GQ_CORREC / graphicAttributes.GQ_POP) * 100).toFixed(1);
				gqjuvenile = commafy(graphicAttributes.GQ_JUVENL);
				pctgqjuvenile = ((graphicAttributes.GQ_JUVENL/graphicAttributes.GQ_POP)*100).toFixed(1);				
				gqnurs = commafy(graphicAttributes.GQ_NURS);
                pctgqnurs = ((graphicAttributes.GQ_NURS / graphicAttributes.GQ_POP) * 100).toFixed(1);
                gqothinst = commafy(graphicAttributes.GQ_OT_INST);
                pctgqothinst = ((graphicAttributes.GQ_OT_INST / graphicAttributes.GQ_POP) * 100).toFixed(1);
                gqnoninst = commafy(graphicAttributes.GQ_NONINST);
                pctgqnoninst = ((graphicAttributes.GQ_NONINST / graphicAttributes.GQ_POP) * 100).toFixed(1);
                gqcollege = commafy(graphicAttributes.GQ_COLLEGE);
                pctgqcollege = ((graphicAttributes.GQ_COLLEGE / graphicAttributes.GQ_POP) * 100).toFixed(1);
                gqmilitary = commafy(graphicAttributes.GQ_MILTRY);
                pctgqmilitary = ((graphicAttributes.GQ_MILTRY / graphicAttributes.GQ_POP) * 100).toFixed(1);
                gqothnoni = commafy(graphicAttributes.GQ_O_NONI);
                pctgqothnoni = ((graphicAttributes.GQ_O_NONI / graphicAttributes.GQ_POP) * 100).toFixed(1);
                //to eliminate showing NaN% when no group quarters pop.
                if (graphicAttributes.GQ_POP == '0') {
                    pctgqinst = '0';
					pctgqjuvenile ='0';
                    pctgqcorrec = '0';
                    pctgqnurs = '0';
                    pctgqothinst = '0';
                    pctgqnoninst = '0';
                    pctgqcollege = '0';
                    pctgqmilitary = '0';
                    pctgqothnoni = '0';
                }


                vvacancy = commafy(graphicAttributes.VACANT);
                vforrent = commafy(graphicAttributes.V_FORRENT);
                pctvforrent = ((graphicAttributes.V_FORRENT / graphicAttributes.VACANT) * 100).toFixed(1);
                vforsale = commafy(graphicAttributes.V_FORSALE);
                pctvforsale = ((graphicAttributes.V_FORSALE / graphicAttributes.VACANT) * 100).toFixed(1);
				vrnotocc = commafy(graphicAttributes.V_R_NOTOCC);
				pctvrnotocc = ((graphicAttributes.V_R_NOTOCC/graphicAttributes.VACANT)*100).toFixed(1);
				vsnotocc = commafy(graphicAttributes.V_S_NOTOCC);
				pctvsnotocc = ((graphicAttributes.V_S_NOTOCC/graphicAttributes.VACANT)*100).toFixed(1);				
                vseasonal = commafy(graphicAttributes.V_SEASONAL);
                pctvseasonal = ((graphicAttributes.V_SEASONAL / graphicAttributes.VACANT) * 100).toFixed(1);
                vmigrant = commafy(graphicAttributes.V_MIGRANT);
                pctvmigrant = ((graphicAttributes.V_MIGRANT / graphicAttributes.VACANT) * 100).toFixed(1);
                vother = commafy(graphicAttributes.V_OTHER);
                pctvother = ((graphicAttributes.V_OTHER / graphicAttributes.VACANT) * 100).toFixed(1);
                //to eliminate showing NaN% when no HU.
                if (graphicAttributes.VACANT == '0') {
                    pctvforrent = '0';
                    pctvforsale = '0';
                    pctvrnotocc = '0';
					pctvsnotocc = '0';
                    pctvseasonal = '0';
                    pctvmigrant = '0';
                    pctvother = '0';
                }


 //all chart data compiled here
				feat.vacdata = [graphicAttributes.V_FORRENT, graphicAttributes.V_R_NOTOCC, graphicAttributes.V_FORSALE, graphicAttributes.V_S_NOTOCC, graphicAttributes.V_SEASONAL, graphicAttributes.V_MIGRANT, graphicAttributes.V_OTHER];
				feat.vacset=["For Rent", "Rented, Not Occ.", "For Sale", "Sold, Not Occ.", "Seasonal", "M. Worker", "Other"];

				feat.agedata = [graphicAttributes.AGE0TO9, graphicAttributes.AGE10TO19, graphicAttributes.AGE20TO29, graphicAttributes.AGE30TO39, graphicAttributes.AGE40TO49, graphicAttributes.AGE50TO59, graphicAttributes.AGE60TO69, graphicAttributes.AGE70TO79, graphicAttributes.AGE80P];
				feat.ageset=["Age 0-9", "10 - 19", "20 - 29", "30 - 39", "40 - 49", "50 - 59", "60 - 69", "70 - 79", "Age 80+"];




                namegeo = "<b>${NAMELSAD10}</b>";

	feat.popstring = "<div><br /><table style='border-collapse:collapse; width:273px'><tr><td></td><td style='text-align:right'><i><font color='blue'></font></i></td><td style='text-align:right'><font color='blue'>PCT</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;Population:</td><td style='text-align:right'>" + population +
                    "</td><td></td></tr>" +

                "<tr><td></td><td></td><td></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT_HISP' class='t_btn' onclick='myFunction(this.id);' >Hispanic</span></td><td style='text-align:right'>" +
                    hispanic + "</td><td style='text-align:right'><font color='grey'>" + pcthispanic +
                    "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT_WHITE'  class='t_btn' onclick='myFunction(this.id);' >White</span></td><td style='text-align:right'>" +
                    white + "</td><td style='text-align:right'><font color='grey'>" + pctwhite + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT_BLACK'  class='t_btn' onclick='myFunction(this.id);' >Black</span></td><td style='text-align:right'>" +
                    black + "</td><td style='text-align:right'><font color='grey'>" + pctblack + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT_AMIND'  class='t_btn' onclick='myFunction(this.id);' >Native Am</span></td><td style='text-align:right'>" +
                    namerican + "</td><td style='text-align:right'><font color='grey'>" + pctnamerican +
                    "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT_ASIAN'  class='t_btn' onclick='myFunction(this.id);' >Asian</span>&nbsp;</td><td style='text-align:right'>" +
                    asian + "</td><td style='text-align:right'><font color='grey'>" + pctasian + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT_HAWPI'  class='t_btn' onclick='myFunction(this.id);' >Haw/PacIs</span></td><td style='text-align:right'>" +
                    hawaiian + "</td><td style='text-align:right'><font color='grey'>" + pcthawaiian +
                    "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT_OTHER'  class='t_btn' onclick='myFunction(this.id);' >Other Race</span></td><td style='text-align:right'>" +
                    otherr + "</td><td style='text-align:right'><font color='grey'>" + pctotherr + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT_MULT'  class='t_btn' onclick='myFunction(this.id);' >Two Races+</span></td><td style='text-align:right'>" +
                    twoplus + "</td><td style='text-align:right'><font color='grey'>" + pcttwoplus +
                    "%</font></td></tr>" +

                "</table><br /><div id='pop_pie'></div></div>";
	
	feat.agestring = "<div><br /><table style='border-collapse:collapse; width:273px'>" +

                "<tr><td></td><td style='text-align:right'><i><font color='blue'></font></i></td><td style='text-align:right'><font color='blue'>PCT</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;Male:</td><td style='text-align:right'>" + male +
                    "</td><td style='text-align:right'><font color='grey'>" + pctmale + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;Female:</td><td style='text-align:right'>" + female +
                    "</td><td style='text-align:right'><font color='grey'>" + pctfemale + "%</font></td></tr>" +

                "<tr><td></td><td></td><td></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT_U18'  class='t_btn' onclick='myFunction(this.id);' >Age less than 18</span></td><td style='text-align:right'>" +
                    ageless18 + "</td><td style='text-align:right'><font color='grey'>" + pctageless18 +
                    "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT18T24'  class='t_btn' onclick='myFunction(this.id);' >Age 18 to 24</span></td><td style='text-align:right'>" +
                    age1824 + "</td><td style='text-align:right'><font color='grey'>" + pctage1824 +
                    "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT25T34'  class='t_btn' onclick='myFunction(this.id);' >Age 25 to 34</span></td><td style='text-align:right'>" +
                    age2534 + "</td><td style='text-align:right'><font color='grey'>" + pctage2534 +
                    "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT35T44'  class='t_btn' onclick='myFunction(this.id);' >Age 35 to 44</span></td><td style='text-align:right'>" +
                    age3544 + "</td><td style='text-align:right'><font color='grey'>" + pctage3544 +
                    "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT45T64'  class='t_btn' onclick='myFunction(this.id);' >Age 45 to 64</span></td><td style='text-align:right'>" +
                    age4564 + "</td><td style='text-align:right'><font color='grey'>" + pctage4564 +
                    "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT_65PLUS'  class='t_btn' onclick='myFunction(this.id);' >Age 65+</span></td><td style='text-align:right'>" +
                    age65plus + "</td><td style='text-align:right'><font color='grey'>" + pctage65plus +
                    "%</font></td></tr>" +

                "<tr><td></td><td></td><td></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='MED_AGE'  class='t_btn' onclick='myFunction(this.id);' >Median Age</span></td><td style='text-align:right'>" +
                    medage + "</td><td></td></tr>" +


                "</table><br /><div id='pop_pyr'></div></div>";
				
			
	feat.household = "<div><br /><table style='border-collapse:collapse; width:273px'>" +

                "<tr><td></td><td style='text-align:right'><i><font color='blue'></font></i></td><td style='text-align:right'><font color='blue'>PCT</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;Households:</td><td style='text-align:right'>" + households +
                    "</td><td></td></tr>" +

                "<tr><td></td><td></td><td></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCTHHALN'  class='t_btn' onclick='myFunction(this.id);' >Living Alone</span></td><td style='text-align:right'>" +
                    hhalone + "</td><td style='text-align:right'><font color='grey'>" + pcthhalone +
                    "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCTFAMHH'  class='t_btn' onclick='myFunction(this.id);' >Family Households</span></td><td style='text-align:right'>" +
                    famhh + "</td><td style='text-align:right'><font color='grey'>" + pctfamhh + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCTNFAMHH'  class='t_btn' onclick='myFunction(this.id);' >Non-Family Households</span></td><td style='text-align:right'>" +
                    nonfam + "</td><td style='text-align:right'><font color='grey'>" + pctnonfam + "%</font></td></tr>" +

                "<tr><td></td><td></td><td></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='AVG_HH'  class='t_btn' onclick='myFunction(this.id);' >Average Household Size</span></td><td style='text-align:right'>" +
                    avghh + "</td><td style='text-align:right'><font color='grey'>" + "</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='AVG_FAM'  class='t_btn' onclick='myFunction(this.id);' >Average Family Size</span></td><td style='text-align:right'>" +
                    avgfam + "</td><td style='text-align:right'><font color='grey'>" + "</font></td></tr>" +

                "</table><br /></div>";
				
	
	feat.houstring = "<div><br /><table style='border-collapse:collapse; width:273px'>" +

                "<tr><td></td><td style='text-align:right'><i><font color='blue'></font></i></td><td style='text-align:right'><font color='blue'>PCT</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;Housing Units:</td><td style='text-align:right'>" + housingu +
                    "</td><td></td></tr>" +

                "<tr><td></td><td></td><td></td></tr>" +
				
                "<tr><td>&nbsp;&nbsp;Owned</td><td style='text-align:right'>" + owned +
                    "</td><td style='text-align:right'><font color='grey'>" + pctowned + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT_RENT'  class='t_btn' onclick='myFunction(this.id);' >Rented:</span></td><td style='text-align:right'>" +
                    rented + "</td><td style='text-align:right'><font color='grey'>" + pctrented + "%</font></td></tr>" +				
				
                "<tr><td></td><td></td><td></td></tr>" +

                "<tr><td>&nbsp;&nbsp;Occupied</td><td style='text-align:right'>" + occhu +
                    "</td><td style='text-align:right'><font color='grey'>" + pctocchu + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT_VAC'  class='t_btn' onclick='myFunction(this.id);' >Vacant</span></td><td style='text-align:right'>" +
                    vachu + "</td><td style='text-align:right'><font color='grey'>" + pctvachu + "%</font></td></tr>" +

                "<tr><td></td><td></td><td></td></tr>" +
                "<tr><td></td><td></td><td></td></tr>" +	
				
                "<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;Vacant For Rent:</td><td style='text-align:right'>" + vforrent +
                    "</td><td style='text-align:right'><font color='grey'>" + pctvforrent + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;Vacant For Sale:</td><td style='text-align:right'>" + vforsale +
                    "</td><td style='text-align:right'><font color='grey'>" + pctvforsale + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;Rented, Not Occ:</td><td style='text-align:right'>" + vrnotocc +
                    "</td><td style='text-align:right'><font color='grey'>" + pctvrnotocc + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;Sold, Not Occ:</td><td style='text-align:right'>" + vsnotocc +
                    "</td><td style='text-align:right'><font color='grey'>" + pctvsnotocc + "%</font></td></tr>" +					

                "<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;Seasonal:&nbsp;</td><td style='text-align:right'>" + vseasonal +
                    "</td><td style='text-align:right'><font color='grey'>" + pctvseasonal + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;Migrant Worker:</td><td style='text-align:right'>" + vmigrant +
                    "</td><td style='text-align:right'><font color='grey'>" + pctvmigrant + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;Vacant - Other:</td><td style='text-align:right'>" + vother +
                    "</td><td style='text-align:right'><font color='grey'>" + pctvother + "%</font></td></tr>" +					
					
                "</table><br /><div id='vac_chart'></div></div>";
	


	
	feat.gqstring = "<div><br /><table style='border-collapse:collapse; width:273px'>" +

                "<tr><td></td><td style='text-align:right'><i><font color='blue'></font></i></td><td style='text-align:right'><font color='blue'>PCT</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='GQ_POP'  class='t_btn' onclick='myFunction(this.id);' >Group Quarters Pop.</span></td><td style='text-align:right'>" +
                    gqpop + "</td><td></td></tr>" +

                "<tr><td></td><td></td><td></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='GQ_INST'  class='t_btn' onclick='myFunction(this.id);' >Institutionalized</span></td><td style='text-align:right'>" +
                    gqinst + "</td><td style='text-align:right'><font color='grey'>" + "</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='GQ_CORREC'  class='t_btn' onclick='myFunction(this.id);' >- Correctional Facility</span></td><td style='text-align:right'>" +
                    gqcorrec + "</td><td style='text-align:right'><font color='grey'>" + pctgqcorrec +
                    "%</font></td></tr>" +
					
                "<tr><td>&nbsp;&nbsp;<span id='GQ_JUVENL'  class='t_btn' onclick='myFunction(this.id);' >- Juvenile Facility</span></td><td style='text-align:right'>" +
                    gqjuvenile + "</td><td style='text-align:right'><font color='grey'>" + pctgqjuvenile +
                    "%</font></td></tr>" +										

                "<tr><td>&nbsp;&nbsp;<span id='GQ_NURS'  class='t_btn' onclick='myFunction(this.id);' >- Nursing Home</span></td><td style='text-align:right'>" +
                    gqnurs + "</td><td style='text-align:right'><font color='grey'>" + pctgqnurs + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='GQ_OT_INST'  class='t_btn' onclick='myFunction(this.id);' >- Other Institutionalized</span>&nbsp;</td><td style='text-align:right'>" +
                    gqothinst + "</td><td style='text-align:right'><font color='grey'>" + pctgqothinst +
                    "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='GQ_NONINST'  class='t_btn' onclick='myFunction(this.id);' >Non-Institutionalized</span></td><td style='text-align:right'>" +
                    gqnoninst + "</td><td style='text-align:right'><font color='grey'>" + "</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='GQ_COLLEGE'  class='t_btn' onclick='myFunction(this.id);' >- College Housing</span></td><td style='text-align:right'>" +
                    gqcollege + "</td><td style='text-align:right'><font color='grey'>" + pctgqcollege +
                    "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='GQ_MILTRY'  class='t_btn' onclick='myFunction(this.id);' >- Military Housing</span></td><td style='text-align:right'>" +
                    gqmilitary + "</td><td style='text-align:right'><font color='grey'>" + pctgqmilitary +
                    "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='GQ_O_NONI'  class='t_btn' onclick='myFunction(this.id);' >- Other Non-Institu.</span></td><td style='text-align:right'>" +
                    gqothnoni + "</td><td style='text-align:right'><font color='grey'>" + pctgqothnoni +
                    "%</font></td></tr>" +

                "</table><br /></div>";


		

	feat.pop_piedata = [];
	tempinc = 0;
	allother = 0;
	obj = 0;

              if (pcthispanic > 3.1) {
                    obj = {
                        age: "Hispanic",
                        population: pcthispanic
                    };
                    feat.pop_piedata.push(obj);
                } else {
                    allother = allother + parseFloat(pcthispanic);
                    tempinc = tempinc + 1;
                }

                if (pctwhite > 3.1) {
                    obj = {
                        age: "White",
                        population: pctwhite
                    };
                    feat.pop_piedata.push(obj);
                } else {
                    allother = allother + parseFloat(pctwhite);
                    tempinc = tempinc + 1;
                }

                if (pctblack > 3.1) {
                    obj = {
                        age: "Black",
                        population: pctblack
                    };
                    feat.pop_piedata.push(obj);
                } else {
                    allother = allother + parseFloat(pctblack);
                    tempinc = tempinc + 1;
                }

                if (pctnamerican > 3.1) {
                    obj = {
                        age: "NativeAm",
                        population: pctnamerican
                    };
                    feat.pop_piedata.push(obj);
                } else {
                    allother = allother + parseFloat(pctnamerican);
                    tempinc = tempinc + 1;
                }

                if (pctasian > 3.1) {
                    obj = {
                        age: "Asian",
                        population: pctasian
                    };
                    feat.pop_piedata.push(obj);
                } else {
                    allother = allother + parseFloat(pctasian);
                    tempinc = tempinc + 1;
                }

                if (pcthawaiian > 3.1) {
                    obj = {
                        age: "HawPacIs",
                        population: pcthawaiian
                    };
                    feat.pop_piedata.push(obj);
                } else {
                    allother = allother + parseFloat(pcthawaiian);
                    tempinc = tempinc + 1;
                }

                if (pctotherr > 3.1) {
                    obj = {
                        age: "Other",
                        population: pctotherr
                    };
                    feat.pop_piedata.push(obj);
                } else {
                    allother = allother + parseFloat(pctotherr);
                    tempinc = tempinc + 1;
                }

                if (pcttwoplus > 3.1) {
                    obj = {
                        age: "Two +",
                        population: pcttwoplus
                    };
                    feat.pop_piedata.push(obj);
                } else {
                    allother = allother + parseFloat(pcttwoplus);
                    tempinc = tempinc + 1;
                }

                if (tempinc > 0) {
                    if (allother > 3.1) {
                        obj = {
                            age: "All Other",
                            population: allother
                        };
                        feat.pop_piedata.push(obj);
                    } else {
                        obj = {
                            age: " ",
                            population: allother
                        };
                        feat.pop_piedata.push(obj);
                    }
                }



     app.FeatureXName = graphicAttributes.NAMELSAD10 + '<br />' + '<span style="font-size: 60%">2010 US Census SF1</span>';


		$( "#printareport" ).show();
	    $( "#printacsv" ).show();
	
		var directcall=$('#datadiv').val();

		if(directcall=="pop"){
		$('#richcontent').html(feat.popstring);
		piemaker(feat.pop_piedata, '#pop_pie', ["Hispanic", "White", "Black", "NativeAm", "Asian", "HawPacIs",	"Other", "Two +", "All Other", " "], ["#E41A1C", "#377EB8", "#4DAF4A", "#984EA3", "#FF7F00", "#cc9f1e", "#A65628", "#F781BF","#999999", "#999999"]);
		}
		
		if(directcall=="age"){
		$('#richcontent').html(feat.agestring);
		chartmaker(feat.agedata, '#pop_pyr', feat.ageset);
		}		

		if(directcall=="hld"){
		$('#richcontent').html(feat.household);
		}		
		
		if(directcall=="gqu"){
		$('#richcontent').html(feat.gqstring);
		}		
		
	
		if(directcall=="hou"){
		$('#richcontent').html(feat.houstring);
		chartmaker(feat.vacdata, '#vac_chart', feat.vacset);
		}			
	
	
	$('#' + app.selectedbtn).addClass('selectbtn');
	
	

	return esri.substitute(graphic.attributes, namegeo);
}



function PrintCSV(){

	var filetemp=makeid();
		
	  csvobj.filename='/mnt/webroot/tmp/' + filetemp + '.csv';
	  
	  var idchange='#printacsv';

	  $.get("https://dola.colorado.gov/gis-php/writefile2010.php",csvobj,function(){
	  $(idchange).val('DOWNLOAD');
	  $(idchange).attr("onClick", "opwin('"+filetemp+"')");	  

	  });

}


//javascript function open new window
function opwin(filetemp){
window.open("https://dola.colorado.gov/tmp/"+filetemp+".csv"); 
restorediv2('#printacsv');
}


function myFunction(passedvar) {

var subhtml = $('.ui-state-active').html();
var btndown = $(subhtml).html();


//remove outline layer - add it back at end of this function
		app.map.removeLayer(countyLayer);

	var renderer, bgco, renderSymbol, defaultrenderer, defaultSymbol, layer;

	//bgco = $('#' + passedvar).css('background-color');
	bgco = $('#' + passedvar).hasClass('selectbtn');
	
	//bypass first stage of upcoming if/else so that legend and renderer refresh when choosing new geographic level
	if(chgflag==1){bgco=false;chgflag=0;}

	if (bgco == true) { //if blue then grey
		$('#' + passedvar).removeClass('selectbtn');
		//$('#' + passedvar).css('background-color', 'background-color: rgb(221,238,250)');
		//$('#' + passedvar).css('color', 'color: rgb(68,121,170)');
		app.selectedbtn = undefined;
		//hide legend
		$('#abovebox').hide();
		$('#thematicbox').hide();
		themevar="None";
		//code to revert to default symbology

		renderSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol
		.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([75, 25, 25, 0.4]), 2), new dojo
		.Color([180, 200, 180, 0]));
		defaultrenderer = new esri.renderer.SimpleRenderer(renderSymbol);

		dojo.forEach(app.map.graphicsLayerIds, function (id) {
			layer = app.map.getLayer(id);
			layer.setRenderer(defaultrenderer);
			layer.redraw();
		});
		
		//renderer will re-render outline layer because above statement
		//so we have to remove and re-add outline layer instead of leaving it alone.
		chgoutline();

	} else { //if grey then blue
		//first turn all other buttons grey
		$('.t_btn').removeClass('selectbtn');
		//$('.t_btn').css('color', 'color: rgb(68,121,170)');		
		$('#' + passedvar).addClass('selectbtn');
		//$('#' + passedvar).css('color', 'color: rgb(255,255,255)');
		app.selectedbtn = passedvar;

		themevar = passedvar;

		defaultSymbol = new esri.symbol.SimpleFillSymbol();
		defaultSymbol.setColor(new dojo.Color([150, 150, 150, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1));

		//is this necessary below?
		if(themevar==="None"){
		renderSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol
		.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([75, 25, 25, 0.4]), 2), new dojo
		.Color([180, 200, 180, 0]));
		renderer = new esri.renderer.SimpleRenderer(renderSymbol);
		}
		
		
		if(btndown=="Tract" || btndown=="Block Group"){
				if (themevar === 'PCT_HISP') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT_HISP);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 10,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([237, 248, 251, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 10%"
			});
			renderer.addBreak({
				minValue: 10,
				maxValue: 20,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([178, 226, 226, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "10% to 20%"
			});
			renderer.addBreak({
				minValue: 20,
				maxValue: 30,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([102, 194, 164, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "20% to 30%"
			});
			renderer.addBreak({
				minValue: 30,
				maxValue: 50,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([44, 162, 95, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "30% to 50%"
			});
			renderer.addBreak({
				minValue: 50,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 109, 44, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 50%"
			});
			$('#titleleg').html('Percent Hispanic');
		}

		if (themevar === 'PCT_WHITE') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT_WHITE);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 30,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 240, 217, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 30%"
			});
			renderer.addBreak({
				minValue: 30,
				maxValue: 50,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([253, 204, 138, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "30% to 50%"
			});
			renderer.addBreak({
				minValue: 50,
				maxValue: 70,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([252, 141, 89, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "50% to 70%"
			});
			renderer.addBreak({
				minValue: 70,
				maxValue: 85,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([227, 74, 51, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "70% to 85%"
			});
			renderer.addBreak({
				minValue: 85,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([179, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 85%"
			});
			$('#titleleg').html('Percent Non-Hispanic White');
		}

		if (themevar === 'PCT_BLACK') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT_BLACK);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 5,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([237, 248, 251, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 5%"
			});
			renderer.addBreak({
				minValue: 5,
				maxValue: 10,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([179, 205, 227, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "5% to 10%"
			});
			renderer.addBreak({
				minValue: 10,
				maxValue: 20,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([140, 150, 198, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "10% to 20%"
			});
			renderer.addBreak({
				minValue: 20,
				maxValue: 40,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([136, 86, 167, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "20% to 40%"
			});
			renderer.addBreak({
				minValue: 40,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([129, 15, 124, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 40%"
			});
			$('#titleleg').html('Percent Non-Hispanic Black');
		}

		if (themevar === 'PCT_AMIND') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT_AMIND);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 2,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 235, 226, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 2%"
			});
			renderer.addBreak({
				minValue: 2,
				maxValue: 10,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([251, 180, 185, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "2% to 10%"
			});
			renderer.addBreak({
				minValue: 10,
				maxValue: 30,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([247, 104, 161, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "10% to 30%"
			});
			renderer.addBreak({
				minValue: 30,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([174, 1, 126, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 30%"
			});
			$('#titleleg').html('Percent Non-Hispanic Native American');
		}

		if (themevar === 'PCT_ASIAN') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT_ASIAN);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 2,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 235, 226, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 2%"
			});
			renderer.addBreak({
				minValue: 2,
				maxValue: 5,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([251, 180, 185, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "2% to 5%"
			});
			renderer.addBreak({
				minValue: 5,
				maxValue: 15,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([247, 104, 161, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "5% to 15%"
			});
			renderer.addBreak({
				minValue: 15,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([174, 1, 126, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 15%"
			});
			$('#titleleg').html('Percent Non-Hispanic Asian');
		}

		if (themevar === 'PCT_HAWPI') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT_HAWPI);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 2,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([222, 235, 247, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 2%"
			});
			renderer.addBreak({
				minValue: 2,
				maxValue: 10,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([158, 202, 225, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "2% to 10%"
			});
			renderer.addBreak({
				minValue: 10,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([49, 130, 189, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 10%"
			});
			$('#titleleg').html('Percent Non-Hispanic Hawaiian or Pacific Islander');
		}

		if (themevar === 'PCT_OTHER') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT_OTHER);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 2,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([239, 237, 245, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 2%"
			});
			renderer.addBreak({
				minValue: 2,
				maxValue: 5,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([188, 189, 220, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "2% to 5%"
			});
			renderer.addBreak({
				minValue: 5,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([117, 107, 177, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 5%"
			});
			$('#titleleg').html('Percent Non-Hispanic Any Other Race');
		}

		if (themevar === 'PCT_MULT') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT_MULT);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 2,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 224, 210, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 2%"
			});
			renderer.addBreak({
				minValue: 2,
				maxValue: 5,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([252, 146, 114, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "2% to 5%"
			});
			renderer.addBreak({
				minValue: 5,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([222, 45, 38, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 5%"
			});
			$('#titleleg').html('Percent Non-Hispanic of Two or More Races');
		}

		//Does not yet exist
		if (themevar === 'PCT_A_L10') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return ((graphic.attributes.AGELESS10 / graphic.attributes.POP0711) * 100);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 12,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 240, 217, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 12%"
			});
			renderer.addBreak({
				minValue: 12,
				maxValue: 15,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([253, 204, 138, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "12% to 15%"
			});
			renderer.addBreak({
				minValue: 15,
				maxValue: 20,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([252, 141, 89, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "15% to 20%"
			});
			renderer.addBreak({
				minValue: 20,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([215, 48, 31, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 20%"
			});
			$('#titleleg').html('Percent Age Less than 10');
		}

		if (themevar === 'PCT_65PLUS') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT_65PLUS);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 12,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 240, 217, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 12%"
			});
			renderer.addBreak({
				minValue: 12,
				maxValue: 17,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([253, 204, 138, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "12% to 17%"
			});
			renderer.addBreak({
				minValue: 17,
				maxValue: 22,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([252, 141, 89, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "17% to 22%"
			});
			renderer.addBreak({
				minValue: 22,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([215, 48, 31, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 22%"
			});
			$('#titleleg').html('Percent Age 65 Plus');
		}

		if (themevar === 'PCT_U18') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT_U18);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 22,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 240, 217, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 22%"
			});
			renderer.addBreak({
				minValue: 22,
				maxValue: 26,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([253, 204, 138, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "22% to 26%"
			});
			renderer.addBreak({
				minValue: 26,
				maxValue: 30,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([252, 141, 89, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "26% to 30%"
			});
			renderer.addBreak({
				minValue: 30,
				maxValue: 35,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([227, 74, 51, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "30% to 35%"
			});
			renderer.addBreak({
				minValue: 35,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([179, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 35%"
			});
			$('#titleleg').html('Percent Age Under 18');
		}

		if (themevar === 'MED_AGE') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, themevar);
			renderer.addBreak({
				minValue: 1,
				maxValue: 30,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 240, 217, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 30 Years of Age"
			});
			renderer.addBreak({
				minValue: 30,
				maxValue: 35,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([253, 204, 138, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "30 to 35"
			});
			renderer.addBreak({
				minValue: 35,
				maxValue: 40,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([252, 141, 89, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "35 to 40"
			});
			renderer.addBreak({
				minValue: 40,
				maxValue: 45,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([227, 74, 51, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "40 to 45"
			});
			renderer.addBreak({
				minValue: 45,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([179, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 45"
			});
			$('#titleleg').html('Median Age');
		}

		if (themevar === 'PCT18T24') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT18T24);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 10,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 240, 217, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 10%"
			});
			renderer.addBreak({
				minValue: 10,
				maxValue: 15,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([253, 204, 138, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "10% to 15%"
			});
			renderer.addBreak({
				minValue: 15,
				maxValue: 20,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([252, 141, 89, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "15% to 20%"
			});
			renderer.addBreak({
				minValue: 20,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([215, 48, 31, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 20%"
			});
			$('#titleleg').html('Percent Age 18 to 24');
		}

		if (themevar === 'PCT25T34') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT25T34);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 14,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 232, 200, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 14%"
			});
			renderer.addBreak({
				minValue: 14,
				maxValue: 21,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([253, 187, 132, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "14% to 21%"
			});
			renderer.addBreak({
				minValue: 21,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([227, 74, 51, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 21%"
			});
			$('#titleleg').html('Percent Age 25 to 34');
		}

		if (themevar === 'PCT35T44') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT35T44);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 16,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 232, 200, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 16%"
			});
			renderer.addBreak({
				minValue: 16,
				maxValue: 20,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([253, 187, 132, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "16% to 20%"
			});
			renderer.addBreak({
				minValue: 20,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([227, 74, 51, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 20%"
			});
			$('#titleleg').html('Percent Age 35 to 44');
		}

		if (themevar === 'PCT45T64') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT45T64);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 24,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 232, 200, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 24%"
			});
			renderer.addBreak({
				minValue: 24,
				maxValue: 32,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([253, 187, 132, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "24% to 32%"
			});
			renderer.addBreak({
				minValue: 32,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([227, 74, 51, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 32%"
			});
			$('#titleleg').html('Percent Age 45 to 64');
		}




		if (themevar === 'PCTHHALN') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCTHHALN);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 15,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([241, 238, 246, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 15%"
			});
			renderer.addBreak({
				minValue: 15,
				maxValue: 25,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([189, 201, 225, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "15% to 25%"
			});
			renderer.addBreak({
				minValue: 25,
				maxValue: 35,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([116, 169, 207, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "25% to 35%"
			});
			renderer.addBreak({
				minValue: 35,
				maxValue: 50,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([43, 140, 190, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "35% to 50%"
			});
			renderer.addBreak({
				minValue: 50,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([4, 90, 141, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 50%"
			});
			$('#titleleg').html('Percent of Householders Living Alone');
		}

		if (themevar === 'PCTFAMHH') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCTFAMHH);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 60,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([246, 239, 247, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 60%"
			});
			renderer.addBreak({
				minValue: 60,
				maxValue: 70,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([189, 201, 225, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "60% to 70%"
			});
			renderer.addBreak({
				minValue: 70,
				maxValue: 80,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([103, 169, 207, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "70% to 80%"
			});
			renderer.addBreak({
				minValue: 80,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([2, 129, 138, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 80%"
			});
			$('#titleleg').html('Percent Family Households');
		}

		if (themevar === 'PCTNFAMHH') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCTNFAMHH);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 4,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([241, 238, 246, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 4%"
			});
			renderer.addBreak({
				minValue: 4,
				maxValue: 8,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([215, 181, 216, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "4% to 8%"
			});
			renderer.addBreak({
				minValue: 8,
				maxValue: 15,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([223, 101, 176, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "8% to 15%"
			});
			renderer.addBreak({
				minValue: 15,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([206, 18, 86, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 15%"
			});
			$('#titleleg').html('Percent Non-Family Households');
		}




		if (themevar === 'PCT_VAC') { //diverging
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT_VAC);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 5,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([20, 99, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 5%"
			});
			renderer.addBreak({
				minValue: 5,
				maxValue: 10,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([105, 171, 55, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "5% to 10%"
			});
			renderer.addBreak({
				minValue: 10,
				maxValue: 15,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([208, 255, 115, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "10% to 15%"
			});
			renderer.addBreak({
				minValue: 15,
				maxValue: 40,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([120, 120, 200, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "15% to 40%"
			});
			renderer.addBreak({
				minValue: 40,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 18, 99, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 40%"
			});
			$('#titleleg').html('Percent Vacancy');
		}

		if (themevar === 'PCT_RENT') { //diverging
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT_RENT);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 10,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([208, 28, 139, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 10%"
			});
			renderer.addBreak({
				minValue: 10,
				maxValue: 20,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([241, 182, 218, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "10% to 20%"
			});
			renderer.addBreak({
				minValue: 20,
				maxValue: 40,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([244, 235, 206, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "20% to 40%"
			});
			renderer.addBreak({
				minValue: 40,
				maxValue: 50,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([184, 225, 134, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "40% to 50%"
			});
			renderer.addBreak({
				minValue: 50,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([77, 172, 38, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 50%"
			});
			$('#titleleg').html('Percent Renters');
		}
		
		if (themevar === 'AVG_FAM') {
            renderer = new esri.renderer.ClassBreaksRenderer(defaultSymbol, themevar);
            renderer.addBreak({
            minValue: 2,
            maxValue: 2.8,
            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 255, 204, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
            label: "From 2 to 2.8"
            });
            renderer.addBreak({
            minValue: 2.8,
            maxValue: 3,
            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([161, 218, 180, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
            label: "2.8 to 3"
            });
            renderer.addBreak({
            minValue: 3,
            maxValue: 3.2,
            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([65, 182, 196, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
            label: "3 to 3.2"
            });
            renderer.addBreak({
            minValue: 3.2,
            maxValue: Infinity,
            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([34, 94, 168, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
            label: "> 3.2 per Family"
            });
            $('#titleleg').html('AVG Family Size');
			}

		if (themevar === 'AVG_HH') {
			renderer = new esri.renderer.ClassBreaksRenderer(defaultSymbol, themevar);
			renderer.addBreak({
				minValue: 1,
				maxValue: 2.3,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([237, 248, 251, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 2.3 per Household"
			});
			renderer.addBreak({
				minValue: 2.3,
				maxValue: 2.8,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([158, 188, 218, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "2.3 to 2.8"
			});
			renderer.addBreak({
				minValue: 2.8,
				maxValue: 3.2,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([140, 107, 177, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "2.8 to 3.2"
			});
			renderer.addBreak({
				minValue: 3.2,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([110, 1, 107, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 3.2"
			});
			$('#titleleg').html('Average Household Size');
		}
		
		
                    if (themevar === 'GQ_POP') {
                        renderer = new esri.renderer.ClassBreaksRenderer(false, themevar);
                        renderer.addBreak({
                            minValue: 0.9,
                            maxValue: Infinity,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "True"
                        });
                        renderer.addBreak({
                            minValue: 0,
                            maxValue: 0.9,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 0, 255, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "False"
                        });
                        $('#titleleg').html('Group Quarters Population');
                    }

                    if (themevar === 'GQ_INST') {
                        renderer = new esri.renderer.ClassBreaksRenderer(false, themevar);
                        renderer.addBreak({
                            minValue: 0.9,
                            maxValue: Infinity,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "True"
                        });
                        renderer.addBreak({
                            minValue: 0,
                            maxValue: 0.9,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 0, 255, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "False"
                        });
                        $('#titleleg').html('Institutionalized Population');
                    }

                    if (themevar === 'GQ_CORREC') {
                        renderer = new esri.renderer.ClassBreaksRenderer(false, themevar);
                        renderer.addBreak({
                            minValue: 0.9,
                            maxValue: Infinity,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "True"
                        });
                        renderer.addBreak({
                            minValue: 0,
                            maxValue: 0.9,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 0, 255, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "False"
                        });
                        $('#titleleg').html('Correctional Facilities Population');
                    }
					
					if (themevar === 'GQ_JUVENL') {
                        renderer = new esri.renderer.ClassBreaksRenderer(false, themevar);
                        renderer.addBreak({
                            minValue: 0.9,
                            maxValue: Infinity,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "True"
                        });
                        renderer.addBreak({
                            minValue: 0,
                            maxValue: 0.9,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 0, 255, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "False"
                        });
                        $('#titleleg').html('Juvenile Facilities Population');
                    }

                    if (themevar === 'GQ_NURS') {
                        renderer = new esri.renderer.ClassBreaksRenderer(false, themevar);
                        renderer.addBreak({
                            minValue: 0.9,
                            maxValue: Infinity,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "True"
                        });
                        renderer.addBreak({
                            minValue: 0,
                            maxValue: 0.9,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 0, 255, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "False"
                        });
                        $('#titleleg').html('Nursing Homes Population');
                    }
                    if (themevar === 'GQ_OT_INST') {
                        renderer = new esri.renderer.ClassBreaksRenderer(false, themevar);
                        renderer.addBreak({
                            minValue: 0.9,
                            maxValue: Infinity,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "True"
                        });
                        renderer.addBreak({
                            minValue: 0,
                            maxValue: 0.9,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 0, 255, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "False"
                        });
                        $('#titleleg').html('Other Institutionalized Population');
                    }

                    if (themevar === 'GQ_NONINST') {
                        renderer = new esri.renderer.ClassBreaksRenderer(false, themevar);
                        renderer.addBreak({
                            minValue: 0.9,
                            maxValue: Infinity,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "True"
                        });
                        renderer.addBreak({
                            minValue: 0,
                            maxValue: 0.9,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 0, 255, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "False"
                        });
                        $('#titleleg').html('NonInstitutionalized Population');
                    }

                    if (themevar === 'GQ_COLLEGE') {
                        renderer = new esri.renderer.ClassBreaksRenderer(false, themevar);
                        renderer.addBreak({
                            minValue: 0.9,
                            maxValue: Infinity,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "True"
                        });
                        renderer.addBreak({
                            minValue: 0,
                            maxValue: 0.9,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 0, 255, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "False"
                        });
                        $('#titleleg').html('College Housing Population');
                    }
                    if (themevar === 'GQ_MILTRY') {
                        renderer = new esri.renderer.ClassBreaksRenderer(false, themevar);
                        renderer.addBreak({
                            minValue: 0.9,
                            maxValue: Infinity,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "True"
                        });
                        renderer.addBreak({
                            minValue: 0,
                            maxValue: 0.9,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 0, 255, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "False"
                        });
                        $('#titleleg').html('Military Quarters Population');
                    }

                    if (themevar === 'GQ_O_NONI') {
                        renderer = new esri.renderer.ClassBreaksRenderer(false, themevar);
                        renderer.addBreak({
                            minValue: 0.9,
                            maxValue: Infinity,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "True"
                        });
                        renderer.addBreak({
                            minValue: 0,
                            maxValue: 0.9,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 0, 255, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "False"
                        });
                        $('#titleleg').html('Other NonInstitutionalized Population');
                    }
		
		}else{			if (themevar === 'PCT_HISP') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT_HISP);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 10,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([237, 248, 251, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 10%"
			});
			renderer.addBreak({
				minValue: 10,
				maxValue: 20,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([178, 226, 226, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "10% to 20%"
			});
			renderer.addBreak({
				minValue: 20,
				maxValue: 30,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([102, 194, 164, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "20% to 30%"
			});
			renderer.addBreak({
				minValue: 30,
				maxValue: 50,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([44, 162, 95, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "30% to 50%"
			});
			renderer.addBreak({
				minValue: 50,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 109, 44, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 50%"
			});
			$('#titleleg').html('Percent Hispanic');
		}

		if (themevar === 'PCT_WHITE') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT_WHITE);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 30,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 240, 217, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 30%"
			});
			renderer.addBreak({
				minValue: 30,
				maxValue: 50,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([253, 204, 138, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "30% to 50%"
			});
			renderer.addBreak({
				minValue: 50,
				maxValue: 70,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([252, 141, 89, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "50% to 70%"
			});
			renderer.addBreak({
				minValue: 70,
				maxValue: 85,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([227, 74, 51, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "70% to 85%"
			});
			renderer.addBreak({
				minValue: 85,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([179, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 85%"
			});
			$('#titleleg').html('Percent Non-Hispanic White');
		}

		if (themevar === 'PCT_BLACK') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT_BLACK);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 1,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([237, 248, 251, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 1%"
			});
			renderer.addBreak({
				minValue: 1,
				maxValue: 2,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([179, 205, 227, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "1% to 2%"
			});
			renderer.addBreak({
				minValue: 2,
				maxValue: 4,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([140, 150, 198, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "2% to 4%"
			});
			renderer.addBreak({
				minValue: 4,
				maxValue: 8,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([136, 86, 167, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "4% to 8%"
			});
			renderer.addBreak({
				minValue: 8,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([129, 15, 124, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 8%"
			});
			$('#titleleg').html('Percent Non-Hispanic Black');
		}

		if (themevar === 'PCT_AMIND') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT_AMIND);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 2,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 235, 226, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 2%"
			});
			renderer.addBreak({
				minValue: 2,
				maxValue: 5,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([251, 180, 185, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "2% to 5%"
			});
			renderer.addBreak({
				minValue: 5,
				maxValue: 10,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([247, 104, 161, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "5% to 10%"
			});
			renderer.addBreak({
				minValue: 10,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([174, 1, 126, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 10%"
			});
			$('#titleleg').html('Percent Non-Hispanic Native American');
		}

		if (themevar === 'PCT_ASIAN') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT_ASIAN);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 1,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 235, 226, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 1%"
			});
			renderer.addBreak({
				minValue: 1,
				maxValue: 2,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([251, 180, 185, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "1% to 2%"
			});
			renderer.addBreak({
				minValue: 2,
				maxValue: 4,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([247, 104, 161, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "2% to 4%"
			});
			renderer.addBreak({
				minValue: 4,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([174, 1, 126, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 4%"
			});
			$('#titleleg').html('Percent Non-Hispanic Asian');
		}

		if (themevar === 'PCT_HAWPI') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT_HAWPI);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 2,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([222, 235, 247, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 2%"
			});
			renderer.addBreak({
				minValue: 2,
				maxValue: 10,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([158, 202, 225, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "2% to 10%"
			});
			renderer.addBreak({
				minValue: 10,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([49, 130, 189, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 10%"
			});
			$('#titleleg').html('Percent Non-Hispanic Hawaiian or Pacific Islander');
		}

		if (themevar === 'PCT_OTHER') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT_OTHER);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 2,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([239, 237, 245, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 2%"
			});
			renderer.addBreak({
				minValue: 2,
				maxValue: 5,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([188, 189, 220, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "2% to 5%"
			});
			renderer.addBreak({
				minValue: 5,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([117, 107, 177, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 5%"
			});
			$('#titleleg').html('Percent Non-Hispanic Any Other Race');
		}

		if (themevar === 'PCT_MULT') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT_MULT);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 2,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 224, 210, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 2%"
			});
			renderer.addBreak({
				minValue: 2,
				maxValue: 5,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([252, 146, 114, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "2% to 5%"
			});
			renderer.addBreak({
				minValue: 5,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([222, 45, 38, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 5%"
			});
			$('#titleleg').html('Percent Non-Hispanic of Two or More Races');
		}

		//does not yet exist
		if (themevar === 'PCT_A_L10') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return ((graphic.attributes.AGELESS10 / graphic.attributes.POP0711) * 100);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 10,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 240, 217, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 10%"
			});
			renderer.addBreak({
				minValue: 10,
				maxValue: 12,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([253, 204, 138, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "10% to 12%"
			});
			renderer.addBreak({
				minValue: 12,
				maxValue: 14,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([252, 141, 89, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "12% to 14%"
			});
			renderer.addBreak({
				minValue: 14,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([215, 48, 31, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 14%"
			});
			$('#titleleg').html('Percent Age Less than 10');
		}

		if (themevar === 'PCT_65PLUS') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT_65PLUS);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 10,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 240, 217, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 10%"
			});
			renderer.addBreak({
				minValue: 10,
				maxValue: 15,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([253, 204, 138, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "10% to 15%"
			});
			renderer.addBreak({
				minValue: 15,
				maxValue: 20,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([252, 141, 89, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "15% to 20%"
			});
			renderer.addBreak({
				minValue: 20,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([215, 48, 31, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 20%"
			});
			$('#titleleg').html('Percent Age 65 Plus');
		}

		if (themevar === 'PCT_U18') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT_U18);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 18,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 240, 217, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 18%"
			});
			renderer.addBreak({
				minValue: 18,
				maxValue: 22,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([253, 204, 138, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "18% to 22%"
			});
			renderer.addBreak({
				minValue: 22,
				maxValue: 25,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([252, 141, 89, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "22% to 25%"
			});
			renderer.addBreak({
				minValue: 25,
				maxValue: 28,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([227, 74, 51, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "25% to 28%"
			});
			renderer.addBreak({
				minValue: 28,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([179, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 28%"
			});
			$('#titleleg').html('Percent Age Under 18');
		}

		if (themevar === 'MED_AGE') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, themevar);
			renderer.addBreak({
				minValue: 1,
				maxValue: 34,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 240, 217, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 34 Years of Age"
			});
			renderer.addBreak({
				minValue: 34,
				maxValue: 38,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([253, 204, 138, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "34 to 38"
			});
			renderer.addBreak({
				minValue: 38,
				maxValue: 42,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([252, 141, 89, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "38 to 42"
			});
			renderer.addBreak({
				minValue: 42,
				maxValue: 46,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([227, 74, 51, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "42 to 46"
			});
			renderer.addBreak({
				minValue: 46,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([179, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 46"
			});
			$('#titleleg').html('Median Age');
		}

		if (themevar === 'PCT18T24') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT18T24);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 6,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 240, 217, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 6%"
			});
			renderer.addBreak({
				minValue: 6,
				maxValue: 9,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([253, 204, 138, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "6% to 9%"
			});
			renderer.addBreak({
				minValue: 9,
				maxValue: 12,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([252, 141, 89, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "9% to 12%"
			});
			renderer.addBreak({
				minValue: 12,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([215, 48, 31, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 12%"
			});
			$('#titleleg').html('Percent Age 18 to 24');
		}

		if (themevar === 'PCT25T34') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT25T34);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 8,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 232, 200, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 8%"
			});
			renderer.addBreak({
				minValue: 8,
				maxValue: 14,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([253, 187, 132, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "8% to 14%"
			});
			renderer.addBreak({
				minValue: 14,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([227, 74, 51, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 14%"
			});
			$('#titleleg').html('Percent Age 25 to 34');
		}

		if (themevar === 'PCT35T44') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT35T44);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 12,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 232, 200, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 12%"
			});
			renderer.addBreak({
				minValue: 12,
				maxValue: 14,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([253, 187, 132, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "12% to 14%"
			});
			renderer.addBreak({
				minValue: 14,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([227, 74, 51, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 14%"
			});
			$('#titleleg').html('Percent Age 35 to 44');
		}

		if (themevar === 'PCT45T64') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT45T64);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 27,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 232, 200, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 27%"
			});
			renderer.addBreak({
				minValue: 27,
				maxValue: 32,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([253, 187, 132, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "27% to 32%"
			});
			renderer.addBreak({
				minValue: 32,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([227, 74, 51, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 32%"
			});
			$('#titleleg').html('Percent Age 45 to 64');
		}




		if (themevar === 'PCTHHALN') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCTHHALN);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 15,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([241, 238, 246, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 15%"
			});
			renderer.addBreak({
				minValue: 15,
				maxValue: 25,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([189, 201, 225, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "15% to 25%"
			});
			renderer.addBreak({
				minValue: 25,
				maxValue: 35,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([116, 169, 207, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "25% to 35%"
			});
			renderer.addBreak({
				minValue: 35,
				maxValue: 50,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([43, 140, 190, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "35% to 50%"
			});
			renderer.addBreak({
				minValue: 50,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([4, 90, 141, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 50%"
			});
			$('#titleleg').html('Percent of Householders Living Alone');
		}

		if (themevar === 'PCTFAMHH') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCTFAMHH);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 60,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([246, 239, 247, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 60%"
			});
			renderer.addBreak({
				minValue: 60,
				maxValue: 70,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([189, 201, 225, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "60% to 70%"
			});
			renderer.addBreak({
				minValue: 70,
				maxValue: 80,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([103, 169, 207, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "70% to 80%"
			});
			renderer.addBreak({
				minValue: 80,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([2, 129, 138, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 80%"
			});
			$('#titleleg').html('Percent Family Households');
		}

		if (themevar === 'PCTNFAMHH') {
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCTNFAMHH);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 4,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([241, 238, 246, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 4%"
			});
			renderer.addBreak({
				minValue: 4,
				maxValue: 8,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([215, 181, 216, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "4% to 8%"
			});
			renderer.addBreak({
				minValue: 8,
				maxValue: 15,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([223, 101, 176, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "8% to 15%"
			});
			renderer.addBreak({
				minValue: 15,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([206, 18, 86, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 15%"
			});
			$('#titleleg').html('Percent Non-Family Households');
		}




		if (themevar === 'PCT_VAC') { //diverging
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT_VAC);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 5,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([20, 99, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 5%"
			});
			renderer.addBreak({
				minValue: 5,
				maxValue: 10,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([105, 171, 55, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "5% to 10%"
			});
			renderer.addBreak({
				minValue: 10,
				maxValue: 15,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([208, 255, 115, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "10% to 15%"
			});
			renderer.addBreak({
				minValue: 15,
				maxValue: 40,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([120, 120, 200, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "15% to 40%"
			});
			renderer.addBreak({
				minValue: 40,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 18, 99, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 40%"
			});
			$('#titleleg').html('Percent Vacancy');
		}

		if (themevar === 'PCT_RENT') { //diverging
			renderer = new esri.renderer.ClassBreaksRenderer(false, function (graphic) {
				return (graphic.attributes.PCT_RENT);
			});
			renderer.addBreak({
				minValue: 0,
				maxValue: 20,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([208, 28, 139, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 20%"
			});
			renderer.addBreak({
				minValue: 20,
				maxValue: 25,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([241, 182, 218, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "20% to 25%"
			});
			renderer.addBreak({
				minValue: 25,
				maxValue: 30,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([244, 235, 206, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "25% to 30%"
			});
			renderer.addBreak({
				minValue: 30,
				maxValue: 35,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([184, 225, 134, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "30% to 35%"
			});
			renderer.addBreak({
				minValue: 35,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([77, 172, 38, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 35%"
			});
			$('#titleleg').html('Percent Renters');
		}

                    if (themevar === 'AVG_FAM') {
                        renderer = new esri.renderer.ClassBreaksRenderer(defaultSymbol, themevar);
                        renderer.addBreak({
                            minValue: 2,
                            maxValue: 2.8,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 255, 204, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "From 2 to 2.8"
                        });
                        renderer.addBreak({
                            minValue: 2.8,
                            maxValue: 3,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([161, 218, 180, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "2.8 to 3"
                        });
                        renderer.addBreak({
                            minValue: 3,
                            maxValue: 3.2,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([65, 182, 196, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "3 to 3.2"
                        });
                        renderer.addBreak({
                            minValue: 3.2,
                            maxValue: Infinity,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([34, 94, 168, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "> 3.2 per Family"
                        });
                        $('#titleleg').html('AVG Family Size');
                    }

		if (themevar === 'AVG_HH') {
			renderer = new esri.renderer.ClassBreaksRenderer(defaultSymbol, themevar);
			renderer.addBreak({
				minValue: 1,
				maxValue: 2.2,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([237, 248, 251, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "< 2.2 per Household"
			});
			renderer.addBreak({
				minValue: 2.2,
				maxValue: 2.5,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([158, 188, 218, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "2.2 to 2.5"
			});
			renderer.addBreak({
				minValue: 2.5,
				maxValue: 2.8,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([140, 107, 177, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "2.5 to 2.8"
			});
			renderer.addBreak({
				minValue: 2.8,
				maxValue: Infinity,
				symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([110, 1, 107, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
				label: "> 2.8"
			});
			$('#titleleg').html('Average Household Size');
		}
		
		
                    if (themevar === 'GQ_POP') {
                        renderer = new esri.renderer.ClassBreaksRenderer(false, themevar);
                        renderer.addBreak({
                            minValue: 0.9,
                            maxValue: Infinity,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "True"
                        });
                        renderer.addBreak({
                            minValue: 0,
                            maxValue: 0.9,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 0, 255, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "False"
                        });
                        $('#titleleg').html('Group Quarters Population');
                    }

                    if (themevar === 'GQ_INST') {
                        renderer = new esri.renderer.ClassBreaksRenderer(false, themevar);
                        renderer.addBreak({
                            minValue: 0.9,
                            maxValue: Infinity,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "True"
                        });
                        renderer.addBreak({
                            minValue: 0,
                            maxValue: 0.9,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 0, 255, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "False"
                        });
                        $('#titleleg').html('Institutionalized Population');
                    }

                    if (themevar === 'GQ_CORREC') {
                        renderer = new esri.renderer.ClassBreaksRenderer(false, themevar);
                        renderer.addBreak({
                            minValue: 0.9,
                            maxValue: Infinity,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "True"
                        });
                        renderer.addBreak({
                            minValue: 0,
                            maxValue: 0.9,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 0, 255, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "False"
                        });
                        $('#titleleg').html('Correctional Facilities Population');
                    }
					
					if (themevar === 'GQ_JUVENL') {
                        renderer = new esri.renderer.ClassBreaksRenderer(false, themevar);
                        renderer.addBreak({
                            minValue: 0.9,
                            maxValue: Infinity,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "True"
                        });
                        renderer.addBreak({
                            minValue: 0,
                            maxValue: 0.9,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 0, 255, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "False"
                        });
                        $('#titleleg').html('Juvenile Facilities Population');
                    }

                    if (themevar === 'GQ_NURS') {
                        renderer = new esri.renderer.ClassBreaksRenderer(false, themevar);
                        renderer.addBreak({
                            minValue: 0.9,
                            maxValue: Infinity,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "True"
                        });
                        renderer.addBreak({
                            minValue: 0,
                            maxValue: 0.9,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 0, 255, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "False"
                        });
                        $('#titleleg').html('Nursing Homes Population');
                    }
                    if (themevar === 'GQ_OT_INST') {
                        renderer = new esri.renderer.ClassBreaksRenderer(false, themevar);
                        renderer.addBreak({
                            minValue: 0.9,
                            maxValue: Infinity,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "True"
                        });
                        renderer.addBreak({
                            minValue: 0,
                            maxValue: 0.9,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 0, 255, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "False"
                        });
                        $('#titleleg').html('Other Institutionalized Population');
                    }

                    if (themevar === 'GQ_NONINST') {
                        renderer = new esri.renderer.ClassBreaksRenderer(false, themevar);
                        renderer.addBreak({
                            minValue: 0.9,
                            maxValue: Infinity,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "True"
                        });
                        renderer.addBreak({
                            minValue: 0,
                            maxValue: 0.9,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 0, 255, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "False"
                        });
                        $('#titleleg').html('NonInstitutionalized Population');
                    }

                    if (themevar === 'GQ_COLLEGE') {
                        renderer = new esri.renderer.ClassBreaksRenderer(false, themevar);
                        renderer.addBreak({
                            minValue: 0.9,
                            maxValue: Infinity,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "True"
                        });
                        renderer.addBreak({
                            minValue: 0,
                            maxValue: 0.9,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 0, 255, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "False"
                        });
                        $('#titleleg').html('College Housing Population');
                    }
                    if (themevar === 'GQ_MILTRY') {
                        renderer = new esri.renderer.ClassBreaksRenderer(false, themevar);
                        renderer.addBreak({
                            minValue: 0.9,
                            maxValue: Infinity,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "True"
                        });
                        renderer.addBreak({
                            minValue: 0,
                            maxValue: 0.9,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 0, 255, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "False"
                        });
                        $('#titleleg').html('Military Quarters Population');
                    }

                    if (themevar === 'GQ_O_NONI') {
                        renderer = new esri.renderer.ClassBreaksRenderer(false, themevar);
                        renderer.addBreak({
                            minValue: 0.9,
                            maxValue: Infinity,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "True"
                        });
                        renderer.addBreak({
                            minValue: 0,
                            maxValue: 0.9,
                            symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 0, 255, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100,100,100]), 1)),
                            label: "False"
                        });
                        $('#titleleg').html('Other NonInstitutionalized Population');
                    }
}

		dojo.forEach(app.map.graphicsLayerIds, function (id) {
			layer = app.map.getLayer(id);
			layer.setRenderer(renderer);
			layer.redraw();
		});
		
		
		//renderer will re-render outline layer because above statement
		//so we have to remove and re-add outline layer instead of leaving it alone.
		chgoutline();

		$('#abovebox').show();

		app.legend.refresh();

	} //end if then

} //end function





//create random file name
function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


function Clickhereformap(mainid) {

      //new ({ wkid: 4326});
	  //old ({ wkid: 102100});
	  var oldx = (app.map.extent.xmin+app.map.extent.xmax)/2;
	  var oldy = (app.map.extent.ymin+app.map.extent.ymax)/2;
	  
	  //function convert spatial ref 102100 to spatial ref 4326
    var x = oldx;
    var y = oldy;
    var num3 = x / 6378137.0;
    var num4 = num3 * 57.295779513082323;
    var num5 = Math.floor(((num4 + 180.0) / 360.0));
    var num6 = num4 - (num5 * 360.0);
    var num7 = 1.5707963267948966 - (2.0 * Math.atan(Math.exp((-1.0 * y) / 6378137.0)));
    var newx = num6;
    var newy = num7 * 57.295779513082323;

	  var themaptitle=$('#titleleg').html();
	  
	  var extension=$('#exttype').val();
	  
	  
	  
	  var newobj=new Object();
	  newobj.filetype=extension;  //.jpg .png
	  newobj.zoom= app.map.getZoom();
	  //newobj.filename="https://localhost/acsmaps/acsPhantom.html";  //print template file
	  newobj.filename="https://dola.colorado.gov/gis-php/census2010_phantom.html"; 
	  newobj.lat=newy;
	  newobj.lng=newx;
	  newobj.title = encodeURIComponent(themaptitle);
	  newobj.layername= passlayer;		//Block Group, Tract, County, etc
	  newobj.basemap= basemapname;               //("Spatial Reference WKID: " + app.map.spatialReference.wkid);  //WKID: 102100;
	  newobj.demvar=themevar; 		//demographic variable ... ex MED_AGE
	  newobj.outname=makeid();		//output file name  ... makeid() is function creates random 5 letter filename	  
	  newobj.outline=encodeURIComponent(outlinelayer);    //secret Outline Layer
	  
	  var idchange='#'+mainid;
	  $(idchange).val('Processing...');
	  
	  $.get("https://dola.colorado.gov/gis-php/do.php",newobj,function(){
	  $(idchange).val('DOWNLOAD');
	  $(idchange).attr("onClick", "opmapwin('"+idchange+"', '"+newobj.outname+"', '"+newobj.filetype+"')");	 
	  });


}

function opmapwin(idchange, outname, filetype){
window.open("https://dola.colorado.gov/tmp/"+outname+"."+filetype); 
restorediv(idchange);

}


function restorediv(thediv){
var changediv='\'printamap\'';

//$(thediv).html('<a  class="t_btn_2" href="javascript:Clickhereformap('+type+','+changediv+')">Print Map ('+type+')</a>');
$(thediv).val("Print Map");
$(thediv).attr("onClick","javascript:Clickhereformap("+changediv+")");
}

function restorediv2(thediv){
$(thediv).val('Get CSV Data');
$(thediv).attr("onClick", "javascript:PrintCSV()");	  
}



function Clickheretoprint() {
	var disp_setting, content_vlue, n, p, docprint;

	disp_setting = "toolbar=yes,location=no,directories=yes,menubar=yes,";
	disp_setting += "scrollbars=yes,width=650, height=600, left=100, top=25";

	//clear all previously used chart holding divs
	$('#hold1').html('');
	$('#hold2').html('');
	$('#hold3').html('');

	
	//create all charts
	piemaker(feat.pop_piedata, '#hold1', ["Hispanic", "White", "Black", "NativeAm", "Asian", "HawPacIs",	"Other", "Two +", "All Other", " "], ["#E41A1C", "#377EB8", "#4DAF4A", "#984EA3", "#FF7F00", "#cc9f1e", "#A65628", "#F781BF","#999999", "#999999"]);
	chartmaker(feat.agedata, '#hold2', feat.ageset);
	chartmaker(feat.vacdata, '#hold3', feat.vacset);

	content_vlue = '<h3>Population & Race</h3>' + feat.popstring + $('#hold1').html() + '<h3>Age</h3>' + feat.agestring + $('#hold2').html() + '<h3>Household</h3>' +  feat.household + '<h3>Housing</h3>' +  feat.houstring + $('#hold3').html() + '<h3>Group Quarters</h3>' +  feat.gqstring;

	n = content_vlue.replace(/none/gi, "block");
	//below statement eliminates background color style
	p = n.replace(/background-color/gi, "blank");
	docprint = window.open("", "", disp_setting);
	docprint.document.open();
	docprint.document.write('<html><head><title>Statistic Printout</title>');
	docprint.document.write(
		'<style>td{font-family: sans-serif;font-size: 8pt; height: 2px; vertical-align:bottom;}</style>');
	docprint.document.write('</head><body onLoad="self.print()"><center>');
	//docprint.document.write(reftomap); 
	docprint.document.write('<h1>' + app.FeatureXName + '</h1><br />');
	docprint.document.write(p);
	docprint.document.write('</center></body></html>');
	docprint.document.close();
	docprint.focus();
}




function initMap(layers) {



	var renderSymbol, defaultrenderer, scalebar;


	dojo.forEach(app.map.graphicsLayerIds, function (id) {
		var layer = app.map.getLayer(id);
		app.legendLayers.push({
			layer: layer,
			title: "TITLE"
		});
	});


	app.legend = new esri.dijit.Legend({
		map: app.map,
		layerInfos: app.legendLayers
	}, "legendDiv");
	app.legend.startup();


	app.Geocoder = new esri.dijit.Geocoder({
		autoComplete: true,
		arcgisGeocoder: {
			placeholder: "Find a place",
			sourceCountry: 'USA'
		},
		map: app.map
	}, dojo.byId("search"));



	// start widget
	app.Geocoder.startup();


	//add a scalebar
	scalebar = new esri.dijit.Scalebar({
		map: app.map,
		scalebarUnit: "english",
		attachTo:"bottom-left"
	});


	$('select').selectBox({mobile: true});
	
  	$( "#abovebox" ).button();
	$( "#advancedbutton" ).button();

	$( "#printareport" ).button();
	$( "#printacsv" ).button();

	$( "#printareport" ).hide();
	$( "#printacsv" ).hide();
	
	$( "#printamap" ).button();

	$( "#printamap" ).show();
	
	$( "#richcontent" ).show();
	$( "#newelements" ).show();	
	$( "#advancedbutton" ).show();	
	
	$( "#advancedbox" ).draggable({ containment: "window" });
	$( "#contentdiv" ).draggable({ containment: "window" });  
  

					if(params["basemap"]!==undefined){
			basemapname=params["basemap"];

			if(basemapname=="TerrainMap"){
				basemap = new esri.layers.ArcGISTiledMapServiceLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer");
				$('#basem').selectBox('value', 'TerrainMap').change();
				$('#basem').selectBox("refresh", true);
				}
			if(basemapname=="MapBoxStreets"){
				basemap = new esri.layers.WebTiledLayer("https://${subDomain}.tiles.mapbox.com/v3/statecodemog.map-i4mhpeb3/${level}/${col}/${row}.png", {
				"copyright": "<a href='http://www.mapbox.com/about/maps/'>Â© Map Box and OpenStreetMap</a>",
					"id": "MapBoxStreets",
					"subDomains": ["a", "b", "c", "d"]
					});
				$('#basem').selectBox('value', 'MapBoxStreets').change();	
				$('#basem').selectBox("refresh", true);
				}
			if(basemapname=="MapBoxTerrain"){
				basemap = new esri.layers.WebTiledLayer("https://${subDomain}.tiles.mapbox.com/v3/statecodemog.map-392qgzze/${level}/${col}/${row}.png", {
					"copyright": "<a href='http://www.mapbox.com/about/maps/'>Â© Map Box and OpenStreetMap</a>",
					"id": "MapBoxStreets",
					"subDomains": ["a", "b", "c", "d"]
					});
				$('#basem').selectBox('value', 'MapBoxTerrain').change();	
				$('#basem').selectBox("refresh", true);				
				}
			if(basemapname=="StamenTerrain"){
				basemap = new esri.layers.WebTiledLayer("https://${subDomain}.tile.stamen.com/terrain/${level}/${col}/${row}.png", {
					"copyright": "Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under CC BY SA",
					"id": "StamenTerrain",
					"subDomains": ["a", "b", "c", "d"]
					});
				$('#basem').selectBox('value', 'StamenTerrain').change();	
				$('#basem').selectBox("refresh", true);				
				}		
			if(basemapname=="Satellite"){
				basemap = new esri.layers.ArcGISTiledMapServiceLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer");
				$('#basem').selectBox('value', 'Satellite').change();						
				}
				
			}else{
			basemap = new esri.layers.ArcGISTiledMapServiceLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer");
			basemapname="TerrainMap";
			$('#basem').selectBox('value', 'TerrainMap').change();
			$('#basem').selectBox("refresh", true);
		}
		
		app.map.addLayer(basemap);
			
		$('#radiodiv').selectBox().change(function () {
		
		//new geog is selected...hide buttons for print report and print map
		$( "#printareport" ).hide();
		$( "#printacsv" ).hide();
		
		var directcall=$(this).val();
		var directid;
		if(directcall=="Block Group"){directid='BlockGroupC2010v3_1344';} 
		if(directcall=="Tract"){directid='Tract_C2010v3_5668';}		
		if(directcall=="County"){directid='County_C2010v3_145';}		
		if(directcall=="County Sub."){directid='CountySub_C2010v3_5593';}		
		if(directcall=="Place"){directid='Place_C2010v3_2169';}		
		if(directcall=="School District"){directid='SchoolDist_C2010v3_1512';}	
		if(directcall=="Zipcode"){directid='Zipcode_C2010v3_8841';}
		if(directcall=="CBSA"){directid='CBSA_C2010v3_9101';}		
		if(directcall=="CSA"){directid='CSA_C2010v3_2966';}		
		if(directcall=="State"){directid='State_C2010v3_6579';}		
		chgFunction(directid);

		
		blankbubbles();

});
		
		
$('#outlinelayer').selectBox().change(function () {

app.map.removeLayer(countyLayer);
chgoutline();

});

				
$('#datadiv').selectBox().change(function () {
		var directcall=$(this).val();
		var directid;
		
		if(directcall=="pop"){
		$('#richcontent').html(feat.popstring);
		piemaker(feat.pop_piedata, '#pop_pie', ["Hispanic", "White", "Black", "NativeAm", "Asian", "HawPacIs",	"Other", "Two +", "All Other", " "], ["#E41A1C", "#377EB8", "#4DAF4A", "#984EA3", "#FF7F00", "#cc9f1e", "#A65628", "#F781BF","#999999", "#999999"]);
		}
		
		if(directcall=="age"){
		$('#richcontent').html(feat.agestring);
		chartmaker(feat.agedata, '#pop_pyr', feat.ageset);
		}		

		if(directcall=="hld"){
		$('#richcontent').html(feat.household);
		}		
	
		if(directcall=="hou"){
		$('#richcontent').html(feat.houstring);
		chartmaker(feat.vacdata, '#vac_chart', feat.vacset);
		}	
		
		if(directcall=="gqu"){
		$('#richcontent').html(feat.gqstring);
		}		
		
		$('#' + app.selectedbtn).addClass('selectbtn');
		
});
	
	
	$('#basem').selectBox().change(function () {
		changeBasemap($('#basem').val());
	});

		
	//display default black outline symbology
	renderSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol
		.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([75, 25, 25, 0.4]), 2), new dojo
		.Color([180, 200, 180, 0]));
	defaultrenderer = new esri.renderer.SimpleRenderer(renderSymbol);



	dojo.forEach(app.map.graphicsLayerIds, function (id) {
		var layer = app.map.getLayer(id);
		layer.setRenderer(defaultrenderer);
		//layer.setSelectionSymbol(fieldsSelectionSymbol);
		layer.redraw();
	});

		
	//add logic to resize the map when the browser size changes
	dojo.connect(dijit.byId('mainWindow'), 'resize', function () {
		resizeMap();
	});

	// apparently this removes the basemap.  Different from ACS version!!
	var maplaydef = app.map.getLayer('World_Topo_Map_5083');
		app.map.removeLayer( maplaydef );
			
	var loadgeo;

	if(params["layername"]!==undefined){	
		loadgeo=params["layername"];
		$('#radiodiv').selectBox('value', valuefor(loadgeo)).change();
		$('#radiodiv').selectBox("refresh", true);
		//chgFunction(loadgeo);
	}else{
		$('#radiodiv').selectBox('value', 'County').change();
		$('#radiodiv').selectBox("refresh", true);
	}
	
	
	var loadvar;

	if(params["demvar"]!==undefined){	
		loadvar=params["demvar"];
		myFunction(loadvar);
	}else{
		myFunction('MED_AGE');
	}
	
	
	
	var loadoutline=params["outline"];
	
	if(loadoutline!==undefined){	
		$('#outlinelayer').selectBox('value', decodeURIComponent(loadoutline)).change();
		$('#outlinelayer').selectBox("refresh", true);
		//chgoutline();
	}else{
		$('#outlinelayer').selectBox('value', 'None').change();
		$('#outlinelayer').selectBox("refresh", true);
	}
	
	
	choosedatacategory();
  
  
  var paneheight=($('#rightPane').height());
  var contentheight=paneheight-125-40;
  $('#richcontent').height(contentheight+'px');
  


  
 esri.config.defaults.map.logoLink = "https://dola.colorado.gov/";
document.getElementsByClassName('logo-med')[0].style.backgroundImage="url(\"https://dola.colorado.gov/gis-php/files/gis-images/CO_LOGO.png\")";
document.getElementsByClassName('logo-med')[0].style.backgroundRepeat="no-repeat";



}

function choosedatacategory(){
var ctg;

if(themevar=='PCT_HISP'){ctg="Pop";}
if(themevar=='PCT_WHITE'){ctg="Pop";}
if(themevar=='PCT_BLACK'){ctg="Pop";}
if(themevar=='PCT_AMIND'){ctg="Pop";}
if(themevar=='PCT_ASIAN'){ctg="Pop";}
if(themevar=='PCT_HAWPI'){ctg="Pop";}
if(themevar=='PCT_OTHER'){ctg="Pop";}
if(themevar=='PCT_MULT'){ctg="Pop";}

if(themevar=='PCT_U18'){ctg="Age";}
if(themevar=='PCT18T24'){ctg="Age";}
if(themevar=='PCT25T34'){ctg="Age";}
if(themevar=='PCT35T44'){ctg="Age";}
if(themevar=='PCT45T64'){ctg="Age";}
if(themevar=='PCT_65PLUS'){ctg="Age";}
if(themevar=='MED_AGE'){ctg="Age";}

if(themevar=='PCTHHALN'){ctg="Hhld";}
if(themevar=='PCTFAMHH'){ctg="Hhld";}
if(themevar=='PCTNFAMHH'){ctg="Hhld";}
if(themevar=='AVG_HH'){ctg="Hhld";}
if(themevar=='AVG_FAM'){ctg="Hhld";}

if(themevar=='PCT_VAC'){ctg="Hou";}
if(themevar=='PCT_RENT'){ctg="Hou";}

if(themevar=='GQ_POP'){ctg="Gq";}
if(themevar=='GQ_INST'){ctg="Gq";}
if(themevar=='GQ_CORREC'){ctg="Gq";}
if(themevar=='GQ_JUVENL'){ctg="Gq";}
if(themevar=='GQ_NURS'){ctg="Gq";}
if(themevar=='GQ_OT_INST'){ctg="Gq";}
if(themevar=='GQ_NONINST'){ctg="Gq";}
if(themevar=='GQ_COLLEGE'){ctg="Gq";}
if(themevar=='GQ_MILTRY'){ctg="Gq";}
if(themevar=='GQ_O_NONI'){ctg="Gq";}

//if ctg = value then selectbox to open this
//use trigger

if(ctg=='Pop'){$('#datadiv').selectBox('value', 'pop').change();}
if(ctg=='Age'){$('#datadiv').selectBox('value', 'age').change();}
if(ctg=='Hhld'){$('#datadiv').selectBox('value', 'hld').change();}
if(ctg=='Hou'){$('#datadiv').selectBox('value', 'hou').change();}
if(ctg=='Gq'){$('#datadiv').selectBox('value', 'gqu').change();}

$('#datadiv').selectBox("refresh", true);
		
}


function valuefor(loadgeo){
	if(loadgeo=="BlockGroupC2010v3_1344"){return "Block Group";}
	if(loadgeo=="Tract_C2010v3_5668"){return "Tract";}
	if(loadgeo=="County_C2010v3_145"){return "County";}
	if(loadgeo=="CountySub_C2010v3_5593"){return "County Sub.";}
	if(loadgeo=="Place_C2010v3_2169"){return "Place";}
	if(loadgeo=="SchoolDist_C2010v3_1512"){return "School District";}
	if(loadgeo=="CBSA_C2010v3_9101"){return "CBSA";}
	if(loadgeo=="CSA_C2010v3_2966"){return "CSA";}
	if(loadgeo=="State_C2010v3_6579"){return "State";}
	if(loadgeo=="Zipcode_C2010v3_8841"){return "Zipcode";}
}

function init() {

                parseQueryString = function () {

                    newstr = String(window.location.search);

                    var objURL = {};

                    newstr.replace(
                        new RegExp("([^?=&]+)(=([^&]*))?", "g"), function ($0, $1, $2, $3) {
                        objURL[$1] = $3;
                    });
                    return objURL;

                };

                //Example how to use it: 
                params = parseQueryString();
				
                //console.log(params["zoom"]);
                //console.log(params["lat"]);
				//console.log(params["lng"]);
				//console.log(params["title"]);
				//console.log(params["layername"]);
				//console.log(params["basemap"]);
				//console.log(params["outline"]);
				//console.log(params["demvar"]);
				
				
				
	$('#abovebox').hide();
	$('#thematicbox').hide();

			blankbubbles();
//$('#richcontent').html('<br /><br /><center><p style="font-size:80%;">Click anywhere on the map to get started.</p></center>');
	
	var latcoord=39.73654370018566;
	var lngcoord=-104.95579999999823;
	var zoomlev=11;
	
	if(params["lat"]!==undefined){	
		latcoord=params["lat"];
		lngcoord=params["lng"];
	};
	
	if(params["zoom"]!==undefined){	
		zoomlev=params["zoom"];
	};
	
	var mapDeferred = esri.arcgis.utils.createMap("650b9731a3f0471aa986ebe0b8f36f4b", "map", {
		mapOptions: {
			sliderStyle: "small",
			minZoom: 6,
			maxZoom: 20,
			minScale: 6,
			maxScale: 20,
			center: [lngcoord, latcoord],
			zoom: zoomlev
		}
	});
	mapDeferred.then(function (response) {
	


		dojo.byId("title").innerHTML = response.itemInfo.item.title;
		dojo.byId("subtitle").innerHTML = "Summary File 1";

		app.map = response.map;

	


		
		
		//DONT FORGET - you can use this to change the style of your infowindow
		dojo.addClass(app.map.infoWindow.domNode, "myTheme");


		//add the legend
		var layers = response.itemInfo.itemData.operationalLayers;


		//added
		//get the layer we want to define popups for 
		dojo.forEach(layers, function (layer) {
		//console.log(layer.id);
			var template = new esri.dijit.PopupTemplate();
			template.setContent(getTextContent);
			layer.layerObject.setInfoTemplate(template);
		});

			app.map.infoWindow.resize(200, 200);

		if (app.map.loaded) {		
			initMap(layers);
		} else {
			dojo.connect(app.map, "onLoad", function () {
				initMap(layers);
			});
		}
	}, function (error) {
		console.log("Map creation failed: ", dojo.toJson(error));
	});

	

	
}


function changeBasemap(bmName){
		app.map.removeLayer(basemap);

        if(bmName=="MapBoxTerrain"){basemap = new esri.layers.WebTiledLayer("https://${subDomain}.tiles.mapbox.com/v3/statecodemog.map-392qgzze/${level}/${col}/${row}.png", {
          "copyright": "<a href='http://www.mapbox.com/about/maps/'>Â© Map Box and OpenStreetMap</a>",
          "id": "MapBoxTerrain",
          "subDomains": ["a", "b", "c", "d"]
        });}
		
		if(bmName=="TerrainMap"){basemap = new esri.layers.ArcGISTiledMapServiceLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer");}

        if(bmName=="MapBoxStreets"){basemap = new esri.layers.WebTiledLayer("https://${subDomain}.tiles.mapbox.com/v3/statecodemog.map-i4mhpeb3/${level}/${col}/${row}.png", {
          "copyright": "<a href='http://www.mapbox.com/about/maps/'>Â© Map Box and OpenStreetMap</a>",
          "id": "MapBoxStreets",
          "subDomains": ["a", "b", "c", "d"]
        });}
		
        if(bmName=="StamenTerrain"){basemap = new esri.layers.WebTiledLayer("https://${subDomain}.tile.stamen.com/terrain/${level}/${col}/${row}.png", {
          "copyright": "Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under CC BY SA",
          "id": "StamenTerrain",
          "subDomains": ["a", "b", "c", "d"]
        });}		
		
		
		if(bmName=="Satellite"){basemap = new esri.layers.ArcGISTiledMapServiceLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer");}
		
		basemapname=bmName;
		
		
        app.map.addLayer(basemap);

}


function closeadvancedbox(){
$('#advancedbox').toggle();
}


//fills in blank richcontent box after a geography change (or on startup)
function blankbubbles(){
		
		//set text for rich content box to null so that stats for a previously selected feature dont appear
		feat.popstring=null;
		feat.agestring=null;
		feat.houstring=null;
		feat.household=null;
		feat.gqstring=null;
		
		//give values to some , depending on what geography is selected
		feat.popstring = "<div><br /><table style='border-collapse:collapse; width:273px'><tr><td></td><td style='text-align:right'><i><font color='blue'></font></i></td><td style='text-align:right'><font color='blue'>PCT</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;Population:</td><td style='text-align:right'>" + 0 +
                    "</td><td></td></tr>" +

                "<tr><td></td><td></td><td></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT_HISP' class='t_btn' onclick='myFunction(this.id);' >Hispanic</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 +
                    "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT_WHITE'  class='t_btn' onclick='myFunction(this.id);' >White</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT_BLACK'  class='t_btn' onclick='myFunction(this.id);' >Black</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT_AMIND'  class='t_btn' onclick='myFunction(this.id);' >Native Am</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 +
                    "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT_ASIAN'  class='t_btn' onclick='myFunction(this.id);' >Asian</span>&nbsp;</td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT_HAWPI'  class='t_btn' onclick='myFunction(this.id);' >Haw/PacIs</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 +
                    "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT_OTHER'  class='t_btn' onclick='myFunction(this.id);' >Other Race</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT_MULT'  class='t_btn' onclick='myFunction(this.id);' >Two Races+</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 +
                    "%</font></td></tr>" +

                "</table><br /></div>";
	
	feat.agestring = "<div><br /><table style='border-collapse:collapse; width:273px'>" +

                "<tr><td></td><td style='text-align:right'><i><font color='blue'></font></i></td><td style='text-align:right'><font color='blue'>PCT</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;Male:</td><td style='text-align:right'>" + 0 +
                    "</td><td style='text-align:right'><font color='grey'>" + 0 + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;Female:</td><td style='text-align:right'>" + 0 +
                    "</td><td style='text-align:right'><font color='grey'>" + 0 + "%</font></td></tr>" +

                "<tr><td></td><td></td><td></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT_U18'  class='t_btn' onclick='myFunction(this.id);' >Age less than 18</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 +
                    "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT18T24'  class='t_btn' onclick='myFunction(this.id);' >Age 18 to 24</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 +
                    "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT25T34'  class='t_btn' onclick='myFunction(this.id);' >Age 25 to 34</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 +
                    "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT35T44'  class='t_btn' onclick='myFunction(this.id);' >Age 35 to 44</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 +
                    "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT45T64'  class='t_btn' onclick='myFunction(this.id);' >Age 45 to 64</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 +
                    "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT_65PLUS'  class='t_btn' onclick='myFunction(this.id);' >Age 65+</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 +
                    "%</font></td></tr>" +

                "<tr><td></td><td></td><td></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='MED_AGE'  class='t_btn' onclick='myFunction(this.id);' >Median Age</span></td><td style='text-align:right'>" +
                    0 + "</td><td></td></tr>" +


                "</table><br /></div>";
				
			
	feat.household = "<div><br /><table style='border-collapse:collapse; width:273px'>" +

                "<tr><td></td><td style='text-align:right'><i><font color='blue'></font></i></td><td style='text-align:right'><font color='blue'>PCT</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;Households:</td><td style='text-align:right'>" + 0 +
                    "</td><td></td></tr>" +

                "<tr><td></td><td></td><td></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCTHHALN'  class='t_btn' onclick='myFunction(this.id);' >Living Alone</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 +
                    "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCTFAMHH'  class='t_btn' onclick='myFunction(this.id);' >Family Households</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCTNFAMHH'  class='t_btn' onclick='myFunction(this.id);' >Non-Family Households</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 + "%</font></td></tr>" +

                "<tr><td></td><td></td><td></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='AVG_HH'  class='t_btn' onclick='myFunction(this.id);' >Average Household Size</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + "</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='AVG_FAM'  class='t_btn' onclick='myFunction(this.id);' >Average Family Size</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + "</font></td></tr>" +

                "</table><br /></div>";
				
	
	feat.houstring = "<div><br /><table style='border-collapse:collapse; width:273px'>" +

                "<tr><td></td><td style='text-align:right'><i><font color='blue'></font></i></td><td style='text-align:right'><font color='blue'>PCT</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;Housing Units:</td><td style='text-align:right'>" + 0 +
                    "</td><td></td></tr>" +

                "<tr><td></td><td></td><td></td></tr>" +
				
				"<tr><td>&nbsp;&nbsp;Owned</td><td style='text-align:right'>" + 0 +
                "</td><td style='text-align:right'><font color='grey'>" + 0 + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT_RENT'  class='t_btn' onclick='myFunction(this.id);' >Rented:</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 + "%</font></td></tr>" +

                "<tr><td></td><td></td><td></td></tr>" +
				
                "<tr><td>&nbsp;&nbsp;Occupied</td><td style='text-align:right'>" + 0 +
                    "</td><td style='text-align:right'><font color='grey'>" + 0 + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='PCT_VAC'  class='t_btn' onclick='myFunction(this.id);' >Vacant</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 + "%</font></td></tr>" +

				"<tr><td></td><td></td><td></td></tr>" +
                "<tr><td></td><td></td><td></td></tr>" +	
					
				"<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;Vacant For Rent:</td><td style='text-align:right'>" + 0 +
                "</td><td style='text-align:right'><font color='grey'>" + 0 + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;Vacant For Sale:</td><td style='text-align:right'>" + 0 +
                "</td><td style='text-align:right'><font color='grey'>" + 0 + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;Rented, Not Occ:</td><td style='text-align:right'>" + 0 +
                "</td><td style='text-align:right'><font color='grey'>" + 0 + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;Sold, Not Occ:</td><td style='text-align:right'>" + 0 +
                "</td><td style='text-align:right'><font color='grey'>" + 0 + "%</font></td></tr>" +					

                "<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;Seasonal:&nbsp;</td><td style='text-align:right'>" + 0 +
                "</td><td style='text-align:right'><font color='grey'>" + 0 + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;Migrant Worker:</td><td style='text-align:right'>" + 0 +
                "</td><td style='text-align:right'><font color='grey'>" + 0 + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;Vacant - Other:</td><td style='text-align:right'>" + 0 +
                "</td><td style='text-align:right'><font color='grey'>" + 0 + "%</font></td></tr>" +		
					
					
                "</table><br /></div>";
	


	
	feat.gqstring = "<div><br /><table style='border-collapse:collapse; width:273px'>" +

                "<tr><td></td><td style='text-align:right'><i><font color='blue'></font></i></td><td style='text-align:right'><font color='blue'>PCT</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='GQ_POP'  class='t_btn' onclick='myFunction(this.id);' >Group Quarters Pop.</span></td><td style='text-align:right'>" +
                    0 + "</td><td></td></tr>" +

                "<tr><td></td><td></td><td></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='GQ_INST'  class='t_btn' onclick='myFunction(this.id);' >Institutionalized</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + "</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='GQ_CORREC'  class='t_btn' onclick='myFunction(this.id);' >- Correctional Facility</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 +
                    "%</font></td></tr>" +
					
                "<tr><td>&nbsp;&nbsp;<span id='GQ_JUVENL'  class='t_btn' onclick='myFunction(this.id);' >- Juvenile Facility</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 +
                    "%</font></td></tr>" +										

                "<tr><td>&nbsp;&nbsp;<span id='GQ_NURS'  class='t_btn' onclick='myFunction(this.id);' >- Nursing Home</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 + "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='GQ_OT_INST'  class='t_btn' onclick='myFunction(this.id);' >- Other Institutionalized</span>&nbsp;</td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 +
                    "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='GQ_NONINST'  class='t_btn' onclick='myFunction(this.id);' >Non-Institutionalized</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + "</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='GQ_COLLEGE'  class='t_btn' onclick='myFunction(this.id);' >- College Housing</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 +
                    "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='GQ_MILTRY'  class='t_btn' onclick='myFunction(this.id);' >- Military Housing</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 +
                    "%</font></td></tr>" +

                "<tr><td>&nbsp;&nbsp;<span id='GQ_O_NONI'  class='t_btn' onclick='myFunction(this.id);' >- Other Non-Institu.</span></td><td style='text-align:right'>" +
                    0 + "</td><td style='text-align:right'><font color='grey'>" + 0 +
                    "%</font></td></tr>" +

                "</table><br /></div>";

		
		
		var directcall=$('#datadiv').val();

		
		if(directcall=="pop"){$('#richcontent').html(feat.popstring);}
		if(directcall=="age"){$('#richcontent').html(feat.agestring);}	
		if(directcall=="hld"){$('#richcontent').html(feat.household);}				
		if(directcall=="hou"){$('#richcontent').html(feat.houstring);}		
		if(directcall=="gqu"){$('#richcontent').html(feat.gqstring);}			
		
	
		$('#' + app.selectedbtn).addClass('selectbtn');
		
	// ** why is this not showing?
		$('#richcontent').prepend('<br /><center><p style="font-size:80%;">Click anywhere on the map to view statistics.</p></center>');

}




function getmaplink(){

var rlat, rlng, rzoom, rtheme, rgeo, rbasemap, routline;


	  //function convert spatial ref 102100 to spatial ref 4326
    var x = (app.map.extent.xmin+app.map.extent.xmax)/2;
    var y = (app.map.extent.ymin+app.map.extent.ymax)/2;
    var num3 = x / 6378137.0;
    var num4 = num3 * 57.295779513082323;
    var num5 = Math.floor(((num4 + 180.0) / 360.0));
    var num6 = num4 - (num5 * 360.0);
    var num7 = 1.5707963267948966 - (2.0 * Math.atan(Math.exp((-1.0 * y) / 6378137.0)));
    var newx = num6;
    var newy = num7 * 57.295779513082323;

rzoom=app.map.getZoom();
rlat=newy;
rlng=newx;
rgeo=passlayer;
rbasemap=basemapname;
routline=encodeURIComponent(outlinelayer);
rtheme=themevar;

var linkstring='https://dola.colorado.gov/gis-php/files/projects/census2010/census2010x.html?zoom=' + rzoom + '&lat=' + rlat + '&lng=' + rlng + '&layername=' + rgeo + '&basemap=' + rbasemap + '&outline=' + routline + '&demvar=' + rtheme + '';
$('#insidecontent').html(linkstring);
$('#contentdiv').show();
}

//show map on load
dojo.ready(init);