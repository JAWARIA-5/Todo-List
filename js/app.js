var app = angular.module("todoApp", ["ngRoute"]);

app.controller("TitleController", [
  "$scope",
  function ($scope) {
    $scope.title = "Todo";
  },
]);

app.service("todoService", function ($http) {
  var todoservice = {};
  todoservice.todoItems = [];

  $http
    .get("data/server_data.json")
    .then(function (response) {
      todoservice.todoItems = response.data;
    })
    .catch(function (err) {
      console.error("Error fetching data:", err);
    });

  todoservice.findbyId = function (id) {
    for (var i in todoservice.todoItems) {
      if (todoservice.todoItems[i].id === id) {
        return todoservice.todoItems[i];
      }
    }
  };

  todoservice.getNewId = function () {
    if (todoservice.newId) {
      todoservice.newId++;
      return todoservice.newId;
    } else {
      var maxId = _.max(todoservice.todoItems, function (entry) {
        return entry.id;
      });
      todoservice.newId = maxId.id + 1;
      return todoservice.newId;
    }
  };

  todoservice.save = function (entry) {
    var updatedItem = todoservice.findbyId(entry.id);
    if (updatedItem) {

      $http.get("data/updated_item.json", entry)
        .then(function (response) {
        if (response.data.updated_status === "1") {
            updatedItem.completed = entry.completed;
            updatedItem.todo = entry.todo;
            updatedItem.date = entry.date;
          }
        })
        .catch(function (err, status) {});

    } else {
      $http
        .get("data/added_item.json", { params: entry })
        .then(function (response) {
          entry.id = response.data.newId;
        })
        .catch(function (err) {
          console.error("Error fetching data:", err);
        });

      //entry.id = todoservice.getNewId();
      todoservice.todoItems.push(entry);
      
    }
  };

  todoservice.removeItem = function (entry) {
    var index = todoservice.todoItems.indexOf(entry);
    todoservice.todoItems.splice(index, 1);
  };

  todoservice.completeItem = function (entry) {
    entry.completed = !entry.completed;
  };

  return todoservice;
});

app.controller("todoItemController", [
  "$scope",
  "$routeParams",
  "$location",
  "todoService",
  function ($scope, $routeParams, $location, todoService) {
    if (!$routeParams.id) {
      $scope.todoItem = { id: 0, completed: true, todo: "", date: new Date() };
    } else {
      $scope.todoItem = _.clone(
        todoService.findbyId(parseInt($routeParams.id))
      );
      console.log($routeParams.id);
    }
    $scope.save = function () {
      todoService.save($scope.todoItem);
      $location.path("/");
    };
  },
]);

app.controller("homeController", [
  "$scope",
  "todoService",
  function ($scope, todoService) {
    $scope.todoItems = todoService.todoItems;
    $scope.removeItem = function (entry) {
      todoService.removeItem(entry);
    };
    $scope.completeItem = function (entry) {
      todoService.completeItem(entry);
    };

    $scope.$watch(
      function () {
        return todoService.todoItems;
      },
      function (todoItems) {
        $scope.todoItems = todoItems;
      }
    );
  },
]);

app.config([
  "$routeProvider",
  "$locationProvider",
  function ($routeProvider, $locationProvider) {
    $routeProvider
      .when("/", {
        templateUrl: "views/todolist.html",
        controller: "homeController",
      })
      .when("/additem", {
        templateUrl: "views/addtodo.html",
        controller: "todoItemController",
      })
      .when("/additem/edit/:id/", {
        templateUrl: "views/addtodo.html",
        controller: "todoItemController",
      })
      .otherwise({
        redirectTo: "/",
      });
    $locationProvider.html5Mode(true);
  },
]);

app.directive("jaTodoItem", function () {
  return {
    restrict: "E",
    templateUrl: "views/todoItem.html",
  };
});
