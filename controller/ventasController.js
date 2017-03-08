/**
 * Created by dev10 on 1/7/2016.
 */
var app_angular = angular.module('PedidosOnline');


//CONTROLADOR DEL MOULO DE VENTAS
app_angular.controller("pedidoController",['Conexion','$scope','$location','$http','$routeParams','$timeout',function (Conexion,$scope,$location,$http,$routeParams,$timeout) {
	$scope.ejemplovista=[];
	$scope.sessiondate=JSON.parse(window.localStorage.getItem("CUR_USER"));
	$scope.validacion=0;
	$scope.item;
	$scope.listaPrecios=[];
	$scope.pedidoDetalles=[];
	$scope.date;
	$scope.dateEntrega;
	$scope.precioItem;
	$scope.itemPrecio;
	$scope.itemsAgregadosPedido=[];
	$scope.terceroSelected=[];
    $scope.Search;
	$scope.sucursal=[];
	$scope.pedidos=[];
    $scope.list_tercero = [];
	$scope.list_Sucursales=[];
	$scope.list_precios=[];
	$scope.listprecios=[];
	$scope.list_puntoEnvio=[];
	$scope.list_items=[];
	$scope.SearchItem;
	$scope.ultimoRegistroseleccionado=[];
	$scope.ultimoRegistro=[];
	$scope.pedido_detalle=[];
	$scope.list_pedidos_detalles=[];
	$scope.valorTotal;
	$scope.sucursalDespacho=[];
	$scope.ciudadSucursal=[];
	$scope.puntoEnvio=[];
	$scope.hasfocus;
	$scope.cantidadBase;
	$scope.dataFiltro;
	$scope.SearchItem;
	$scope.searchsuc1='';
	$scope.searchsuc2='';
	$scope.filter=[];
	$scope.criterio=[];
    $scope.Parametro=$routeParams.personId;
    $scope.tituloPagina='Nuevo Pedido';
    $scope.editarpedido=false;
	CRUD.select("select identificacion ||'-'|| razonsocial as  cliente,* from erp_terceros  order by razonsocial",
	function(elem)
	{
		$scope.list_tercero.push(elem);
		if ($scope.Parametro!=undefined   && elem.rowid==$scope.Parametro) 
		{
			$scope.terceroSelected=elem;
		}
	});
	var pedido=$routeParams.personId;
	if (pedido==undefined) {
		pedido='';
	}
	if (pedido.includes('|')) {
		pedido=$scope.Parametro.split('|');
	}
	
	if (pedido.length==2) {
		$('.creado').attr("disabled","disabled") 
		
		$scope.tituloPagina='Pedido #'+pedido[1];
		$scope.editarpedido=true;
		CRUD.select("select pe.*,su.rowid_tercero as tercero,maestro.erp_id_maestro from t_pedidos pe inner join erp_terceros_sucursales su on pe.rowid_cliente_facturacion=su.rowid inner join erp_entidades_master  maestro  on pe.rowid_lista_precios=maestro.rowid where pe.rowid='"+pedido[1]+"'",function(elem){
			CRUD.select("select*from t_pedidos where rowid='"+pedido[1]+"'",function(pedidoD){
				$scope.pedidos=pedidoD;
				$scope.date=$scope.pedidos.fecha_solicitud;
				$scope.dateEntrega=$scope.pedidos.fecha_entrega;
				$("#fecha_entrega").val($scope.pedidos.fecha_entrega);
				$("#fecha_solicitud").val($scope.pedidos.fecha_solicitud);
				$scope.list_tercero=[];
				CRUD.select("select identificacion ||'-'|| razonsocial as  cliente,* from erp_terceros order by razonsocial",function(tercero){
					$scope.list_tercero.push(tercero);
					if (tercero.rowid==elem.tercero) {
						$scope.terceroSelected=tercero;
						CRUD.select("select  codigo_sucursal||'-'||nombre_sucursal as sucursal,*from erp_terceros_sucursales where rowid_tercero='"+tercero.rowid+"'",function(sucursal){
							$scope.list_Sucursales.push(sucursal)
							if ($scope.pedidos.rowid_cliente_facturacion==sucursal.rowid) {
								$scope.sucursal=sucursal;
								$scope.onChangeSucursal();
							}
							if ($scope.pedidos.rowid_cliente_despacho==sucursal.rowid) {
								$scope.sucursalDespacho=sucursal;
								$scope.onChangeSucursalDespacho();
							}
						})
					}
				})
				CRUD.select("select vw.*,tpd.cantidad as cantidaddetalle from vw_items_precios vw inner join  t_pedidos_detalle tpd on tpd.rowid_item=vw.rowid_item where tpd.rowid_pedido='"+pedido[1]+"' and vw.rowid="+$scope.pedidos.rowid_lista_precios+"  ",function(detallePedido){
					$scope.item=detallePedido;
					$scope.item.cantidad=detallePedido.cantidaddetalle;
					$scope.item.iva=$scope.item.precio*$scope.item.impuesto_porcentaje/100;
					$scope.item.valorTotal=0;
					$scope.itemsAgregadosPedido.unshift($scope.item);
					$scope.CalcularCantidadValorTotal();
				});
			});
		});
	}
	$scope.onChangeListaPrecios=function(){
		ProcesadoShow();
		if ($scope.pedidos.rowid_lista_precios==undefined) {$scope.list_items=[];return}
		$scope.list_items=[];
		var count='';
		var vista='';
		if ($scope.filter.codigoitem!=''  && $scope.filter.codigoitem!=undefined   &&  ( $scope.filter.descripcionitem==''   || $scope.filter.descripcionitem==undefined)){//  && $scope.filter.descripcionitem=='' || $scope.filter.descripcionitem==undefined ) {
			vista="select*from vw_items_precios  where  rowid="+$scope.pedidos.rowid_lista_precios+"  and    item_codigo1 like '%"+$scope.filter.codigoitem+"%'  order by rowid LIMIT 25";
		}
		else if ($scope.filter.descripcionitem!='' && $scope.filter.descripcionitem!=undefined && ( $scope.filter.codigoitem=='' || $scope.filter.codigoitem==undefined   )) {
			vista="select*from vw_items_precios  where  rowid="+$scope.pedidos.rowid_lista_precios+"  and   (   item_referencia1 like '%"+$scope.filter.descripcionitem+"%'   or descripcion like '%"+$scope.filter.descripcionitem+"%' )   order by rowid LIMIT  25";
		}
		else if ($scope.filter.descripcionitem!='' && $scope.filter.descripcionitem!=undefined && $scope.filter.codigoitem!='' && $scope.filter.codigoitem!=undefined   ) {
			vista="select*from vw_items_precios  where  rowid="+$scope.pedidos.rowid_lista_precios+"  and  item_codigo1 like '%"+$scope.filter.codigoitem+"%' and   (   item_referencia1 like '%"+$scope.filter.descripcionitem+"%'   or descripcion like '%"+$scope.filter.descripcionitem+"%' )    order by rowid LIMIT 25";
		}
		else {
			vista="select*from vw_items_precios  where  rowid="+$scope.pedidos.rowid_lista_precios+"  order by rowid LIMIT 100 ";
		}
		CRUD.selectAllinOne(vista,
		function(elem){
			$scope.list_items=elem;
			Mensajes('Busqueda Realizada','success','');
			ProcesadoHiden();
		});
	}
	$scope.onChangeFiltro=function()
	{
		if ($scope.SearchItem=='') {$scope.item=[]}
	}
	$scope.onGetFiltro=function()
	{
		$scope.onChangeListaPrecios();		
	}
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
		$scope.day=$scope.YearS+'-'+$scope.MonthS+'-'+$scope.DayS;
		return $scope.day;
	}
	$scope.SelectedDate=function(daySelected){
		$scope.day;
		$scope.DayNow=new Date(daySelected);
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
	$scope.fechasolicitud=function(){
		$scope.pedidos.fecha_solicitud=$scope.SelectedDate($scope.date);
		$scope.datenow=new Date();
		$scope.pedidos.fechacreacion=$scope.CurrentDate();
		$scope.pedidos.fecha_pedido=$scope.CurrentDate();
		var FechaCreacion=$scope.pedidos.fechacreacion.replace('-','');
		var FechaSolicitud=$scope.pedidos.fecha_solicitud.replace('-','');
		FechaCreacion=FechaCreacion.replace('-','');
    	 FechaSolicitud=FechaSolicitud.replace('-','');
    	if (FechaSolicitud<FechaCreacion) {
    		$scope.pedidos.fecha_solicitud='';
    		document.getElementById("fecha_solicitud").valueAsDate = null;
    		Mensajes('Fecha Solicitud No puede ser Menor que La Fecha creacion del pedido','error','');
    		return;
    	}
	}
	$scope.fechaentrega=function(){
		$scope.pedidos.fecha_entrega=$scope.SelectedDate($scope.dateEntrega);
		$scope.pedidos.fecha_pedido=$scope.CurrentDate();
		$scope.pedidos.fechacreacion=$scope.CurrentDate();
    	var FechaCreacion=$scope.pedidos.fechacreacion.replace('-','');
    	var FechaEntrega=$scope.pedidos.fecha_entrega.replace('-','');
    	 FechaCreacion=FechaCreacion.replace('-','');
    	 FechaEntrega=FechaEntrega.replace('-','');
    	if (FechaEntrega<FechaCreacion) {
    		Mensajes('Fecha Entrega No puede ser Menor que La Fecha creacion del pedido','error','');
    		$scope.pedidos.fecha_entrega='';
    		document.getElementById("fecha_entrega").valueAsDate = null;
    		return;
    	}
	}
	$scope.onChangeTercero=function(){
		document.getElementById("fecha_entrega").valueAsDate = null;
		document.getElementById("fecha_solicitud").valueAsDate = null;
		$scope.criterio=[];
		$scope.list_Sucursales=[];
		$scope.list_puntoEnvio=[];
		$scope.itemsAgregadosPedido=[];
		$scope.pedidoDetalles=[];
		$scope.sucursalDespacho=[];
		$scope.ciudad='';
		$scope.searchsuc1='';
		$scope.searchsuc2='';
		$scope.ciudadSucursal=[];
		$scope.list_items=[];
		$scope.filter=[];
		$scope.list_precios=[];
		CRUD.select("select  s.codigo_sucursal||'-'||s.nombre_sucursal  sucursal,s.*,e.erp_descripcion from erp_terceros_sucursales s left join erp_entidades_master e on e.id_tipo_maestro='CRITERIO_CLASIFICACION' and e.erp_id_maestro=replace(s.id_criterio_clasificacion,' ','') where s.rowid_tercero = '"+$scope.terceroSelected.rowid+"'   order by s.codigo_sucursal ",function(elem){
			if (elem.erp_descripcion!=null) {
				elem.sucursal+=" - "+elem.erp_descripcion
			}
			$scope.list_Sucursales.push(elem)})
	}
	CRUD.select("select count(*) as cantidad from erp_entidades_master ",function(elem){console.log(elem.cantidad)})
	$scope.onChangeSucursal=function(){
		if ($scope.sucursal==undefined) {$scope.pedidos.rowid_lista_precios='';$scope.list_items=[];return}
		$scope.list_precios=[];
		var consultacriterio="select*from erp_entidades_master where id_tipo_maestro='CRITERIO_CLASIFICACION' and erp_id_maestro='"+$scope.sucursal.id_criterio_clasificacion.trim()+"'"
		CRUD.select(consultacriterio,function(elem){
			$scope.criterio=elem;
		})
		CRUD.select("select count(*) as dataValidacion,erp_id_maestro||'-'||erp_descripcion as concatenado ,*from erp_entidades_master where erp_id_maestro = '"+$scope.sucursal.id_lista_precios+"'  and id_tipo_maestro='LISTA_PRECIOS' order by rowid LIMIT 1",
			
			function(elem){
				if (elem.dataValidacion==0) {
					CRUD.select("select erp_id_maestro||'-'||erp_descripcion as concatenado , * from erp_entidades_master where erp_id_maestro = '001' and id_tipo_maestro='LISTA_PRECIOS'",function(elem){
						$scope.list_precios.push(elem);$scope.listaPrecios=$scope.list_precios[0];$scope.pedidos.rowid_lista_precios=$scope.listaPrecios.rowid;
					})
				}
				else
				{
					$scope.list_precios.push(elem);$scope.listaPrecios=$scope.list_precios[0];$scope.pedidos.rowid_lista_precios=$scope.listaPrecios.rowid;
				}
				
			});
		$scope.pedidos.rowid_cliente_facturacion=$scope.sucursal.rowid;
	}

	$scope.onChangeSucursalDespacho=function()
	{
		$scope.pedidos.rowid_cliente_despacho=$scope.sucursalDespacho.rowid;
		CRUD.select("select pais.nombre||'-'||ciudad.nombre as nombre from m_localizacion  pais inner join m_localizacion ciudad  on ciudad.id_pais=pais.id_pais and pais.id_depto='' and pais.id_ciudad=''  where ciudad.id_ciudad='"+$scope.sucursalDespacho.id_ciudad+"' and ciudad.id_depto='"+$scope.sucursalDespacho.id_depto+"' and ciudad.id_pais='"+$scope.sucursalDespacho.id_pais+"'",
			function(elem){$scope.ciudadSucursal=elem});
		CRUD.select("select id_punto_envio||'-'||nombre_punto_envio as concatenado, *from erp_terceros_punto_envio where rowid_tercero = '"+$scope.terceroSelected.rowid+"'  and  codigo_sucursal = '"+$scope.sucursalDespacho.codigo_sucursal+"'   order by rowid  LIMIT 1  ",
			function(elem){$scope.list_puntoEnvio.push(elem);$scope.pedidos.id_punto_envio=elem.rowid;$scope.puntoEnvio=elem});
	}
	$scope.finalizarPedido=function(){
		if($scope.itemsAgregadosPedido.length==0)
		{
			Mensajes('Debe Seleccionar al menos un item de la lista','error','');
			return
		}
		ProcesadoShow();
		$scope.guardarCabezera();
		window.setTimeout(function(){
			$scope.guardarDetalle();
		},1000)
		Mensajes('Pedido Guardado Correctamente','success','');
		window.setTimeout(function(){
			$scope.confimar.salir=true;
			window.location.href = '#/ventas/pedidos_ingresados';
			ProcesadoHiden();
		},1500)
	}
	$scope.onChangeFiltroTercero=function(){
		if ($scope.Search=='') {$scope.terceroSelected=[];}
	}
	$scope.adicionaritem=function(){
		if($scope.item==null)
		{
			Mensajes('Seleccione un item de la lista','error','');
			return
		}
		if($scope.item.length==0)
		{
			Mensajes('Seleccione un item de la lista','error','');
			return
		}
		console.log($scope.cantidadBase)
		if($scope.cantidadBase==undefined)
		{
			Mensajes('Agrege una Cantidad al item','error','');
			return
		}
		if($scope.cantidadBase=='')
		{
			Mensajes('Agrege una Cantidad al item','error','');
			return
		}
		for (var i = 0; i < $scope.itemsAgregadosPedido.length; i++) {
			if ( $scope.itemsAgregadosPedido[i].rowid_item==$scope.item.rowid_item) {
				$scope.itemsAgregadosPedido.splice(i, 1);
			}
		}
		$scope.item.cantidad=$scope.cantidadBase;
		$scope.item.iva=$scope.item.precio*$scope.item.impuesto_porcentaje/100;
		$scope.item.valorTotal=0;
		$scope.itemsAgregadosPedido.unshift($scope.item);
		Mensajes('Item Agregado','success','');
		$scope.item=[];
		$scope.SearchItem='';
		$scope.cantidadBase='';
		$scope.CalcularCantidadValorTotal();
		$scope.filter=[];
		$scope.list_items=[];
	}
	$scope.CalcularCantidadValorTotal=function(){
		$scope.valortotal=0;
		$scope.iva=0;
		$scope.cantidad=0;
		$scope.ivatotal=0;
		$scope.precioEstandar=0;
		$scope.precioEstandar1=0;
		angular.forEach($scope.itemsAgregadosPedido,function(value,key){
			if (value.cantidad==undefined) {
				$scope.precioEstandar1+=value.precio*0;
			}else{
				$scope.precioEstandar1+=value.precio*value.cantidad;
			}
			
			$scope.precioEstandar=value.precio*value.cantidad;
			$scope.valortotal+=$scope.precioEstandar;
			$scope.cantidad+=value.cantidad;
			$scope.ivatotal+=value.iva*value.cantidad;
		})
		$scope.pedidoDetalles.neto=$scope.precioEstandar1;
		$scope.pedidoDetalles.iva=$scope.ivatotal;
		$scope.pedidoDetalles.cantidad=$scope.cantidad;
		$scope.pedidoDetalles.total=$scope.valortotal+$scope.ivatotal;
	}
	$scope.delete = function (index) {
    	$scope.itemsAgregadosPedido.splice(index, 1);
    	$scope.CalcularCantidadValorTotal();
	}
	$scope.guardarDetalle=function(){
		if ($scope.editarpedido==true) {
			CRUD.Updatedynamic("delete from t_pedidos_detalle  where rowid_pedido='"+$scope.pedidos.rowid+"'");	
		}
		CRUD.select('select max(rowid) as rowid from t_pedidos',function(elem){
		angular.forEach($scope.itemsAgregadosPedido,function(value,key){
				$scope.detalle=[];
				debugger
				$scope.detalle.rowid_item=value.rowid_item;
				if ($scope.editarpedido==true) {
					$scope.detalle.rowid_pedido=$scope.pedidos.rowid;	
				}
				else
				{
					$scope.detalle.rowid_pedido=elem.rowid;
				}
				$scope.detalle.linea_descripcion=value.descripcion;
				$scope.detalle.id_unidad=value.id_unidad;
				$scope.detalle.cantidad=value.cantidad;
				$scope.detalle.factor=0;
				$scope.detalle.cantidad_base=value.cantidad;
				$scope.detalle.stock=0;
				$scope.detalle.porcen_descuento=value.impuesto_porcentaje;
				$scope.detalle.valor_impuesto=value.iva*value.cantidad;
				$scope.detalle.valor_descuento=0;
				$scope.detalle.valor_total_linea=(value.precio*value.cantidad)+$scope.detalle.valor_impuesto;
				$scope.detalle.precio_unitario=value.precio;
				$scope.detalle.valor_base=value.precio*value.cantidad;
				$scope.detalle.usuariocreacion=$scope.sessiondate.nombre_usuario;
				$scope.detalle.fechacreacion=$scope.CurrentDate();
				CRUD.insert('t_pedidos_detalle',$scope.detalle);
			})
		//CRUD.select('SELECT  SUM (valor_base)  as total,SUM (cantidad)  as cantidad FROM  t_pedidos_detalle  where rowid_pedido='+$scope.pedidos.rowid+'',function(elem){$scope.pedidoDetalles.push(elem)});

		})
	}
	$scope.actualizarPrecio=function(){
		$scope.CalcularCantidadValorTotal();
	}
	$scope.guardarCabezera=function(){
		if ($scope.pedidos.rowid>0) {
			CRUD.Updatedynamic("delete from t_pedidos  where rowid='"+$scope.pedidos.rowid+"'");	
		}
		$scope.pedido_detalle.rowid_pedido=$scope.pedidos.rowid;
		$scope.pedidos.modulo_creacion='MOBILE';
		$scope.pedidos.valor_total=$scope.pedidoDetalles.total;
		$scope.pedidos.valor_base=$scope.pedidoDetalles.neto;
		$scope.pedidos.usuariocreacion=$scope.sessiondate.nombre_usuario;
		$scope.pedidos.rowid_empresa=4;
		$scope.pedidos.id_cia=1;
		debugger
		$scope.pedidos.fecha_solicitud=$scope.pedidos.fecha_solicitud;
		$scope.pedidos.fecha_pedido=$scope.pedidos.fecha_solicitud;
		$scope.pedidos.fecha_entrega=$scope.pedidos.fecha_entrega;
		$scope.pedidos.valor_impuesto=$scope.pedidoDetalles.iva;
		$scope.pedidos.valor_descuento=0;
		$scope.pedidos.id_estado=101;
		$scope.pedidos.ind_estado_erp=0;
		$scope.pedidos.valor_facturado=0;
		$scope.pedidos.sincronizado='false';
		$scope.pedidos.estado_sincronizacion=0;
		$scope.pedidos.key_user=$scope.sessiondate.key;
		CRUD.insert('t_pedidos',$scope.pedidos)
	}
	$scope.confimar=[];
	$scope.confimar.next=[]
	$scope.confimar.current=[]
	$scope.confimar.salir=false
	$scope.onConfirmarSalida=function(accion){
		if (accion=='salir') {
			var a='';
			if ($scope.confimar.next.params.modulo==undefined) {
				a='/';
			}
			else{
				a='/'+$scope.confimar.next.params.modulo+'/'+$scope.confimar.next.params.url;
			}
			$timeout(function () {
		        $location.path(a)
		    }, 100);
		}else if (accion=='permanecer') {
			$scope.confimar.salir=false
		}
	}
	$scope.$on('$routeChangeStart', function(event,next, current) { 
		if ($scope.confimar.salir==false) {
			$scope.confimar.next=next;
			$scope.confimar.current=current
			$scope.confimar.salir=true;
			event.preventDefault();
			$('#confirmacion').click();
		}
	});
	$scope.validacionInsert=function()
	{
		$scope.pedidos.fecha_entrega=$scope.SelectedDate($scope.dateEntrega);
		if ($scope.pedidos.rowid_cliente_facturacion =='' || $scope.pedidos.rowid_cliente_facturacion==undefined) {
			Mensajes("Verifique Que Todos lo campos esten Llenos","error","");
			return;
		}
		if ($scope.pedidos.rowid_cliente_despacho =='' || $scope.pedidos.rowid_cliente_despacho==undefined) {
			Mensajes("Verifique Que Todos lo campos esten Llenos","error","");
			return;
		}
		if ($scope.pedidos.rowid_lista_precios =='' || $scope.pedidos.rowid_lista_precios==undefined) {
			Mensajes("Verifique Que Todos lo campos esten Llenos","error","");
			return;
		}
		if ($scope.pedidos.fecha_solicitud =='' || $scope.pedidos.fecha_solicitud==undefined) {
			Mensajes("Verifique Que Todos lo campos esten Llenos","error","");
			return;
		}
		if ($scope.pedidos.fecha_entrega =='' || $scope.pedidos.fecha_entrega==undefined) {
			Mensajes("Verifique Que Todos lo campos esten Llenos","error","");
			return;
		}
		if($scope.itemsAgregadosPedido.length==0)
		{
			Mensajes('Debe Seleccionar al menos un item de la lista','error','');
			return;
		}
		$scope.finalizarPedido();
	}
	$scope.ValidacionCabezera=function()
    {
    	if ($scope.pedidos.rowid_cliente_facturacion =='' || $scope.pedidos.rowid_cliente_facturacion==undefined) {
			Mensajes("Verifique Que Todos lo campos esten Llenos","error","");
			return;
		}
		if ($scope.pedidos.rowid_cliente_despacho =='' || $scope.pedidos.rowid_cliente_despacho==undefined) {
			Mensajes("Verifique Que Todos lo campos esten Llenos","error","");
			return;
		}
		if ($scope.pedidos.rowid_lista_precios =='' || $scope.pedidos.rowid_lista_precios==undefined) {
			Mensajes("Verifique Que Todos lo campos esten Llenos","error","");
			return;
		}
		if ($scope.pedidos.fecha_solicitud =='' || $scope.pedidos.fecha_solicitud==undefined) {
			Mensajes("Verifique Que Todos lo campos esten Llenos","error","");
			return;
		}
		if ($scope.pedidos.fecha_entrega =='' || $scope.pedidos.fecha_entrega==undefined) {
			Mensajes("Verifique Que Todos lo campos esten Llenos","error","");
			return;
		}
    	$scope.CambiarTab('3','atras');
    	$scope.hasfocus=true;
    }
	$scope.modulo=MODULO_PEDIDO_NUEVO;
    angular.element('ul.tabs li').click(function () {

        var tab_id = angular.element(this).find('a').data('tab');
        angular.element('ul.tabs li').removeClass('active');
        angular.element('.tab-pane').removeClass('active');
        angular.element(this).toggleClass('active');
        angular.element("#" + tab_id).toggleClass('active');
    });
    $scope.CambiarTab = function (tab_actual, accion) {
        $scope.tab_id = null;

        if (tab_actual == '2' && accion == 'atras')
            $scope.tab_id = 'tab_1';
        else if (tab_actual == '2' && accion == 'siguiente')
            $scope.tab_id = 'tab_3';
        else if (tab_actual == '3' && accion == 'atras')
            $scope.tab_id = 'tab_2';

        angular.element('ul.tabs li').removeClass('active');
        angular.element('.tab-pane').removeClass('active');
        angular.element("ul.tabs").find("[data-tab='" + $scope.tab_id + "']").toggleClass('active');
        angular.element("#" + $scope.tab_id).toggleClass('active');
    };
    angular.element('#ui-id-1').mouseover(function (){
        angular.element('#ui-id-1').show();
    });
}]);

app_angular.controller("PedidosController",['Conexion','$scope',function (Conexion,$scope) {
	$scope.validacion=false;
	$scope.pedidos = [];
	$scope.pedidoSeleccionado=[];
	$scope.detallespedido=[];
    CRUD.select('select distinct pedidos.valor_impuesto,pedidos.fecha_solicitud,pedidos.sincronizado, pedidos.rowid as rowidpedido,terceros.razonsocial,sucursal.nombre_sucursal,pedidos.numpedido_erp,punto_envio.nombre_punto_envio,pedidos.valor_total,detalle.rowid_pedido,count(detalle.rowid_pedido) cantidaddetalles,sum(detalle.cantidad) as cantidadproductos from  t_pedidos pedidos inner join erp_terceros_sucursales sucursal on sucursal.rowid=pedidos.rowid_cliente_facturacion  inner join erp_terceros terceros on terceros.rowid=sucursal.rowid_tercero  left  join t_pedidos_detalle detalle on detalle.rowid_pedido=pedidos.rowid left join erp_terceros_punto_envio punto_envio on punto_envio.rowid=pedidos.id_punto_envio group by  pedidos.fecha_solicitud,detalle.rowid_pedido,pedidos.rowid,terceros.razonsocial,sucursal.nombre_sucursal,punto_envio.nombre_punto_envio,pedidos.valor_total order by pedidos.rowid desc    LIMIT 50',function(elem) {$scope.pedidos.push(elem)});
    CRUD.select("select count(*) as cantidad",function(elem){
    	if (elem.cantidad==0) {
    		$scope.validacion=true;
    	}
    })
	$scope.ConsultarDatos =function(pedido){
		$scope.detallespedido=[];
		$scope.pedidoSeleccionado=pedido;
		CRUD.select('select items.item_referencia, items.item_descripcion, detalle.cantidad, detalle.precio_unitario, detalle.valor_base,detalle.valor_total_linea,detalle.valor_impuesto from t_pedidos pedido left join t_pedidos_detalle detalle on pedido.rowid = detalle.rowid_pedido inner join erp_items items on Detalle.rowid_item = items.rowid where pedido.rowid='+pedido.rowidpedido+'',
		function(ele){$scope.detallespedido.push(ele);})
		
	}
	$scope.Refrescar =function(){
    	CRUD.selectAll('t_pedidos',function(elem) {$scope.pedidos.push(elem)});
		$scope.Search = '';
		
	}
	angular.element('ul.tabs li').click(function () {
        var tab_id = angular.element(this).find('a').data('tab');
        angular.element('ul.tabs li').removeClass('active');
        angular.element('.tab-pane').removeClass('active');
        angular.element(this).toggleClass('active');
        angular.element("#" + tab_id).toggleClass('active');
    });
	$scope.abrirModal=function(pedido){
		$('#pedidoOpenModal').click();
		$scope.ConsultarDatos(pedido);
	}
	$scope.CambiarTab = function (tab_actual, accion) {
        var tab_id = null;

        if (tab_actual == '1' && accion == 'siguiente')
            tab_id = 'tab_2';

        angular.element('ul.tabs li').removeClass('active');
        angular.element('.tab-pane').removeClass('active');

        angular.element("ul.tabs").find("[data-tab='" + tab_id + "']").toggleClass('active');
        angular.element("#" + tab_id).toggleClass('active');
    };
    angular.element('#ui-id-1').mouseover(function (){
        angular.element('#ui-id-1').show();
    });
}]);