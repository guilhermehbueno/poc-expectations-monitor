console.log("Building routes");
console.log(app);

app.config(function($routeProvider, $locationProvider) {
  console.log("Start");

  $routeProvider
  .when('/', {
    templateUrl: 'views/expectations/monitor/index.html',
    controller: 'MonitorController'
  });
});