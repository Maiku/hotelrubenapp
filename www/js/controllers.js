angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $http, $ionicPopup) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function(logoff) {
    if(logoff == 0) {
        localStorage.setItem("login", 0);
    }
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Trying to login');
    
    //API LINK
    var link = 'http://localhost/api.php';
    if($scope.loginData.username  && $scope.loginData.password) {
        $http.post(link, {action: 'login', username : $scope.loginData.username, password: $scope.loginData.password}).then(function (res){
            $scope.data = res.data;
            console.log($scope.data.error);
            if($scope.data.error == 1){
                $ionicPopup.alert({
                      title: 'Datos erroneos!',
                      template: '<center>Revise su usuario y su contraseña</center>'
                });
            } else {
                localStorage.setItem("login", 1);
                localStorage.setItem("iduser", $scope.data.ID);
                $scope.userdata = {
                    id      : $scope.data.ID,
                    name    : $scope.data.NAME,
                    room    : $scope.data.ROOM,
                    pic     : "http://localhost/img/"+$scope.data.PICTURE,
                    datein  : $scope.data.DATEIN,
                    dateout : $scope.data.DATEOUT,
                }
                $scope.closeLogin();
            }
        });
    } else {
        $ionicPopup.alert({
            title: 'Campos vacios!',
            template: '<center>Introduzca sus datos de acceso</center>'
        });
    }

  };
    //CHECK IF USER IS LOGGED, IF NOT, WE GET THE LOGIN FORM
   $scope.$on('$ionicView.enter', function(e) {
        if(localStorage.login == 0 || !localStorage.login) {
           $scope.modal.show();
         }
    });
})

.controller('ReservasCtrl', function($scope, $ionicPopup, $http) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
    $scope.deleteActividad = function(id){
        console.log('Delete?');
        var confirmPopup = $ionicPopup.confirm({
            title: 'Cancelar actividad',
            template: '<div style="text-align: center">¿Desea cancelar la actividad?</div>',
            cancelText: 'No',
            cancelType: 'button-calm',
            okText: 'Cancelar',
            okType: 'button-assertive'
        });

        confirmPopup.then(function(res) {
            if(res) {
              console.log('You are sure');
            } else {
              console.log('You are not sure');
            }
        });
    }
    $scope.reservarActividad = function(id, fecha, hora){
        console.log('Reservar?');
        var fechaS = new Date(fecha);
        var fechaS = fechaS.getFullYear()+'-'+(fechaS.getMonth() + 1)+'-'+fechaS.getDate();
        var horaS = new Date(hora);
        var horaS = horaS.getHours()+':'+horaS.getMinutes();
        var confirmPopup = $ionicPopup.confirm({
            title: 'Reservar actividad',
            template: '<div style="text-align: center">¿Reservar actividad? <br> '+fechaS+' - '+horaS+' </div>',
            cancelText: 'Cancelar',
            cancelType: 'button-royal',
            okText: 'Reservar',
            okType: 'button-balanced'
        });

        confirmPopup.then(function(res) {
            if(res) {
                var link = 'http://localhost/api.php';
                //2016-12-22 12:23:00
                var fechaarreglada = fechaS+' '+horaS+':00';
                console.log(fechaarreglada);
                $http.post(link, {action: 'reserva', usuario: localStorage.iduser, fecha: fechaarreglada, actividad: id}).then(function (res){
                    $scope.data = res.data;
                    console.log($scope.data.error);
                    if($scope.data.error == 1){
                        $ionicPopup.alert({
                              title: 'Ocupado!',
                              template: '<center>Ese horario para esa actividad ya esta reservado, elija otro.</center>'
                        });
                    } else if ($scope.data.error == 2){
                        $ionicPopup.alert({
                              title: 'Problema de conexion!',
                              template: '<center>Ha ocurrido un problema de conexión, pruebe mas tarde o contacte con recepcion.</center>'
                        });
                    } else {
                        $ionicPopup.alert({
                              title: 'Reservado!',
                              template: '<center>Su reserva ha sido realizada.</center>'
                        });
                    }
                });            
            } else {
              console.log('You are not sure');
            }
        });
    }
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
