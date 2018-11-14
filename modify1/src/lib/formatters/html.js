var fs = require("fs");
var path = require("path");
var ejs = require("ejs");

function renderSummary(totalErrors) {
	var renderedText = 'totalProblems ' + totalErrors;
	return renderedText;
}

function renderResult(filepath, issues, index) {
	var totalErrors = 0;
	var result = {};
	if (issues.length > 0) {
		totalErrors = issues.length;
		result.index = index;
		result.filePath = filepath;
		result.summary = 'Errors:' + issues.length;
		result.messages = [];
        issues.forEach(function (issue) {
            var message = {
				"line": issue.line,
				"column": issue.column,
				"msg": issue.msg + "(" + issue.rule + ")",
				"linedom": issue.linedom,
				"parentIndex": result.index,
				"rule": result.rule
			};
			result.messages.push(message);
        });
    }
	return result;
}
function renderResults(results, name) {
	var newResultsSummary = [];
	name.forEach(function(n, i) {
		var newResults = [];
		var total = 0;
		results.forEach(function(result, index) {
			if (n === result.widgetname) {
				var filepath = result.filepath.split(result.widgetname)[1];
				var issues = result.issues;
				total += issues.length;
				newResults.push(renderResult(filepath, issues, index));
			}
		});
		newResultsSummary.push({
			"widgetname": n,
			"results": newResults,
			"total": total
		});
	});
	return newResultsSummary;
}

function formatDate(str) {
	var year = str.getFullYear();
	var month = str.getMonth() + 1;
	var date = str.getDate();
	var hour = str.getHours();
	var second = str.getSeconds();
	var minute = str.getMinutes();
	var day = year + "-" + month + "-" + date + "-" + " " + hour + ":" + second + ":" + minute;
	return day;
}

function renderName(name) {
	return name ? name + ' html reports' : 'html reports';
}

function renserResultsSummary(name) {
	var resultsSummary = [];
	for(var i=0; i<name.length; i++) {
		resultsSummary.push(name[i]);
	}
	return resultsSummary;
}

function formatHtml(results, reportpath, reportname) {
	var totalErrors = 0;
	results.forEach(function(result) {
		totalErrors +=result.issues.length;
	});
	var readStream = fs.createReadStream(path.join(__dirname,'./html-template-page.html'));
	readStream.on('data',function(data){
		var template = data.toString();
		var renderData = {
			"date": formatDate(new Date()),
			"reportName": renderName(reportname),
			"reportSummary": renderSummary(totalErrors),
			"resultsSummary": renderResults(results, reportname)			
		}
		var html = ejs.render(template, renderData);
		fs.writeFileSync(reportpath, html);
	});
	
}

module.exports = formatHtml;