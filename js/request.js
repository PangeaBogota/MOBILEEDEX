var app_angular = angular.module('PedidosOnline');
app_angular.factory('actividadesFactory', function($http) {
   return {
        sendActividad: function(usuario,empresa,datos) {
             //return the promise directly.
             return $http.get('http://localhost:45091/Mobile/uploadData?usuario='+usuario+'&entidad=ACTIVIDADES&codigo_empresa=' + empresa + '&datos=' +datos)
                       .then(function(result) {
                            //resolve the promise as the data
                            return result.data;
                        });
        }
   }
});