angular.module('starter.controllers', [])
.controller('AppCtrl', function($scope, $ionicModal, $timeout, $http, $ionicPopup, $rootScope, $ionicLoading, $state, $ionicHistory, $interval) {

  //GLOBAL VARIABLE FOR SERVER URL
  $rootScope.serverurl = 'https://labotigadelaloe.es/api.php';
  //SETTING THE LOADING SCREEN FOR AJAX
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
    $state.go('login');
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
            $state.go('login');
         }
    });
    
    //SETTING THE FUNCTION TO CHECK FOR NEW UPDATES
    $interval( function() {
        if(localStorage.usertype == 1) {
            $http.post($rootScope.serverurl, {action: 'actualizar', id: localStorage.lastReserva}).then(function (res){
                console.log('Buscando nuevas...');
                $scope.reservas = res.data;
                console.log('Nuevas reservas:'+ $scope.reservas.length);
                if($scope.reservas.length > 0) {
                    $scope.$emit('nuevasreservas', { cantidad: $scope.reservas.length});
                    localStorage.updateReservas = localStorage.lastReserva;
                } else {
                    $rootScope.aviso = 0;
                }
            });
        }
    }, 5000);
    
    //HOOK FOR TRIGGERING NEW UPDATES
    $scope.$on('nuevasreservas', function (event, args) {
        $rootScope.aviso = args.cantidad;
    });
})
.controller('ReservasCtrl', function($scope, $ionicPopup, $http, $rootScope, $ionicLoading, $state) {
    
    $scope.limitemostrar = 10;
    $scope.reservas = [];
    
    var iduser = 'admin';
    if(localStorage.usertype == 2) {
        iduser = localStorage.iduser;
    } 
  
    //LOADING RESERVAS
    $rootScope.show($ionicLoading);
    $http.post($rootScope.serverurl, {action: 'verreservas', iduser: iduser}).then(function (res){
        $scope.reservas = res.data;
        localStorage.lastReserva = $scope.reservas[0].ID;
        $rootScope.hide($ionicLoading);  
    });
    $scope.lastReserva = localStorage.lastReserva;
    $scope.updateReservas = localStorage.updateReservas;
    $scope.usertype = localStorage.usertype;
    $scope.moredata = false;

    $scope.loadMoreData=function()
    {
         console.log('Loading more', $scope.limitemostrar);
         if ($scope.reservas.length > $scope.limitemostrar)
            $scope.limitemostrar += $scope.limitemostrar; // load 20 more items
            $scope.$broadcast('scroll.infiniteScrollComplete'); // need to call this when finish loading more data
    };
    
    //DELETE RESERVAS
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
    //HOOK FOR TRIGGERING NEW UPDATES
    $scope.$on('nuevasreservas', function (event, args) {
        $rootScope.aviso = args.cantidad;
    });
    //MAKING RESERVAS
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
}).controller('LoginCtrl', function($scope, LoginService,$rootScope, $ionicPopup, $state) {
    $scope.loginData = {};
 
    $scope.doLogin = function() {
        LoginService.loginUser($scope.loginData.username, $scope.loginData.password, $rootScope.serverurl).success(function(data) {
                console.log(data);
                //var data = data.data;
                if(data.error == 1){
                    deferred.reject('Wrong credentials.');
                } else {
                    localStorage.setItem("login", 1);
                    localStorage.setItem("iduser", data.ID);
                    localStorage.setItem("din", data.DATEIN);
                    localStorage.setItem("dout", data.DATEOUT);
                    localStorage.setItem("usertype", data.TYPE);
                    localStorage.setItem("room", data.ROOM);
                    localStorage.setItem("name", data.NAME);
                    var userdata = {
                        id      : data.ID,
                        name    : data.NAME,
                        room    : data.ROOM,
                        datein  : data.DATEIN,
                        dateout : data.DATEOUT,
                        usertype : data.TYPE
                    }

                }
            $state.go('app.home');
        }).error(function(data) {
            var alertPopup = $ionicPopup.alert({
                title: 'Login failed!',
                template: 'Please check your credentials!'
            });
        });
    }
}).service('LoginService', function($q,$http) {
    return {
        loginUser: function(name, pw, sv) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.post('https://labotigadelaloe.es/api.php', {action: 'login', username : name, password: pw}).then(function (res){
                var data = res.data;
                    console.log(data.error);
                if(data.error == 1){
                    deferred.reject(data);
                } else {
                    deferred.resolve(data);
                }
            });

            promise.success = function(fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function(fn) {
                promise.then(null, fn);
                return promise;
            }
            return promise;
        }
    }
});
