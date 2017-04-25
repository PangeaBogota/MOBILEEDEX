'use strict';


var app_angular= angular.module('PedidosOnline');

app_angular.controller("actividadesController",['Conexion','$scope', '$routeParams', '$window',function (Conexion,$scope,$routeParams,$window) {
	$scope.Latitude='';
	$scope.Longitud='';
	var options = {enableHighAccuracy: true, timeout: 5000, maximumAge: 18000000};
	function geolocation()
    {
        var watchID = navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
        function onSuccess(position)
        {
        	$scope.Latitude=position.coords.latitude;
			$scope.Longitud= position.coords.longitude;
        }
        function onError(error)
        {
        	alert("Por favor habilitar la Ubicacion, Verificar Conexion a Internet!");
        }
    }
    $scope.Reload=function()
    {
    	location.reload();
    }
    $(document).ready(function () {
        geolocation();
    });
    $scope.list_tercero=[];
	$scope.Search;
	$scope.registro=[];
	$scope.terceroSelected;
	$scope.terceroDeTercero=$routeParams.personId;
	CRUD.select('select * from erp_terceros ',
		function(elem)
		{
			$scope.list_tercero.push(elem);
			if ($scope.terceroDeTercero!=undefined   && elem.rowid==$scope.terceroDeTercero) 
			{
				$scope.terceroSelected=elem
				//$scope.Search=$scope.terceroSelected.razonsocial;
				$('#fc_create').click();
			}
		})
	$scope.sessiondate=JSON.parse(window.localStorage.getItem("CUR_USER"));
	$scope.horario=[];
	$scope.CurrentDate=function(){
		$scope.day;
		$scope.DayNow=Date.now();
		$scope.YearS=$scope.DayNow.getFullYear();
		$scope.MonthS=$scope.DayNow.getMonth()+1;
		if ($scope.MonthS<10) {$scope.MonthS='0'+$scope.MonthS}
		$scope.DayS=$scope.DayNow.getDate();
		$scope.HourS=$scope.DayNow.getHours();
		$scope.MinuteS=$scope.DayNow.getMinutes();
		if ($scope.DayS<10) {$scope.DayS='0'+$scope.DayS}
		$scope.day=$scope.YearS+'/'+$scope.MonthS+'/'+$scope.DayS+' '+$scope.HourS+':'+$scope.MinuteS;
		return $scope.day;
	}
	$scope.selectedDate=function(day){
		$scope.day;
		$scope.DayNow=new Date(day);
		$scope.YearS=$scope.DayNow.getFullYear();
		$scope.MonthS=$scope.DayNow.getMonth()+1;
		if ($scope.MonthS<10) {$scope.MonthS='0'+$scope.MonthS}
		$scope.DayS=$scope.DayNow.getDate();
		$scope.HourS=$scope.DayNow.getHours();
		$scope.MinuteS=$scope.DayNow.getMinutes();
		if ($scope.DayS<10) {$scope.DayS='0'+$scope.DayS}
		$scope.day=$scope.YearS+'-'+$scope.MonthS+'-'+$scope.DayS;
		return $scope.day;
	}
	$scope.getHour=function(day){
		$scope.day;
		$scope.DayNow=new Date(day);
		$scope.YearS=$scope.DayNow.getFullYear();
		$scope.MonthS=$scope.DayNow.getMonth()+1;
		
		$scope.DayS=$scope.DayNow.getDate();
		$scope.HourS=$scope.DayNow.getHours();
		$scope.MinuteS=$scope.DayNow.getMinutes();
		if ($scope.MinuteS<10) {$scope.MinuteS='0'+$scope.MinuteS}
		if ($scope.HourS<10) {$scope.HourS='0'+$scope.HourS}
		$scope.day=$scope.HourS+':'+$scope.MinuteS;
		return $scope.day;
	}
	$scope.ultimoRegistro=[];
	$scope.events=[];
	$scope.actividades=[];
	$scope.eventSources=[];
	$scope.fechainicial;
	$scope.fechafinal;
	$scope.NuevoEvento=[];
	$scope.listActividadTipo=[];
	$scope.listActividadTipoRelacion=[];
	$scope.listActividadPrioridad=[];
	$scope.listEstadoActividad=[];
	$scope.actividadesDia=[];
	$scope.actividadSelected=[];
	$scope.actividad=[];
	CRUD.select('select * from m_estados where  tipo_estado="ACTIVIDAD"',function(elem){$scope.listEstadoActividad.push(elem)});
	CRUD.select('select * from m_metaclass where  class_code="ACTIVIDAD.TIPO.RELACION" and tipo_reg_codigo IN ("Cliente","Prospecto","ADMINISTRATIVO","OTROS")',function(elem){$scope.listActividadTipoRelacion.push(elem)});
	CRUD.select('select * from m_metaclass where  class_code="ACTIVIDAD.PRIORIDAD"',function(elem){$scope.listActividadPrioridad.push(elem)});
	CRUD.select('select * from m_metaclass where  class_code="ACTIVIDAD.TIPO"',function(elem){$scope.listActividadTipo.push(elem)});
	$scope.RefrescarVista=function(){
		$scope.eventSources=[];
		$scope.events=[];
		CRUD.selectAllinOne('select rowid,  fecha_inicial, fecha_final,tema,ind_prioridad,usuario_creacion from crm_Actividades order by usuario_creacion',
		function(elem){
			if (elem.length>0) 
			{
				var usuarioa='';
				var Color='';
				$scope.actividades=elem;
				for (var i = 0; i < elem.length; i++) {
					//hora Inicial
					$scope.fechainicial=new Date(elem[i].fecha_inicial);
					//Hora Final
					$scope.fechafinal=new Date(elem[i].fecha_final);
					/*if (elem[i].ind_prioridad=='Alta') {
						$scope.events.push({id:elem[i].rowid,title:elem[i].tema,start:new Date(elem[i].fecha_inicial),end:new Date(elem[i].fecha_final),color:'red'})	
					}
					else if (elem[i].ind_prioridad=='Media') {
						$scope.events.push({id:elem[i].rowid,title:elem[i].tema,start:new Date(elem[i].fecha_inicial),end:new Date(elem[i].fecha_final),color:'orange'})	
					}
					else{
						
					}*/

					if (Color=='') {
						Color=getRandomColor();
					}
					if (usuarioa=='') {
						usuarioa=elem[i].usuario_creacion;
					}
					if (usuarioa!=elem[i].usuario_creacion) 
					{
						Color=getRandomColor();
					}
					$scope.events.push({id:elem[i].rowid,title:elem[i].usuario_creacion+"-"+elem[i].tema,start:new Date(elem[i].fecha_inicial),end:new Date(elem[i].fecha_final),color:Color});
					if (usuarioa=='') {
						usuarioa=elem[i].usuario_creacion;
					}
				}
				$scope.eventSources=$scope.events;
				angular.element('#calendar1').fullCalendar('removeEvents');
				angular.element('#calendar1').fullCalendar( 'addEventSource', $scope.eventSources )
				angular.element('#calendar1').fullCalendar('rerenderEvents');
			}
			
		})
	}
	function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
	$scope.abrirModal=function(){
		$('#fc_create').click();
	}
	$scope.guardarActividad=function(estado){
		if (estado) {
			Mensajes('Verificar Campos Requeridos','error','')
			return;
		}
		if ($scope.horario.fechaInicial>$scope.horario.fechaFinal) {
			Mensajes('Fecha Inicial no puede ser mayor a Fecha Final','error','');
			return;
		}
		if ($scope.selectedDate($scope.horario.fechaFinal)==$scope.selectedDate($scope.horario.fechaInicial)) {
			var horainicial=$scope.getHour($scope.horario.horaInicial).replace(":","");
			var horaFinal=$scope.getHour($scope.horario.horaFinal).replace(":","");
			if (horainicial>horaFinal) {
				Mensajes('Hora Inicial no puede ser mayor a Hora Final','error','');
			return;
			}
		}
		ProcesadoShow();
		var watchID = navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
        function onSuccess(position)
        {
        	$scope.Latitude=position.coords.latitude;
			$scope.Longitud= position.coords.longitude;
            $scope.EnviarRegistro();
            ProcesadoHiden();
        }
        function onError(error)
        {
        	ProcesadoHiden();
        	alert("Por favor habilitar la Ubicacion, Verificar Conexion a Internet!");
        }
        
	}
	$scope.EnviarRegistro=function(){
		if ($scope.NuevoEvento.tipo_relacion=="ADMINISTRATIVO" || $scope.NuevoEvento.tipo_relacion=="OTROS" || $scope.NuevoEvento.tipo_relacion=="Prospecto") 
		{
			if ($scope.NuevoEvento.descripcion==undefined || $scope.NuevoEvento.descripcion=="") {
				Mensajes('Se debe agregar una descripcion','error','');
				return;
			}
			$scope.NuevoEvento.relacionado_a="";
		}
		else
		{
			if ($scope.terceroSelected==undefined || $scope.terceroSelected.length==0 ) {
				Mensajes('Se debe seleccionar un cliente.','error','');
				return;
			}
			$scope.NuevoEvento.relacionado_a=$scope.terceroSelected.razonsocial;
		}
		$scope.ultimoRegistro=[];
		CRUD.select('select max(rowid) as rowid from crm_actividades',function(elem){$scope.ultimoRegistro.push(elem);
			$scope.ultimoRegistroseleccionado=$scope.ultimoRegistro[0];
			$scope.NuevoEvento.rowid=$scope.ultimoRegistroseleccionado.rowid+1;
			$scope.NuevoEvento.usuario_creacion=$scope.sessiondate.nombre_usuario;
			
			$scope.NuevoEvento.sincronizado='false';
			$scope.NuevoEvento.fecha_inicial=$scope.selectedDate($scope.horario.fechaInicial)+' '+$scope.getHour($scope.horario.horaInicial) ;
			$scope.NuevoEvento.fecha_final=$scope.selectedDate($scope.horario.fechaFinal)+' '+$scope.getHour($scope.horario.horaFinal) ;
			$scope.NuevoEvento.longitud=$scope.Longitud;
			$scope.NuevoEvento.latitud=$scope.Latitude;
			$scope.NuevoEvento.fecha_creacion=$scope.CurrentDate();
			CRUD.insert('crm_actividades',$scope.NuevoEvento)
			
			$scope.localizacionRegistro=[];
			$scope.localizacionRegistro.latitud=$scope.Latitude;
			$scope.localizacionRegistro.longitud=$scope.Longitud;
			$scope.localizacionRegistro.estadoID=$scope.NuevoEvento.rowid_estado;
			$scope.localizacionRegistro.descripcion='Creacion';
			$scope.localizacionRegistro.rowid_actividad=$scope.ultimoRegistroseleccionado.rowid+1;
			$scope.localizacionRegistro.fechacreacion=$scope.CurrentDate();
			CRUD.insert('crm_localizacion',$scope.localizacionRegistro)
			$scope.horario=[];
			$scope.terceroSelected=[];
			$scope.NuevoEvento=[];
			$scope.RefrescarVista();

			$('#cerrarModal').click();
	        Mensajes('Actividad Nueva Creada','success','');
	        $scope.Longitud='';
        	$scope.Latitude='';
		})
	}
	//Variables Auxiliares
	var started;
    var categoryClass;
    var ended;
    $scope.terceroActividad=[];
    $scope.modifica=false;
    debugger
	$scope.eventSources=$scope.events;
	$scope.calOptions={
		editable:true,
		selectable: true,
		selectHelper: true,
		header:{
			left:'prev,next today',
			center:'title',
			right:'month,agendaWeek,agendaDay',
			
		},
		select:function(start,end,allDay){
			$('#fc_View').click();
			$scope.ConsultarDia(end);

		},
        eventClick: function (calEvent, jsEvent, view) {
            $('#fc_ViewEvent').click();
            $scope.actividadesDia=[];
			$scope.actividad=[];

			CRUD.select("select * from vw_actividades_usuario where rowid= '"+calEvent.id+"' ",function(elem){
				if (elem.canal=='null') 
				{
					elem.condicion=false;
				}
				$scope.estado=elem.rowid_estado
				$scope.actividad=elem;
				for (var i = 0; i < $scope.list_tercero.length; i++) {

				 	if ($scope.list_tercero[i].razonsocial==$scope.actividad.relacionado_a) 
				 	{
				 		$scope.terceroActividad=$scope.list_tercero[i];
				 	}
				}
				if ($scope.estado==1005) 
				{
					 $scope.modifica=false;
				}
				else
				{
					 $scope.modifica=true;
				}
				$scope.fechaInicial=new Date($scope.actividad.fecha_inicial);
				$scope.fechaFinal=new Date($scope.actividad.fecha_final);
				$scope.horaInicial=new Date($scope.actividad.fecha_final);
				$scope.horaFinal=new Date($scope.actividad.fecha_final);

			});
            //CRUD.selectParametro('crm_actividades','rowid',calEvent.id,function(elem){$scope.actividadSelected.push(elem);$scope.actividad=$scope.actividadSelected[0]});
        }
	}
	$scope.onchangeFecha=function(parm)
	{
		$scope.params=[];
		$scope.params.fecha1=$scope.horario.fechaInicial;
		$scope.params.fecha2=$scope.horario.fechaFinal;
		$scope.params.hora1=$scope.horario.horaInicial;
		$scope.params.hora2=$scope.horario.horaFinal;
		if (parm=='Inicial') {
			
			if ($scope.params.fecha2!=undefined) {
				$scope.params.fecha1=$scope.selectedDate($scope.params.fecha1)
				$scope.params.fecha2=$scope.selectedDate($scope.params.fecha2)
				$scope.params.fecha1=$scope.params.fecha1.replace('-','')
				$scope.params.fecha2=$scope.params.fecha2.replace('-','')
				$scope.params.fecha1=$scope.params.fecha1.replace('-','')
				$scope.params.fecha2=$scope.params.fecha2.replace('-','')
				if ($scope.params.fecha1>$scope.params.fecha2) {
					Mensajes('Fecha Inicial No puede ser Mayor','error','');
					document.getElementById("fechaInicial").valueAsDate = null;
					$scope.horario.fechaInicial='';
				}	
			}
		}else if (parm=='Final') {
			if ($scope.params.fecha1!=undefined) {
				$scope.params.fecha1=$scope.selectedDate($scope.params.fecha1)
				$scope.params.fecha2=$scope.selectedDate($scope.params.fecha2)
				$scope.params.fecha1=$scope.params.fecha1.replace('-','')
				$scope.params.fecha2=$scope.params.fecha2.replace('-','')
				$scope.params.fecha1=$scope.params.fecha1.replace('-','')
				$scope.params.fecha2=$scope.params.fecha2.replace('-','')
				if ($scope.params.fecha1>$scope.params.fecha2) {
					Mensajes('Fecha Final No puede ser menor','error','');
					document.getElementById("fechaFinal").valueAsDate = null;
					$scope.horario.fechaFinal='';
				}	
			}
		}else if (parm=='HInicial') {
			
			if ($scope.params.hora2!=undefined) {
				if ($scope.params.fecha2==undefined || $scope.params.fecha1==undefined) {
					Mensajes('Seleccionar Fechas Primero','error','');
					$scope.horario.horaInicial='';
					return
				}
				$scope.params.fecha1=$scope.selectedDate($scope.params.fecha1)
				$scope.params.fecha2=$scope.selectedDate($scope.params.fecha2)
				$scope.params.fecha1=$scope.params.fecha1.replace('-','')
				$scope.params.fecha2=$scope.params.fecha2.replace('-','')
				$scope.params.fecha2=$scope.params.fecha2.replace('-','')
				$scope.params.fecha1=$scope.params.fecha1.replace('-','')
				if ($scope.params.fecha1==$scope.params.fecha2) {
					$scope.params.hora1=$scope.getHour($scope.params.hora1);
					$scope.params.hora2=$scope.getHour($scope.params.hora2);
					$scope.params.hora2=$scope.params.hora2.replace(':','')
					$scope.params.hora1=$scope.params.hora1.replace(':','')
					if ($scope.params.hora1>$scope.params.hora2) {
						Mensajes('Hora inicial no puede ser Mayor el mismo dia','error','');
						$scope.params.hora1=$scope.horario.horaInicial='';
						return
					}	
				}
			}
		}else if (parm=='HFinal') {
			if ($scope.params.hora1!=undefined) {
				if ($scope.params.fecha2==undefined || $scope.params.fecha1==undefined) {
					Mensajes('Seleccionar Fechas Primero','error','');
					$scope.horario.horaFinal='';
					return
				}
				$scope.params.fecha1=$scope.selectedDate($scope.params.fecha1)
				$scope.params.fecha2=$scope.selectedDate($scope.params.fecha2)
				$scope.params.fecha1=$scope.params.fecha1.replace('-','')
				$scope.params.fecha2=$scope.params.fecha2.replace('-','')
				$scope.params.fecha2=$scope.params.fecha2.replace('-','')
				$scope.params.fecha1=$scope.params.fecha1.replace('-','')
				if ($scope.params.fecha1==$scope.params.fecha2) {
					$scope.params.hora1=$scope.getHour($scope.params.hora1);
					$scope.params.hora2=$scope.getHour($scope.params.hora2);
					$scope.params.hora2=$scope.params.hora2.replace(':','')
					$scope.params.hora1=$scope.params.hora1.replace(':','')
					if ($scope.params.hora1>$scope.params.hora2) {
						Mensajes('Hora Final no puede ser menor  el mismo dia','error','');
						$scope.params.hora1=$scope.horario.horaFinal='';
					}	
				}
				
			}
		}
	}
	$scope.onchangeFechaV=function(parm)
	{
		debugger
		$scope.params=[];
		$scope.params.fecha1=$scope.fechaInicial;
		$scope.params.fecha2=$scope.fechaFinal;
		$scope.params.hora1=$scope.horaInicial;
		$scope.params.hora2=$scope.horaFinal;
		if (parm=='Inicial') {
			
			if ($scope.params.fecha2!=undefined) {
				$scope.params.fecha1=$scope.selectedDate($scope.params.fecha1)
				$scope.params.fecha2=$scope.selectedDate($scope.params.fecha2)
				$scope.params.fecha1=$scope.params.fecha1.replace('-','')
				$scope.params.fecha2=$scope.params.fecha2.replace('-','')
				$scope.params.fecha1=$scope.params.fecha1.replace('-','')
				$scope.params.fecha2=$scope.params.fecha2.replace('-','')
				if ($scope.params.fecha1>$scope.params.fecha2) {
					Mensajes('Fecha Inicial No puede ser Mayor','error','');
					document.getElementById("fechaInicial1").valueAsDate = null;
					$scope.fechaInicial='';
				}	
			}
		}else if (parm=='Final') {
			if ($scope.params.fecha1!=undefined) {
				$scope.params.fecha1=$scope.selectedDate($scope.params.fecha1)
				$scope.params.fecha2=$scope.selectedDate($scope.params.fecha2)
				$scope.params.fecha1=$scope.params.fecha1.replace('-','')
				$scope.params.fecha2=$scope.params.fecha2.replace('-','')
				$scope.params.fecha1=$scope.params.fecha1.replace('-','')
				$scope.params.fecha2=$scope.params.fecha2.replace('-','')
				if ($scope.params.fecha1>$scope.params.fecha2) {
					Mensajes('Fecha Final No puede ser menor','error','');
					document.getElementById("fechaFinal1").valueAsDate = null;
					$scope.fechaFinal='';
				}	
			}
		}else if (parm=='HInicial') {
			
			if ($scope.params.hora2!=undefined) {
				if ($scope.params.fecha2==undefined || $scope.params.fecha1==undefined) {
					Mensajes('Seleccionar Fechas Primero','error','');
					$scope.horaInicial='';
					return
				}
				$scope.params.fecha1=$scope.selectedDate($scope.params.fecha1)
				$scope.params.fecha2=$scope.selectedDate($scope.params.fecha2)
				$scope.params.fecha1=$scope.params.fecha1.replace('-','')
				$scope.params.fecha2=$scope.params.fecha2.replace('-','')
				$scope.params.fecha2=$scope.params.fecha2.replace('-','')
				$scope.params.fecha1=$scope.params.fecha1.replace('-','')
				if ($scope.params.fecha1==$scope.params.fecha2) {
					$scope.params.hora1=$scope.getHour($scope.params.hora1);
					$scope.params.hora2=$scope.getHour($scope.params.hora2);
					$scope.params.hora2=$scope.params.hora2.replace(':','')
					$scope.params.hora1=$scope.params.hora1.replace(':','')
					if ($scope.params.hora1>$scope.params.hora2) {
						Mensajes('Hora inicial no puede ser Mayor el mismo dia','error','');
						$scope.params.hora1=$scope.horaInicial='';
						return
					}	
				}
			}
		}else if (parm=='HFinal') {
			if ($scope.params.hora1!=undefined) {
				if ($scope.params.fecha2==undefined || $scope.params.fecha1==undefined) {
					Mensajes('Seleccionar Fechas Primero','error','');
					$scope.horaFinal='';
					return
				}
				$scope.params.fecha1=$scope.selectedDate($scope.params.fecha1)
				$scope.params.fecha2=$scope.selectedDate($scope.params.fecha2)
				$scope.params.fecha1=$scope.params.fecha1.replace('-','')
				$scope.params.fecha2=$scope.params.fecha2.replace('-','')
				$scope.params.fecha2=$scope.params.fecha2.replace('-','')
				$scope.params.fecha1=$scope.params.fecha1.replace('-','')
				if ($scope.params.fecha1==$scope.params.fecha2) {
					$scope.params.hora1=$scope.getHour($scope.params.hora1);
					$scope.params.hora2=$scope.getHour($scope.params.hora2);
					$scope.params.hora2=$scope.params.hora2.replace(':','')
					$scope.params.hora1=$scope.params.hora1.replace(':','')
					if ($scope.params.hora1>$scope.params.hora2) {
						Mensajes('Hora Final no puede ser menor  el mismo dia','error','');
						$scope.params.hora1=$scope.horaFinal='';
					}	
				}
				
			}
		}
	}

	$scope.ActualizarActividad=function(){
		ProcesadoShow();
		var watchID = navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
        function onSuccess(position)
        {
        	if ($scope.fechaInicial==undefined || $scope.fechaInicial==null || $scope.fechaInicial==NaN ||  $scope.fechaInicial=="") 
        	{
        		ProcesadoHiden();
        		Mensajes('Llenar Toda la informacion','error','');
        		return;
        	}
        	if ($scope.horaInicial==undefined || $scope.horaInicial==null || $scope.horaInicial==NaN ||  $scope.horaInicial=="") 
        	{
        		ProcesadoHiden();
        		Mensajes('Llenar Toda la informacion','error','');
        		return;
        	}
        	if ($scope.fechaFinal==undefined || $scope.fechaFinal==null || $scope.fechaFinal==NaN ||  $scope.fechaFinal=="") 
        	{
        		ProcesadoHiden();
        		Mensajes('Llenar Toda la informacion','error','');
        		return;
        	}
        	if ($scope.horaFinal==undefined || $scope.horaFinal==null || $scope.horaFinal==NaN ||  $scope.horaFinal=="") 
        	{
        		ProcesadoHiden();
        		Mensajes('Llenar Toda la informacion','error','');
        		return;
        	}
        	var terceroN='';
    		try
    		{
    			terceroN=$scope.terceroActividad.razonsocial
    		}
    		catch(err)
    		{
    			terceroN='';
    		}
        	var FechaI=$scope.selectedDate($scope.fechaInicial)+' '+$scope.getHour($scope.horaInicial) ;
			var FechaF=$scope.selectedDate($scope.fechaFinal)+' '+$scope.getHour($scope.horaFinal) ;
        	CRUD.Updatedynamic("update crm_actividades set relacionado_a='"+terceroN+"',fecha_inicial='"+FechaI+"',fecha_final='"+FechaF+"', rowid_estado='"+$scope.estado+"',sincronizado='false' where rowid="+$scope.actividad.rowid+"");	
			$scope.localizacionRegistro=[];
			$scope.Latitude=position.coords.latitude;
			$scope.Longitud= position.coords.longitude;
			$scope.localizacionRegistro.latitud=$scope.Latitude;
			$scope.localizacionRegistro.descripcion='Modificacion';
			$scope.localizacionRegistro.longitud=$scope.Longitud;
			$scope.localizacionRegistro.rowid_actividad=$scope.actividad.rowid;
			$scope.localizacionRegistro.estadoID=$scope.estado;
			$scope.localizacionRegistro.fechacreacion=$scope.CurrentDate();
			CRUD.insert('crm_localizacion',$scope.localizacionRegistro)
			$scope.Latitude='';
			$scope.Longitud='';
			
			$('#CerrarModalV').click();
			window.setTimeout(function(){
				$scope.RefrescarVista();	
				ProcesadoHiden();
			},1000)
			
        }
        function onError(error)
        {
        	ProcesadoHiden();
        	alert("Por favor habilitar la Ubicacion, Verificar Conexion a Internet!");
        }
	}
	$scope.estado="";
	$scope.ConsultarDia=function(day){
		var Day=new Date(day);
		var YearS=Day.getFullYear();
		var MonthS=Day.getMonth()+1;
		if (MonthS<10) {MonthS='0'+MonthS}
		var DayS=Day.getDate();
		if (DayS<10) {DayS='0'+DayS}
		
		day=YearS+''+MonthS+''+DayS;
		$scope.actividadesDia=[];
		//var query="select  tema,descripcion,fecha_inicial,fecha_final ,replace(fecha_inicial,'-','') as fecha_inicialF,replace(fecha_final,'-','') as fecha_finalF from crm_actividades ";
		CRUD.select("select*from vw_actividades_dia",function(elem){
			var f1 = elem.fecha_inicialF.slice(0,8);
			var f2 = elem.fecha_finalF.slice(0,8);
			f1.replace(' ','');
			f2.replace(' ','');
			if (f1<=day) {
				if (f2>=day) {
					if (elem.canal=='null') 
					{
						elem.condicion=false;
					}
					$scope.actividadesDia.push(elem);
				}
			}
		})
	}
}]);

