var ENTIDAD_PEDIDOS='PEDIDOS';
var ENTIDAD_PEDIDOS_DETALLE='PEDIDOS_DETALLE';
var ENTIDAD_TERCEROS='TERCEROS';
var ENTIDAD_SUCURSALES='SUCURSALES';
var ENTIDAD_PUNTOS_ENVIO='PUNTOS_ENVIO';
var ENTIDAD_ITEMS='ITEMS';
var ENTIDAD_MAESTROS='MAESTROS';
var ENTIDAD_MODULOS_CONFIG='MODULOS_CONFIG';
var ENTIDAD_PARAMETROS='PARAMETROS';
var ENTIDAD_OPCIONES_MENU='OPCIONES_MENU';
var ENTIDAD_METACLASS='METACLASS';
var ENTIDAD_LOCALIZACION='LOCALIZACION';
var ENTIDAD_ITEMS_PRECIOS='ITEMS_PRECIOS';
var ENTIDAD_ACTIVIDADES='ACTIVIDADES';
var ENTIDAD_ESTADOS='ESTADOS';
var ENTIDAD_CONTACTOS='CONTACTOS';
var ENTIDAD_USUARIOS='USUARIOS';
var ENTIDAD_CANALES='CANALES';
var ENTIDAD_GRAFICA_DIARIO='GRAFICA_DIARIA';
var ENTIDAD_GRAFICA_MENSUAL='GRAFICA_MENSUAL';

var STEP_SINCRONIZACION=
    [
        ENTIDAD_GRAFICA_DIARIO,
        ENTIDAD_GRAFICA_MENSUAL,
        //                    ENTIDAD_MODULOS_CONFIG,
        //                    ENTIDAD_OPCIONES_MENU,
        //                    ENTIDAD_PARAMETROS,
        ENTIDAD_USUARIOS,
        ENTIDAD_CANALES,
        ENTIDAD_TERCEROS,
        ENTIDAD_SUCURSALES,
        ENTIDAD_MAESTROS,
        ENTIDAD_PUNTOS_ENVIO,
        ENTIDAD_CONTACTOS,
                            ENTIDAD_METACLASS,
                            ENTIDAD_LOCALIZACION,
        ENTIDAD_ITEMS,
        ENTIDAD_ITEMS_PRECIOS,
        ENTIDAD_ESTADOS,
        ENTIDAD_ACTIVIDADES,
        ENTIDAD_PEDIDOS,
        ENTIDAD_PEDIDOS_DETALLE
        
];

var STEP_SUBIRDATOS=
    [
    //ENTIDAD_PEDIDOS,
    //ENTIDAD_PEDIDOS_DETALLE,
    ENTIDAD_ACTIVIDADES
    
    ];
var DATABASE='edex27';
var DATOS_ENTIDADES_SINCRONIZACION = [];
var CUR_USER=[];
var ALMACENARDATOS=[];
var ROWIDPEDIDO;
var MODULO_PEDIDO_NUEVO='PEDIDO_NUEVO';

var GRAFICA_DIA_LABEL=[];
var GRAFICA_DIA_CANTIDAD=[];
var GRAFICA_MES_LABEL=[];
var GRAFICA_MES_CANTIDAD=[];