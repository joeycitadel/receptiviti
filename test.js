// Joey Li (joeyli@outlook.com) Jan 11, 2018 For Receptiviti.ai

/*---------------------------------------------------------------------------*
 * Initializations
 *---------------------------------------------------------------------------*/

// Use this string to define the directed graph
var graphDef = "AB5, BC4, CD8, DC8, DE6, AD5, CE2, EB3, AE7";
// The number of nodes in this graph
var dim = 5;

// This is a square matrix of dim by dim, representing the distance from a to b.
var matrix = [];
// Initialize this sparse matrix to all-zeros.
for (var i = 0; i < dim; i++){
	var row = [];
	for (var j = 0; j < dim; j++){
		row.push(0);
	}
	matrix.push(row);
}

// Parse the graph definition and set paths
var re = /([A-Z])([A-Z])(\d+)/g;
var m;
graphDef = graphDef.toUpperCase();
while (m = re.exec(graphDef))
{
	var from = m[1].charCodeAt(0) - 65;
	var to   = m[2].charCodeAt(0) - 65;
	if (from >= 0 && from < dim && to >= 0 && to < dim)
	{
		matrix[from][to] = parseInt(m[3]);
	}
	else
	{
		throw "Graph definition error";
	}
}

/*---------------------------------------------------------------------------*
 * Tests 1 thru 5
 *---------------------------------------------------------------------------*/

// Validate a given path. May contain redundant chars.
function checkPath(str)
{
	var chars = str.toUpperCase().split('');
	var dist = 0;
	var last;
	for (var i = 0; i < chars.length; i++)
	{
		var index = chars[i].charCodeAt(0) - 65;
		if (index < 0 || index >= dim)
		{
			continue;
		}
		if (typeof last !== "undefined")
		{
			if (!matrix[last][index])
			{
				return 'NO SUCH ROUTE';
			}
			dist += matrix[last][index];
		}
		last = index;
	}
	return dist;
}

// For tests 1 thru 5, call the checkPath() to give out results.
function test1Thru5(i, str)
{
	console.log(i + '. The distance of the route ' + str + ': ' + checkPath(str)); 
}

test1Thru5(1, 'A-B-C');
test1Thru5(2, 'A-D');
test1Thru5(3, 'A-D-C');
test1Thru5(4, 'A-E-B-C-D');
test1Thru5(5, 'A-E-D');

/*---------------------------------------------------------------------------*
 * Path object
 *---------------------------------------------------------------------------*/

// Object Path
function Path()
{
	this.nodes = [];
	this.length = 0;

	// Add a stop to the path
	this.push = function(idx, dist)
	{
		this.nodes.push(String.fromCharCode(65 + idx));
		this.length += dist;
	};

	// Number of stops
	this.stops = function()
	{
		return this.nodes.length - 1;
	};

	// Make a copy
	this.fork = function()
	{
		var that = new Path();
		that.nodes = this.nodes.slice(0);
		that.length = this.length;
		return that;
	};

	// String representation
	this.toString = function()
	{
		return this.nodes.join('');
	};

	// Get start stop
	this.start = function()
	{
		return this.nodes.length? this.nodes[0]: 'NONE';
	}

	// Get end stop
	this.end = function()
	{
		return this.nodes.length? this.nodes[this.nodes.length - 1]: 'NONE';
	}
}

/*---------------------------------------------------------------------------*
 * Find shortest paths between stops
 *---------------------------------------------------------------------------*/

// Path finder, a recursive function
function findPathsImp(a, b, paths, path)
{
	path.push(a, 0);
	if (matrix[a][b])
	{
		path.push(b, matrix[a][b]);
		paths.push(path);
		return;
	}
	for (var i = 0; i < dim; i++)
	{
		if (matrix[a][i])
		{
			var saved = matrix[a][i];
			matrix[a][i] = 0;
			var fork = path.fork();
			fork.length += saved;
			findPathsImp(i, b, paths, fork);
			matrix[a][i] = saved;
		}
	}
}

// Entry function
function findPaths(from, to)
{
	var paths = [];
	var path = new Path();
	var a = from.charCodeAt(0) - 65;
	var b = to.charCodeAt(0) - 65;
	findPathsImp(a, b, paths, path);
	return paths;
}

// Find a single shortest path
function findShortestPaths(from, to)
{
	var paths = findPaths(from, to);
	if (!paths.length)
	{
		return null;
	}
	paths.sort(function(a, b){ return a.length - b.length; });
	return paths[0];
}

/*---------------------------------------------------------------------------*
 * Find paths by number of stops
 *---------------------------------------------------------------------------*/

function findPathsByStopsImp(a, n, paths, path)
{
	for (var i = 0; i < dim; i++)
	{
		if (matrix[a][i])
		{
			var fork = path.fork();
			fork.push(i, matrix[a][i]);
			if (fork.stops() < n)
			{
				findPathsByStopsImp(i, n, paths, fork);
			}
			else
			{
				paths.push(fork);
			}
		}
	}
}

function findPathsByStops(from, to, n)
{
	var paths = [];
	var path = new Path();
	var a = from.charCodeAt(0) - 65;
	var b = to.charCodeAt(0) - 65;
	path.push(a, 0);
	findPathsByStopsImp(a, n, paths, path);

	var matched = [];
	paths.forEach(function(path){
		if (path.stops() == n && path.end() == to)
		{
			matched.push(path);
		}
	});
	return matched;
}

/*---------------------------------------------------------------------------*
 * Find paths by total length
 *---------------------------------------------------------------------------*/

function findPathsByLengthImp(a, b, len, paths, path)
{
	for (var i = 0; i < dim; i++)
	{
		if (matrix[a][i])
		{
			if (path.length + matrix[a][i] < len)
			{
				var fork = path.fork();
				fork.push(i, matrix[a][i]);
				if (i == b)
				{
					paths.push(fork);
				}
				findPathsByLengthImp(i, b, len, paths, fork);
			}
		}
	}
}

function findPathsByLength(from, to, len)
{
	var paths = [];
	var path = new Path();
	var a = from.charCodeAt(0) - 65;
	var b = to.charCodeAt(0) - 65;
	path.push(a, 0);
	findPathsByLengthImp(a, b, len, paths, path);
	return paths;
}

/*---------------------------------------------------------------------------*
 * The other tests
 *---------------------------------------------------------------------------*/

(function test6(){
	var paths = findPaths('C', 'C');
	var count = 0;
	paths.forEach(function(path){
		if (path.stops() <= 3)
		{
			count++;
		}
	});
	console.log('6. Number of trips from C to C with <= 3 stops: ' + count);
})();

(function test7(){
	var paths = findPathsByStops('A', 'C', 4);
	console.log('7. Number of paths from A to C with 4 stops: ' + paths.length);
})();

(function test8(){
	var paths = findPaths('A', 'C');
	console.log('8. Length of shortest path from A to C: ' + (paths.length? paths[0].length: 'NO SUCH PATH'));
})();

(function test9(){
	var path = findShortestPaths('B', 'B');
	console.log('9. Length of shortest path from B to B: ' + (path? path.length: 'NO SUCH PATH'));
})();

(function test10(){
	var paths = findPathsByLength('C', 'C', 30);
	console.log('10. Paths from C to C with distance < 30: ' + paths);
})();