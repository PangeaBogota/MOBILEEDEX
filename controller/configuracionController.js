app_angular.controller("configController",['Conexion','$scope','$route',function (Conexion,$scope,$route) {
	try
	{
		debugger
		$scope.MAESTROS_SINCRONIZACION=JSON.parse(window.localStorage.getItem("MAESTROS_SINCRONIZACION"));
		if ($scope.MAESTROS_SINCRONIZACION==null || $scope.MAESTROS_SINCRONIZACION==undefined || $scope.MAESTROS_SINCRONIZACION==NaN) 
		{
			$scope.MAESTROS_SINCRONIZACION={
				pedido:true,
				tercero:true,
				actividad:true,
				item:true
			}
		}
		$scope.Guardar=function()
		{
			localStorage.removeItem('MAESTROS_SINCRONIZACION');
			localStorage.setItem('MAESTROS_SINCRONIZACION', JSON.stringify($scope.MAESTROS_SINCRONIZACION)); 
			Mensajes('Guardado Correctamente','success');
		}
	}
	catch(error)
	{
		console.log('error')
	}
	
}]);