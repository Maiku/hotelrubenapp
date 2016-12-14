angular.module('starter.controllers', [])
.controller('AppCtrl', function($scope, $ionicModal, $timeout, $http, $ionicPopup, $rootScope, $ionicLoading, $state, $ionicHistory) {

  //GLOBAL VARIABLE FOR SERVER URL
  $rootScope.serverurl = 'http://localhost/api.php';
    $rootScope.show = function() {
        $ionicLoading.show({
          template: '<p>Sincronizando...</p><ion-spinner icon="lines"></ion-spinner>'
        });
    };

    $rootScope.hide = function(){
        $ionicLoading.hide();
    };
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
        $rootScope.show($ionicLoading);
        $http.post($rootScope.serverurl, {action: 'login', username : $scope.loginData.username, password: $scope.loginData.password}).then(function (res){
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
                localStorage.setItem("din", $scope.data.DATEIN);
                localStorage.setItem("dout", $scope.data.DATEOUT);
                localStorage.setItem("usertype", $scope.data.TYPE);
                localStorage.setItem("room", $scope.data.ROOM);
                localStorage.setItem("name", $scope.data.NAME);
                $scope.userdata = {
                    id      : $scope.data.ID,
                    name    : $scope.data.NAME,
                    room    : $scope.data.ROOM,
                    datein  : $scope.data.DATEIN,
                    dateout : $scope.data.DATEOUT,
                    usertype : $scope.data.TYPE
                }
                $scope.closeLogin();
            }
            $rootScope.hide($ionicLoading);
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
        $scope.userdata = {
            id      : localStorage.ID,
            name    : localStorage.name,
            room    : localStorage.room,
            datein  : localStorage.din,
            dateout : localStorage.dout,
            usertype : localStorage.usertype
        }
        if(localStorage.login == 0 || !localStorage.login) {
           $scope.modal.show();
         }
    });
})

.controller('ReservasCtrl', function($scope, $ionicPopup, $http, $rootScope, $ionicLoading, $state) {
    
    $scope.limitemostrar = 10;
    $scope.reservas = [];
    var iduser = 'admin';
    $scope.$on('$ionicView.enter', function(e) {
        if(localStorage.usertype == 2) {
            iduser = localStorage.iduser;
        } 
        $rootScope.show($ionicLoading);
        $http.post($rootScope.serverurl, {action: 'verreservas', iduser: iduser}).then(function (res){
            $scope.reservas = res.data;
            $rootScope.hide($ionicLoading);  
        });
    });

        $scope.moredata = false;

        $scope.loadMoreData=function()
        {
             console.log('Loading more', $scope.limitemostrar);
             if ($scope.reservas.length > $scope.limitemostrar)
                $scope.limitemostrar += $scope.limitemostrar; // load 20 more items
                $scope.$broadcast('scroll.infiniteScrollComplete'); // need to call this when finish loading more data
        };

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
                $rootScope.show($ionicLoading);
                $http.post($rootScope.serverurl, {action: 'deleteactividad', idactividad: id}).then(function (res){
                $scope.data = res.data;
                if($scope.data.error == 1){
                    $ionicPopup.alert({
                          title: 'Error!',
                          template: '<center>Ha ocurrido un problema de conexión, pruebe mas tarde o contacte con recepcion.</center>'
                    });
                } else {
                    var index = -1;		
                    var comArr = eval( $scope.reservas );
                    for( var i = 0; i < comArr.length; i++ ) {
                            if( comArr[i].ID === id ) {
                                    index = i;
                                    break;
                            }
                    }
                    $scope.reservas.splice( index, 1 );	
                    $ionicPopup.alert({
                          title: 'Cancelada!',
                          template: '<center>Su reserva ha sido cancelada.</center>'
                    });
                }
                    $rootScope.hide($ionicLoading);
                });
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
                //2016-12-22 12:23:00
                var fechaarreglada = fechaS+' '+horaS+':00';
                console.log(fechaarreglada);
                $rootScope.show($ionicLoading);
                $http.post($rootScope.serverurl, {action: 'reserva', usuario: localStorage.iduser, fecha: fechaarreglada, actividad: id}).then(function (res){
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
                    $rootScope.hide($ionicLoading);
                });            
            } else {
              console.log('You are not sure');
            }
        });
    }
});
