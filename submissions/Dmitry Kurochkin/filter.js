exports.filter=function(messages,rules){var r={},m=[],i,l=rules.length;for(i=0;i<l;i++)m.push({f:fn(rules[i].from),t:fn(rules[i].to)});for(var k in messages){r[k]=[];for(i=0;i<l;i++)if((m[i].f==undefined||m[i].f.test(messages[k].from))&&(m[i].to==undefined||m[i].t.test(messages[k].to)))r[k].push(rules[i].action);}return r;}
function fn(s){return s!=undefined?new RegExp('^'+s.replace(/[\[\]\\\^\$\|\+\(\)\/\{\}\.]/g,'\\$&').replace(/\?/g,'.').replace(/\*/g,'.*?')+'$'):undefined;}