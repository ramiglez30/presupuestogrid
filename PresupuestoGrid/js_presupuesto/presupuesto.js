﻿//se carga el GRID con los datos del presupuesto, si no hay presupuesto cargado el grid se carga en blanco
$(document).ready(function () {

    if ($('#presupuestoID').attr('value') == 0) {
        //no existe presupuesto cargado.. escribir logica para hacer saber al usuario
    } else {
        //se cargar el presupuesto
        $.ajax({
            url: "/presupuestos_handler.ashx", 
            cache: false,
            contentType: "application/json; charset=utf-8",
            type: 'GET',
            data: { 'action': 'read', 'id_presupuesto': $('#presupuestoID').attr('value') },
            success: function (response) {
                //output the response from server
                CargarPres(response)
                Llenargrid(response.Productos);

            },
            error: function (xhr, ajaxOptions, thrownError) {
                $("#output").html(xhr.responseText);
                //$("#btnSubmitJSON").show();
            }
        });

        $("#jqxgrid").on('cellendedit', function (event) {
            var args = event.args;

        });
    }

  
});

//llenar el grid con la data 
function Llenargrid(data) {
    $('.save_changes_presupuesto').click(guardar_cambios_presupuesto);
    var source = {
        localdata: data,
        datatype: "json",
        datafields: [{ name: 'ID', map: 'ID' },
                     { name: 'Nombre_Producto', map: 'Nombre_Producto' },
                     { name: 'Partida', map: 'Partida' },
                     { name: 'Cantidad', map: 'Cantidad' },
                     {name: 'Cod', map:'Cod_Producto'},
                        { name: 'Precio', map: 'Precio' },
                        { name: 'Unidad_Medida', map: 'Unidad_Medida' },
                        { name: "Total", map: "Total" }],
        addrow: function (rowid, rowdata, position, commit) {
            // synchronize with the server - send insert command
            // call commit with parameter true if the synchronization with the server is successful 
            //and with parameter false if the synchronization failed.
            // you can pass additional argument to the commit callback which represents the new ID if it is generated from a DB.
            commit(true);
        },
        deleterow: function (rowid, commit) {
            $.ajax({
                url: "/presupuestos_handler.ashx", //make sure the path is correct
                cache: false,
                type: 'POST',
                data: { 'id_presupuesto': $('#presupuestoID').attr('value'), 'action': 'delete', 'id_producto': '' + data[rowid].ID + '' },
                success: function (response) {
                    //aqui accion de confirmacion
                    commit(true);

                },
                error: function (xhr, ajaxOptions, thrownError) {
                    //accion de error
                    commit(false);
                }
            });
        },
        updaterow: function (rowid, newdata, commit) {
            $.ajax({
                url: "/presupuestos_handler.ashx", //make sure the path is correct
                cache: false,
                type: 'POST',
                data: { 'id_presupuesto': $('#presupuestoID').attr('value'), 'action': 'update', 'producto': '' + JSON.stringify(newdata) + '' },
                success: function (response) {
                    //aqui accion de confirmacion
                    commit(true);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    //accion de error
                    commit(false);
                }
            });
           

        }

    };

    var dataAdapter = new $.jqx.dataAdapter(source);
    $("#jqxgrid").jqxGrid(
    {
        width: '100%',
        showstatusbar: true,
        statusbarheight: 50,
        source: dataAdapter,
        editable: true,
        showaggregates: true,
        columns: [{ text: 'Producto', datafield: 'Nombre_Producto', width: 270, cellsalign: 'left' },
            { text: 'Código', datafield: 'Cod', width: 100, cellsalign: 'left', editable:false },
                         { text: 'Partida', datafield: 'Partida', hidden: true },
                         { text: 'Cantidad', datafield: 'Cantidad', width: 80, cellsalign: 'center', columntype: 'numberinput', groupable: false },
                         { text: 'Unidad de medida', datafield: 'Unidad_Medida', width: 100, cellsalign: 'center', editable: false, groupable: false },
                         {
                             text: 'Precio', datafield: 'Precio', width: 100, cellsalign: 'right', columntype: 'numberinput', groupable: false, cellsformat: 'c2', initeditor: function (row, cellvalue, editor) {
                                 editor.jqxNumberInput({ decimalDigits: 2 });
                             }
                         },
                         {
                             text: 'Total', datafield: 'Total', width: 150, cellsalign: 'right', editable: false, groupable:false, cellsformat: 'c2',
                             aggregates: [{
                                 'Total': function (aggregatedValue, currentValue, column, record) {
                                     var totalrow = parseFloat(record['Precio']) * parseFloat(record['Cantidad']);
                                     return aggregatedValue + totalrow;
                                 }
                             }],
                             cellsrenderer: function (index, datafield, value, defaultvalue, column, rowdata) {
                                 var total = parseFloat(rowdata.Precio) * parseFloat(rowdata.Cantidad);
                                 return "<div style='margin: 4px;' class='jqx-right-align'>" + dataAdapter.formatNumber(total, "c2") + "</div>";
                             }
                         }],

        groupable: true,
        groups: ['Partida'],

        showgroupsheader: false,
        groupsexpandedbydefault: true,
        showtoolbar: true,
        rendertoolbar: function (toolbar) {
            var me = this;
            var container = $("<div style='margin: 5px;'></div>");
            toolbar.append(container);
            container.append('<input style="margin-left: 5px;" id="deleterowbutton" type="button" value="Eliminar producto" />');
            $("#deleterowbutton").jqxButton();
            $("#deleterowbutton").on('click', function () {
                var selectedrowindex = $("#jqxgrid").jqxGrid('getselectedrowindex');
                var rowscount = $("#jqxgrid").jqxGrid('getdatainformation').rowscount;
                if (selectedrowindex >= 0 && selectedrowindex < rowscount) {
                    var id = $("#jqxgrid").jqxGrid('getrowid', selectedrowindex);
                    var commit = $("#jqxgrid").jqxGrid('deleterow', id);
                }
            });
        }

    });

}

//funcion para adicionar un producto.... se debe modificar acorde a lo que se quiera
$(document).ready(function () {
    $('.addproducto').click(function () {

        if ($('#presupuestoID').attr('value') == 0) {
            crear_presupuesto($(this).attr('id'), 'Tarequera', '', '', '', $('#HF_userid').attr('value'))
        } else {
            adicionar_producto($('#presupuestoID').attr('value'), $(this).attr('id'), 'Tarequera');
        }

    });
});

function adicionar_producto(id_presupuesto, id_producto, partida)
{
    $.ajax({
        url: "/presupuestos_handler.ashx", //make sure the path is correct
        cache: false,
        type: 'POST',
        data: { 'id_presupuesto': id_presupuesto, 'action': 'add', 'id_producto': '' + id_producto + '', 'partida': partida },
        success: function (response) {
            //se muestran los productos agregados
            $("#jqxgrid").jqxGrid('beginupdate');
            var parsed = $.map(response, function (el) { return el; });
            for (a in parsed) {
                var datarow = parsed[a];
                var commit = $("#jqxgrid").jqxGrid('addrow', null, datarow);
            }
            $("#jqxgrid").jqxGrid('endupdate');
            alert('producto adicionado con éxito!');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            $("#output").html(xhr.responseText);

        }
    });
}

//se crea un presupuesto nuevo
function crear_presupuesto(id_producto, partida, titulo, cliente, observaciones, userid) {
    $.ajax({
        url: "/presupuestos_edit.ashx", //make sure the path is correct
        cache: false,
        type: 'POST',
        data: { 'action':'create', 'titulo': '', 'cliente': '', 'observaciones':'', 'userid':userid },
        success: function (response) {
            //se muestran los productos agregados
            //alert('presupuesto creado:' + response.ID);
            $('#presupuestoID').val(response.ID);

            adicionar_producto(response.ID, id_producto, partida)

            Llenargrid(response.Productos);
        },
        error: function (xhr, ajaxOptions, thrownError) {
           // se muestra mensajes de error
            //alert('hubo un error con la peticion');
        }
    });
}


$(document).ready(function() {
    $('.pres_field').addClass('field_withoutfocus');
    $('.pres_field').on('focus', function () {
        $('.pres_field').removeClass('field_withoutfocus');
    });
    $('.pres_field').on('blur', function () {
        $('.pres_field').addClass('field_withoutfocus');
    });
    $('.pres_field').change(function () {
        $('.save_changes_presupuesto').val('Guardar cambios');
    });
    
});

function CargarPres(pres) {
    $("input[name='pres_nombre']").val(pres.Titulo);
    $("input[name='pres_cliente']").val(pres.Cliente);
    $("#pres_fecha").html(pres.Fecha_Creacion);
    $("textarea[name='pres_observaciones']").val(pres.Observaciones);
}

var guardar_cambios_presupuesto = function () {
    $('.save_changes_presupuesto').val('Guardando cambios...');
    $.ajax({
        url: "/presupuestos_edit.ashx", //make sure the path is correct
        cache: false,
        type: 'POST',
        data: { 'action': 'update', 'id_presupuesto': $('#presupuestoID').val(), 'titulo': $("input[name='pres_nombre']").val(), 'cliente': $("input[name='pres_cliente']").val(), 'observaciones': $("textarea[name='pres_observaciones']").val(), 'userid': $('#HF_userid').attr('value') },
        success: function (response) {
            //se muestran los productos agregados
            CargarPres(response);
            $('.save_changes_presupuesto').val('Listo!');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            // se muestra mensajes de error
         }
    });
};
