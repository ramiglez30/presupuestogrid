$(document).ready(function () {

    if ($('#presupuestoID').attr('value') == 0) {
        alert('no hay ningun presupuetso cargado');
    } else {
        alert('cargando pres:'+ $('#presupuestoID').attr('value'));
        $.ajax({
            url: "/presupuestos_handler.ashx", //make sure the path is correct
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
function Llenargrid(data) {
    var source = {
        localdata: data,
        datatype: "json",
        datafields: [{ name: 'ID', map: 'ID' },
                     { name: 'Nombre_Producto', map: 'Nombre_Producto' },
                     { name: 'Partida', map: 'Partida' },
                     { name: 'Cantidad', map: 'Cantidad' },
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
        columns: [{ text: 'Producto', datafield: 'Nombre_Producto', width: 350, cellsalign: 'left' },
                         { text: 'Partida', datafield: 'Partida', hidden: true },
                         { text: 'Cantidad', datafield: 'Cantidad', width: 100, cellsalign: 'center', columntype: 'numberinput' },
                         { text: 'Unidad de medida', datafield: 'Unidad_Medida', width: 100, cellsalign: 'center', editable: false, },
                         {
                             text: 'Precio', datafield: 'Precio', width: 100, cellsalign: 'right', columntype: 'numberinput', cellsformat: 'c2', initeditor: function (row, cellvalue, editor) {
                                 editor.jqxNumberInput({ decimalDigits: 2 });
                             }
                         },
                         {
                             text: 'Total', datafield: 'Total', width: 150, cellsalign: 'right', editable: false, cellsformat: 'c2',
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

$(document).ready(function () {
    $('.addproducto').click(function () {

        if ($('#presupuestoID').attr('value') == 0) {
            crear_presupuesto()
        } else {
            $.ajax({
                url: "/presupuestos_handler.ashx", //make sure the path is correct
                cache: false,
                type: 'POST',
                data: { 'id_presupuesto': $('#presupuestoID').attr('value'), 'action': 'add', 'id_producto': '' + $(this).attr('id') + '', 'partida': 'Garage' },
                success: function (response) {
                    //se muestran los productos agregados
                    $("#jqxgrid").jqxGrid('beginupdate');
                    var parsed = $.map(response, function (el) { return el; });
                    for (a in parsed) {
                        var datarow = parsed[a];
                        var commit = $("#jqxgrid").jqxGrid('addrow', null, datarow);
                    }
                    $("#jqxgrid").jqxGrid('endupdate');

                },
                error: function (xhr, ajaxOptions, thrownError) {
                    $("#output").html(xhr.responseText);

                }
            });
        }

    });
});

function crear_presupuesto() {
    $.ajax({
        url: "/presupuestos_edit.ashx", //make sure the path is correct
        cache: false,
        type: 'POST',
        data: { 'action':'create', 'titulo': '', 'cliente': '', 'observaciones':'' },
        success: function (response) {
            //se muestran los productos agregados
            
            $('#presupuestoID').val(response.ID);
            LLenargrid(response.Productos)
        },
        error: function (xhr, ajaxOptions, thrownError) {
           // se muestra mensajes de error

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
    
});

function CargarPres(pres) {
    $("input[name='pres_nombre']").val(pres.Titulo);
    $("input[name='pres_cliente']").val(pres.Cliente);
    $("#pres_fecha").html(pres.Fecha_Creacion);
    $("textarea[name='pres_observaciones']").val(pres.Observaciones);
}
