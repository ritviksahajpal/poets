function poetsViewer(div, host, port, url) {
	if(url != 'None') {
		this.host = url;
	} else {
		this.host = 'http://'+host+':'+port.toString();
	}
}

poetsViewer.prototype.initLink = function(path, target) {
    sel_reg = $("#region").val();
    sel_var = $("#dataset").val();
    if(sel_var == null) {
    	sel_var = $("#variable").val();
    }
    link = sel_reg+"&"+sel_var
    
    if(target=='ncdown') {
    	link = '_download_nc/'+link
    }

    segments = path.split("/");
    
    var url = ''

    for(var i=0; i < segments.length; i++) {
    	if(i == segments.length-1) {
    		if(segments[i].indexOf("\&") > -1) {
    			break
    		}
    	}
    	url += segments[i]+"/"
    }
    $("#"+target).attr('href', url+link);
}

poetsViewer.prototype.trimSlash = function(str) {
	if(str.substr(-1) == '/') {
        return str.substr(0, str.length - 1);
    }
    return str;
}

poetsViewer.prototype.enableGo = function() {
    if ($("#region").val() == '') {
        $("#go").attr('disabled', 'disabled');
        $("#ncdown").attr('disabled', 'disabled');
    }
    else if ($("#dataset").val() == '') {
    	$("#go").attr('disabled', 'disabled');
    	$("#ncdown").attr('disabled', 'disabled');
    } else {
        $("#go").removeAttr('disabled');
        $("#ncdown").removeAttr('disabled');
    }
}

poetsViewer.prototype.expandDiv = function(div) {
	var div = document.getElementById(div);
	div.style.visibility='visible';
	div.style.overflow = "visible";
	div.style.height = "auto";
}

poetsViewer.prototype.foldDiv = function(div) {
	var div = document.getElementById(div);
	div.style.visibility='hidden';
	div.style.overflow = "hidden";
	div.style.height = "0";
}

poetsViewer.prototype.enableButtons = function(date, max) {
	if (date == max) {
        $("#btn-next").attr('disabled', 'disabled');
    } else {
        $("#btn-next").removeAttr('disabled');
    }
    if (date==0) {
        $("#btn-prev").attr('disabled', 'disabled');
    } else {
        $("#btn-prev").removeAttr('disabled');
    }
}

poetsViewer.prototype.sliderPos = function(date) {
	$("#slider").slider('setValue', date)
}

poetsViewer.prototype.initDownLink = function(anom, avg) {

    var sel_var = $("#dataset").val()
    var sel_src = $("#source").val()
    var sel_lon = $("#lon").val()
    var sel_lat = $("#lat").val()
    
    var link = "";
    
    if(avg == true) {
		var sel_reg = $("#subregion").val()
		link = '_tsdown_avg/'+sel_reg+'&'+sel_src+'&'+sel_var;
	} else {
		var sel_reg = $("#region").val()
		link = "_tsdown/"+sel_reg+"&"+sel_src+"&"+sel_var+"&"+sel_lon+","+sel_lat;
	}
    
    var div = "#download"
    
    if(anom == true) {
    	link += '&anom';
    	div += "_anom"
    }
      
    $(div).attr('href', link);
}

poetsViewer.prototype.initLegend = function() {
	// lcode is important for avoiding keeping image in cache, in order
	// to refresh legend if dataset is changed.
    var lcode = $("#region").val()+'&'+$("#variable").val();
    var number = Math.floor(Math.random()*10000);
    $('#legend').attr('src', '_rlegend/'+lcode+'&'+$('#slider').val()+'&'+number);
}

poetsViewer.prototype.setVarSelect = function() {
	var reg = $("#region").val()
	link = '/_variables/'+reg;
	// empty select list
	var current = $("#variable").val()
	$("#dataset").empty();
	// fill select again
	$.getJSON(this.host+link, function(data){
		if(data.variables.indexOf(current) == -1) {
			$('#dataset').append(new Option('DATASET', ''));
			$("#dataset option[value='']").attr('selected', 'selected');
		}
		for(var i = 0; i < data.variables.length; i++) {
			var d = data.variables[i];
			$('#dataset').append(new Option(data.variables[i], data.variables[i]));
			if(data.variables[i] == current) {
				$("#dataset option[value='"+current+"']").attr('selected', 'selected');
			}
		}
	});
}

poetsViewer.prototype.loadTS = function(lon, lat, sp_res, range, anom, avg) {
	
	var reg = $("#region").val()
	var src = $("#source").val()
	var dataset = $("#dataset").val()
	
	var title = '';
	
	if(avg == true) {
		var reg = $("#subregion").val()
		link = '/_ts_avg/'+reg+'&'+src+'&'+dataset;
		title = ' average for ' + $("#subregion").val();
	} else {
		link = '/_ts/'+reg+'&'+src+'&'+dataset+'&'+lon+','+lat;
		var roundr = 1/sp_res;
		var rdec = sp_res.toString()
		rdec = (rdec.split('.')[1].length)
		tlon = (Math.round(lon*roundr)/roundr).toFixed(rdec);
		tlat = (Math.round(lat*roundr)/roundr).toFixed(rdec);
		title = " ("+tlon+"/"+tlat+")"
	}

	var div = 'graph_';
	
	color = '#DF7401';
	
	
	if((range[0] != -999) && range[1] != -999) {
		vrange = range;
	}
	else {
		vrange = false;
	}
	
	if(anom == true) {
		link += '&anom';
		div += 'anom_';
		color = '#006699';
		title += ' with climatology (35 days)'
	}
	
	$("#"+div+'body').addClass("loading");
	
	$.getJSON(this.host+link, function(data){

		for(var i=0;i<data.data.length;i++) {
	        data.data[i][0] = new Date(data.data[i][0]);
	        data.data[i][1] = parseFloat(data.data[i][1]);
	    }
		
		graph = new Dygraph(document.getElementById(div+'body'), data.data, {
		    labels: data.labels,
		    labelsDiv: div+'footer',
		    drawPoints: true,
		    digitsAfterDecimal: 5,
		    labelsSeparateLines: false,
		    connectSeparatedPoints:true,
		    title: data.labels[1] + title,
		    legend: 'always',
		    colors: [color],
		    fillGraph: true,
		    valueRange: vrange
		});
		
		$("#"+div+'body').removeClass("loading");
		
	});
	
}
