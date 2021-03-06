/**
 * Created by dev10 on 1/7/2016.
 */
var app_angular = angular.module('PedidosOnline');
//CONTROLADOR DEL MOULO DE VENTAS
app_angular.controller("pedidoController",['Conexion','$scope','$location','$http','$routeParams','$timeout',function (Conexion,$scope,$location,$http,$routeParams,$timeout) {
	try
	{
		$scope.OC='';
		$scope.tituloPagina='';
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
	$scope.PedidoRowid=$routeParams.personId;
    $scope.Parametro=$routeParams.personId;
    $scope.tituloPagina='Nuevo Pedido';
    $scope.editarpedido=false;
    $scope.observaciones='';
	CRUD.select("select identificacion ||'-'|| razonsocial as  cliente,* from erp_terceros  order by razonsocial",
	function(elem)
	{
		$scope.list_tercero.push(elem);
		try
		{
			if ($scope.Parametro!=undefined   && elem.rowid==$scope.Parametro) 
			{
				$scope.terceroSelected=elem;
			}
		}
		catch(error)
		{
			alert(error + " 1");
		}
		
	});
	if ($scope.PedidoRowid==undefined) {
		$scope.PedidoRowid='';
	}
	try
	{
		if ($scope.PedidoRowid.match('p')) 
		{
			$scope.PedidoRowid=$scope.PedidoRowid.replace('p','');
		}
		else
		{
			$scope.PedidoRowid='';		
		}
	}
	catch(error)
	{
		$scope.PedidoRowid='';
		alert(error + " 2");
	}
	if ($scope.PedidoRowid.length>0) {
		$('.creado').attr("disabled","disabled") 
		
		$scope.tituloPagina='Pedido #'+$scope.PedidoRowid;
		$scope.editarpedido=true;
		CRUD.select("select pe.*,su.rowid_tercero as tercero,maestro.erp_id_maestro from t_pedidos pe inner join erp_terceros_sucursales su on pe.rowid_cliente_facturacion=su.rowid inner join erp_entidades_master  maestro  on pe.rowid_lista_precios=maestro.rowid where pe.rowid='"+$scope.PedidoRowid+"'",function(elem){
			CRUD.select("select*from t_pedidos where rowid='"+$scope.PedidoRowid+"'",function(pedidoD){
				$scope.pedidos=pedidoD;
				$scope.date=$scope.pedidos.fecha_solicitud;
				$scope.dateEntrega=$scope.pedidos.fecha_entrega;
				$scope.OC=$scope.pedidos.orden_compra;
				$scope.observaciones=$scope.pedidos.observaciones;
				document.getElementById("orden_compra").value=$scope.pedidos.orden_compra;
				document.getElementById("observaciones").value=$scope.pedidos.orden_compra;
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
				CRUD.select("select vw.*,tpd.cantidad as cantidaddetalle from vw_items_precios vw inner join  t_pedidos_detalle tpd on tpd.rowid_item=vw.rowid_item where tpd.rowid_pedido='"+$scope.PedidoRowid+"' and vw.rowid="+$scope.pedidos.rowid_lista_precios+"  ",function(detallePedido){
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
		try
		{
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
		catch(err)
		{
			alert(err);
		}
		
	}
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
		$scope.pedidos.orden_compra=$scope.OC;
		$scope.pedidos.observaciones=$scope.observaciones;
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
	}
	catch(error)
	{
		alert(error + " 4 ");
	}
}]);

app_angular.controller("PedidosController",['Conexion','$scope','$route',function (Conexion,$scope,$route) {
	$scope.validacion=false;
	$scope.pedidos = [];
	$scope.pedidoSeleccionado=[];
	$scope.detallespedido=[];
	CRUD.select('select distinct 1 mobile, pedidos.valor_impuesto,pedidos.fecha_solicitud,pedidos.sincronizado, pedidos.rowid as rowidpedido,terceros.razonsocial,sucursal.nombre_sucursal,pedidos.numpedido_erp,punto_envio.nombre_punto_envio,pedidos.valor_total,detalle.rowid_pedido,count(detalle.rowid_pedido) cantidaddetalles,sum(detalle.cantidad) as cantidadproductos from  t_pedidos pedidos inner join erp_terceros_sucursales sucursal on sucursal.rowid=pedidos.rowid_cliente_facturacion  inner join erp_terceros terceros on terceros.rowid=sucursal.rowid_tercero  left  join t_pedidos_detalle detalle on detalle.rowid_pedido=pedidos.rowid left join erp_terceros_punto_envio punto_envio on punto_envio.rowid=pedidos.id_punto_envio where sincronizado!="envio_correcto" group by  pedidos.fecha_solicitud,detalle.rowid_pedido,pedidos.rowid,terceros.razonsocial,sucursal.nombre_sucursal,punto_envio.nombre_punto_envio,pedidos.valor_total order by pedidos.rowid desc    LIMIT 50',
    	function(elem) {
    		$scope.pedidos.push(elem)
    	});
    CRUD.select('select distinct 0 mobile, pedidos.valor_impuesto,pedidos.fecha_solicitud,pedidos.sincronizado, pedidos.rowid as rowidpedido,terceros.razonsocial,sucursal.nombre_sucursal,pedidos.numpedido_erp,punto_envio.nombre_punto_envio,pedidos.valor_total,detalle.rowid_pedido,count(detalle.rowid_pedido) cantidaddetalles,sum(detalle.cantidad) as cantidadproductos from  t_pedidos_web pedidos inner join erp_terceros_sucursales sucursal on sucursal.rowid=pedidos.rowid_cliente_facturacion  inner join erp_terceros terceros on terceros.rowid=sucursal.rowid_tercero  left  join t_pedidos_detalle_web detalle on detalle.rowid_pedido=pedidos.rowid left join erp_terceros_punto_envio punto_envio on punto_envio.rowid=pedidos.id_punto_envio group by  pedidos.fecha_solicitud,detalle.rowid_pedido,pedidos.rowid,terceros.razonsocial,sucursal.nombre_sucursal,punto_envio.nombre_punto_envio,pedidos.valor_total order by pedidos.rowid desc    LIMIT 50',
    	function(elem) {
    		$scope.pedidos.push(elem)
    	});
    CRUD.select("select count(*) as cantidad",function(elem){
    	if (elem.cantidad==0) {
    		$scope.validacion=true;
    	}
    })
	$scope.ConsultarDatos=function(pedido){
		$scope.detallespedido=[];
		$scope.pedidoSeleccionado=pedido;
		if (pedido.mobile==1) {
			CRUD.select('select items.item_referencia, items.item_descripcion, detalle.cantidad, detalle.precio_unitario, detalle.valor_base,detalle.valor_total_linea,detalle.valor_impuesto from t_pedidos pedido left join t_pedidos_detalle detalle on pedido.rowid = detalle.rowid_pedido inner join erp_items items on Detalle.rowid_item = items.rowid where pedido.rowid='+pedido.rowidpedido+'',
			function(ele){$scope.detallespedido.push(ele);})	
		}
		else
		{
			CRUD.select('select items.item_referencia, items.item_descripcion, detalle.cantidad, detalle.precio_unitario, detalle.valor_base,detalle.valor_total_linea,detalle.valor_impuesto from t_pedidos_web pedido left join t_pedidos_detalle_web detalle on pedido.rowid = detalle.rowid_pedido inner join erp_items items on Detalle.rowid_item = items.rowid where pedido.rowid='+pedido.rowidpedido+'',
			function(ele){$scope.detallespedido.push(ele);})	
		}
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
      $scope.queryBuild='    select  '+
           ' t.key_user,'+
           ' t.rowid_empresa,'+
            't.id_cia,t.usuariocreacion,'+
            't.fechacreacion,'+
            't.rowid as e_rowid, '+
            't.rowid_cliente_facturacion as  e_rowid_cliente_facturacion,'+
            't.rowid_cliente_despacho as e_rowid_cliente_despacho,'+
            't.rowid_lista_precios as e_rowid_lista_precios,'+
            't.id_punto_envio as e_id_punto_envio,'+
            't.fecha_pedido as e_fecha_pedido,'+
            't.fecha_entrega as e_fecha_entrega,'+
            't.valor_base as e_valor_base,'+
            't.valor_descuento as e_valor_descuento,'+
            't.valor_impuesto as e_valor_impuesto,'+
            't.valor_total as e_valor_total,'+
            't.id_estado as e_id_estado,'+
            't.ind_estado_erp as e_ind_estado_erp,'+
            't.valor_facturado as e_valor_facturado,'+
            't.fecha_solicitud as e_fechasolicitud,'+
            't.orden_compra as e_orden_compra,'+
            't.modulo_creacion as e_modulo_creacion,'+
            't.observaciones as e_observaciones,'+
            'tpd.rowid as d_rowid,'+
            'tpd.rowid_pedido as d_rowid_pedido,'+
            'tpd.rowid_item as d_rowid_item,'+
            'tpd.linea_descripcion as d_linea_descripcion,'+
            'tpd.id_unidad as d_id_unidad,'+
            'tpd.cantidad as d_cantidad,'+
            'tpd.factor as d_factor,'+
            'tpd.cantidad_base as d_cantidad_base,'+
            'tpd.stock as d_stock,'+
            'tpd.porcen_descuento as d_porcen_descuento,'+
            'tpd.valor_base as d_valor_base,'+
            'tpd.valor_impuesto as d_valor_impuesto,'+
            'tpd.valor_total_linea as d_valor_total_linea,'+
            'tpd.item_ext1 as d_item_ext1,'+
            'tpd.rowid_item_ext as d_rowid_item_ext,'+
            'tpd.rowid_bodega as d_rowid_bodega,'+
            'tpd.precio_unitario as d_precio_unitario,'+
            'tpd.valor_descuento as d_valor_descuento'+
            ' from t_pedidos t'+
            ' inner  join  t_pedidos_detalle tpd '+
            ' on tpd.rowid_pedido=t.rowid'+
            ' where  t.rowid =  __REQUIRED  and estado_sincronizacion=0 '+
            ' order by t.rowid asc';
    $scope.confirmar=function(pedido)
    {
    	ProcesadoShow();
		$scope.SentenciaPlano=$scope.queryBuild.replace('__REQUIRED',pedido.rowidpedido);
		CRUD.selectAllinOne($scope.SentenciaPlano,function(ped){
        var rowidPedido=0;
        var contador=0;
        var  stringSentencia='';
        var NewQuery=true;
        var ultimoregistro=ped.length-1;
        var step=0;
        for (var i =0;i<ped.length;i++) {
            contador++
            if (ultimoregistro==i) {
                step=1
            }
            rowidPedido=ped[i].e_rowid
            if (NewQuery) {
                stringSentencia=" insert into s_planos_pedidos  ";
                NewQuery=false;
            }
            else{
                stringSentencia+= "   UNION   ";
            }
            stringSentencia+=  "  SELECT  "+
            //ped[i].e_rowid+

            "null,'"+ped[i].key_user+
            "','"+ped[i].rowid_empresa+
            "','"+ped[i].id_cia+
            "','"+ped[i].key_user+
            "','"+ped[i].usuariocreacion+
            "','"+ped[i].fechacreacion+
            "','"+ped[i].e_rowid+
            "','"+ped[i].e_rowid_cliente_facturacion+
            "','"+ped[i].e_rowid_cliente_despacho+
            "','"+ped[i].e_rowid_lista_precios+
            "','"+ped[i].e_id_punto_envio+
            "','"+ped[i].e_fecha_pedido+
            "','"+ped[i].e_fecha_entrega+
            "','"+ped[i].e_valor_base+
            "','"+ped[i].e_valor_descuento+
            "','"+ped[i].e_valor_impuesto+
            "','"+ped[i].e_valor_total+
            "','"+ped[i].e_id_estado+
            "','"+ped[i].e_ind_estado_erp+
            "','"+ped[i].e_valor_facturado+
            "','"+ped[i].e_fechasolicitud+
            "','"+ped[i].e_orden_compra+
            "','"+ped[i].e_modulo_creacion+
            "','"+ped[i].e_observaciones+
            "','"+ped[i].d_rowid+
            "','"+ped[i].d_rowid_pedido+
            "','"+ped[i].d_rowid_item+
            "','"+ped[i].d_linea_descripcion+
            "','"+ped[i].d_id_unidad+
            "','"+ped[i].d_cantidad+
            "','"+ped[i].d_factor+
            "','"+ped[i].d_cantidad_base+
            "','"+ped[i].d_stock+
            "','"+ped[i].d_porcen_descuento+
            "','"+ped[i].d_valor_base+
            "','"+ped[i].d_valor_impuesto+
            "','"+ped[i].d_valor_total_linea+
            "','"+ped[i].d_item_ext1+
            "','"+ped[i].d_rowid_item_ext+
            "','NULL','NULL','"+ped[i].d_rowid_bodega+
            "','NULL','NULL','NULL','NULL',0,"+step+",0,0,'"+ped[i].d_precio_unitario+"','"+ped[i].d_valor_descuento+"','"+ped.length+"' "; 
            if (contador==499) {
                CRUD.Updatedynamic(stringSentencia)
                NewQuery=true;
                stringSentencia="";
                contador=0;
            }
        }
        if (stringSentencia!='') {
            CRUD.Updatedynamic(stringSentencia)
            NewQuery=true;
        }
        CRUD.Updatedynamic("update t_pedidos set estado_sincronizacion=1,sincronizado='plano' where rowid="+pedido.rowidpedido+"");
        window.setTimeout(function(){
            ProcesadoHiden();
            $route.reload();
            Mensajes('Confirmado','success','')  
        },1000)
        
    })

    }
}]);