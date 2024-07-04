var app = angular.module("todoApp", ["ngRoute"]);

app.controller("TitleController", [
  "$scope",
  function ($scope) {
    $scope.title = "Todo";
  },
]);

app.service("todoService", function () {
  var todoservice = {};
  todoservice.todoItems = [
    { id: 1, completed: true, todo: "Water the Plants", date: "2024-10-9" },
    { id: 2, completed: true, todo: "Plant the Aloe Vera", date: "2024-8-17" },
    { id: 3, completed: true, todo: "Reading the novel", date: "2024-7-10" },
    { id: 4, completed: true, todo: "Complete the course", date: "2024-11-5" },
  ];
  todoservice.findbyId = function(id){
      for(var i in todoservice.todoItems){
        if(todoservice.todoItems[i].id == id){
          return todoservice.todoItems[i];
        }
      }
  };
  todoservice.getNewId = function(){
    if(todoservice.newId){
      todoservice.newId++;
      return todoservice.newId;
    }else{
      var maxId = _.max(todoservice.todoItems, function(entry){return entry.id})
      todoservice.newId = maxId + 1;
      return todoservice.newId;
    }
  };
  todoservice.save = function(entry){
    entry.id = todoservice.getNewId();
    todoservice.todoItems.push(entry);
  }
  return todoservice;
});

app.controller("todoItemController", [
  "$scope",
  "$routeParams",
  "$location",
  "todoService",
  function ($scope, $routeParams, $location, todoService) {
    $scope.todoItems = todoService.todoItems;
    if(!$routeParams.id){
      $scope.todoItem = {id:0, completed: true, todo: "", date: new Date() };
      }else{
        $scope.todoItem = todoService.findbyId(parseInt($routeParams.id));
        console.log($routeParams.id);
      }
    $scope.save = function(){
      todoService.save($scope.todoItems);
      $location.path("/");
    }
  }
]);

app.config([
  "$routeProvider","$locationProvider",
  function ($routeProvider, $locationProvider) {
    $routeProvider
      .when("/", {
        templateUrl: "views/todolist.html",
        controller: "todoItemController"
      })
      .when("/additem", {
        templateUrl: "views/addtodo.html",
        controller: "todoItemController"
      })
      .when("/additem/edit/:id/", {
        templateUrl: "views/addtodo.html",
        controller: "todoItemController"
      })
      .otherwise({
        redirectTo: "/",
      });
      $locationProvider.html5Mode(true);
  }
]);