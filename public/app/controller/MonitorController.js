app.controller("MonitorController", function($scope) {
  console.log("Started controller MonitorController");

  $scope.margin = {
    top: 20,
    right: 120,
    bottom: 20,
    left: 120
  };

  $scope.width = 960 - $scope.margin.right - $scope.margin.left;
  $scope.height = 500 - $scope.margin.top - $scope.margin.bottom;

  $scope.i = 0;
  $scope.duration = 750;

  $scope.tree = d3.layout.tree().size([$scope.height, $scope.width]);

  $scope.diagonal = d3.svg.diagonal()
    .projection(function(d) {
      return [d.y, d.x];
    });

  $scope.svg = d3.select("#expectation-tree").append("svg")
    .attr("width", $scope.width + $scope.margin.right + $scope.margin.left)
    .attr("height", $scope.height + $scope.margin.top + $scope.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + $scope.margin.left + "," + $scope.margin.top + ")");

  $scope.treeData = [{
    "name": "Checkout",
    "parent": "null",
    "children": [
      {
        "name": "Acesso",
        "parent": "Top Level",
        "children": []
    },
      {
        "name": "OMS",
        "parent": "Top Level"
    },
      {
        "name": "POV",
        "parent": "Top Level"
    },
      {
        "name": "Simulation",
        "parent": "Top Level",
        "children": [
          {
            "name": "Seller API",
            "parent": "Simulation",
            "children": [
              {
                "name": "Adapter",
                "parent": "Seller API",
                "children": []
        },
              {
                "name": "Walmart provider",
                "parent": "Seller API",
                "children": [
                  {
                    "name": "Sniper",
                    "parent": "Walmart provider",
                    "children": []
          }
          ]
        }
        ]
      },
          {
            "name": "Gescom",
            "parent": "Simulation",
            "children": []
      },
          {
            "name": "Admin legado",
            "parent": "Simulation",
            "children": []
      }
      ]
    },
      {
        "name": "Catalogo/Webstore",
        "parent": "Top Level"
    },
      {
        "name": "Dealer",
        "parent": "Top Level"
    },
      {
        "name": "Proxy",
        "parent": "Top Level"
    },
      {
        "name": "CMS",
        "parent": "Top Level"
    },
      {
        "name": "Webstore",
        "parent": "Top Level"
    },
      {
        "name": "Croupier",
        "parent": "Top Level"
    }
    ]
  }];

  function buildTree() {
    console.log("Building Tree");
    // ************** Generate the tree diagram  *****************

    $scope.root = $scope.treeData[0];
    $scope.root.x0 = $scope.height / 2;
    $scope.root.y0 = 0;
    update($scope.root);
  }

  function update(source) {
    // Compute the new tree layout.
    var nodes = $scope.tree.nodes($scope.root).reverse(),
      links = $scope.tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) {
      d.y = d.depth * 180;
    });

    // Update the nodes…
    var node = $scope.svg.selectAll("g.node")
      .data(nodes, function(d) {
        return d.id || (d.id = ++$scope.i);
      });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
      //TODO: Verificar neste ponto o status do nó. E configurar stable ou error
      .attr("class", "node stable")
      .attr("id", function(d) {
        return d.name;
      })
      .attr("transform", function(d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
      })
      .on("click", click);

    nodeEnter.append("circle")
      .attr("r", 1e-6)
      .style("fill", function(d) {
        return d._children ? "lightsteelblue" : "#fff";
      });

    nodeEnter.append("text")
      .attr("x", function(d) {
        return d.children || d._children ? -13 : 13;
      })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) {
        return d.children || d._children ? "end" : "start";
      })
      .text(function(d) {
        return d.name;
      })
      .style("fill-opacity", 1e-6);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
      .duration($scope.duration)
      .attr("transform", function(d) {
        return "translate(" + d.y + "," + d.x + ")";
      });

    nodeUpdate.select("circle")
      .attr("r", 10)
      .style("fill", function(d) {
        return d._children ? "lightsteelblue" : "#fff";
      });

    nodeUpdate.select("text")
      .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
      .duration($scope.duration)
      .attr("transform", function(d) {
        return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();

    nodeExit.select("circle")
      .attr("r", 1e-6);

    nodeExit.select("text")
      .style("fill-opacity", 1e-6);

    // Update the links…
    var link = $scope.svg.selectAll("path.link")
      .data(links, function(d) {
        return d.target.id;
      });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {
          x: source.x0,
          y: source.y0
        };
        return $scope.diagonal({
          source: o,
          target: o
        });
      });

    // Transition links to their new position.
    link.transition()
      .duration($scope.duration)
      .attr("d", $scope.diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
      .duration($scope.duration)
      .attr("d", function(d) {
        var o = {
          x: source.x,
          y: source.y
        };
        return $scope.diagonal({
          source: o,
          target: o
        });
      })
      .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    }
    else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
  }

  $scope.init = function() {
    console.log("init");
    buildTree();
    d3.select(self.frameElement).style("height", "500px");
  };

  $scope.execute = function() {
    console.log("Calling function");
    console.log($scope.nodename);
    $('#' + $scope.nodename).attr("class", "node error");
  };

  $scope.init();
});
