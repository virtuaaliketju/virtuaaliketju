function mouseX(evt) {
	if (evt.pageX) return evt.pageX;
	else if (evt.clientX)
		return evt.clientX + (document.documentElement.scrollLeft ?
							  document.documentElement.scrollLeft :
							  document.body.scrollLeft);
	else return null;
}

function mouseY(evt) {
	if (evt.pageY) return evt.pageY;
	else if (evt.clientY)
		return evt.clientY + (document.documentElement.scrollTop ?
							  document.documentElement.scrollTop :
							  document.body.scrollTop);
	else return null;
}

var myTree, text;
var popups = new Array();
var bdist = 25;
var cx = 2;
var cy = 2; 
var visibleNote;

function renderCircle(r, node, sdist){
	for ( n in node) {
		if(n != "name" && n != "weight"){
			renderCircle(r, node[n], sdist+bdist);
			break;
		}
	}
	circle(r, cx,cy, sdist-5);
}
function renderNode(r, node, sdeg, edeg, sdist, edist){
	var nodes = new Array();
	for ( n in node) {
		if(n != "name" && n != "weight"){
			nodes.push(node[n]);
		}
	}
	var usew = true;
	var w = node["weight"];
	var size = nodes.length;
	var deg = sdeg;
	var degPer = (edeg-sdeg)/(nodes.length==0?1:nodes.length);
	for (n in nodes) {
		var p;
		var dw = (edeg-sdeg)*(nodes[n]["weight"]/w);
		if(usew){
			p = r.path().attr({sector: [deg, deg + dw, sdist, edist] });
		}else{
			p = r.path().attr({sector:[deg, deg+degPer, sdist, edist]});
		}
		p["src"] = nodes[n];
		p.mousemove(function(event){
					var obj = document.getElementById("raphael");
					var curleft = curtop = 0;
					do {
						curleft += obj.offsetLeft;
						curtop += obj.offsetTop;
					}while(obj = obj.offsetParent);
					clearPopups();
					popups.push(r.g.tag( mouseX(event)-curleft, mouseY(event)-curtop, this["src"]["name"] + " " + this["src"]["weight"], -20));
					});
		p.mouseout(function(event){
				   clearPopups();
				   });
		if(usew){
			renderNode(r, nodes[n], deg, deg+dw, sdist+bdist, edist+bdist);
		}else{
			renderNode(r, nodes[n], deg, deg+degPer, sdist+bdist, edist+bdist);
		}
		deg = usew ? deg + dw : deg + degPer;
	}
}

function addSector(r){
	r.customAttributes.sector=function(fdeg,tdeg,sdist,edist, stroke, fill){
        var alpha = fdeg,
		beta = tdeg,
		b = (90 - beta) * Math.PI / 180,
		a = (90 - alpha) * Math.PI / 180,
		x0 = cx + sdist * Math.cos(b),
		y0 = cy - sdist * Math.sin(b),
		x1 = cx + edist * Math.cos(b),
		y1 = cy - edist * Math.sin(b),
		x2 = cx + sdist * Math.cos(a),
		y2 = cy - sdist * Math.sin(a),
		x3 = cx + edist * Math.cos(a),
		y3 = cy - edist * Math.sin(a),
		color = "#fff",
		path;
        path = [["M", x0, y0], 
                ["L", x1,y1],
                // A : rx,ry, rot, large-arc,sweep, x, y
                ["A", edist, edist, 0, 0, 0, x3, y3], 
                ["L", x2,y2],
                ["A", sdist, sdist, 0, 0, 1, x0, y0]]; 
        if(fill == undefined){
            fill = "hsb(" + (tdeg)/360 + ", .75, .8)"
        }
        if(stroke == undefined){
            stroke = "#333";//hsb(" + (tdeg)/360 + ", .75, .1)"
        }
        return {path:path, stroke:stroke, fill:fill};
    }
}

function render(cont,tree){
	primeWeights(tree);
	var r = Raphael(cont);
	r.g.txtattr.font = "11px 'Open Sans'";
	addSector(r);
	
	renderCircle(r, tree, 30);
	renderNode(r, tree, 90, 180, 30, 45);
	var core = r.circle(cx, cy, 25);
	core.attr({
			  "fill":"#333",
			  "clip-rect":cx + ","+cy+",400,400"
			  });
	/*
	r.path([["M", 0, 0],
			["L", 0, 200],
			["M", 0, 0],
			["L", 200, 0]]).attr({"stroke": "#000", "stroke-dasharray":". "});
	 */
	core.mousemove(function(event){
				   var obj = document.getElementById("raphael");
				   var curleft = curtop = 0;
				   do {
				   curleft += obj.offsetLeft;
				   curtop += obj.offsetTop;
				   }while(obj = obj.offsetParent);
				   clearPopups();
				   popups.push(r.g.tag( mouseX(event)-curleft, mouseY(event)-curtop, tree["name"], -20));
				   });
	core.mouseout(function(event){
				  clearPopups();
				  });

}

function circle(r, cx, cy, d){
	r.circle(cx, cy, d).attr({
							 "stroke-dasharray":". ",
							 "fill":"rgba(200,200,200,0.02)",
							 "clip-rect":cx + ","+cy+",400,400"
							 });
}

function clearPopups(){
	for(p in popups){
		popups[p].remove();
	}
}

function primeWeights(node){
	var cumul = 0;
	for ( n in node) {
		if(n != "name" && n != "weight"){
			cumul = cumul + primeWeights(node[n]);
		}
	}
	//node["weight"] = node["weight"] || 0;
	node["weight"] = node["weight"] + cumul;
	return node["weight"];
}

function toggle(what, nextTo){
	var n = document.getElementById(what);
	
	if(n.style.display=="none"){
		if(nextTo){
			place(what, nextTo);
			var f = function(){
				place(what, nextTo);
			}
			window.onscroll = f;
			window.onresize = f;
			visibleNote=n.id;
		}
		n.style.display='';
		document.getElementById('overlay').style.display='';
		$('.notetext').jScrollPane();

	}
	else{
		window.onscroll = null;
		window.onresize = null;
		n.style.position='';
		n.style.left = '';
		n.style.top = ''; 
		n.style.display="none";	
		document.getElementById('overlay').style.display='none';
		visibleNote = null;
	}
}

function place(what, nextTo){
	var n = document.getElementById(what);
	var nn = document.getElementById(nextTo);
	var obj = nn;
	var curleft = curtop = 0;
	do {
		curleft += obj.offsetLeft;
		curtop += obj.offsetTop;
	}while(obj = obj.offsetParent);
	
	var scrollTop = document.getElementById('body').scrollTop;
	var scrollLeft = document.getElementById('body').scrollLeft;
	
	n.style.position='absolute';
	n.style.left = (curleft + nn.offsetWidth - scrollLeft) +"px";
	n.style.top = curtop - scrollTop - 200 +"px";
}

function hideNote(){
	if(visibleNote)
		toggle(visibleNote);
}
