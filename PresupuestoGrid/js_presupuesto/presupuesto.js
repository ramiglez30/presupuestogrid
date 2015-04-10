//se carga el GRID con los datos del presupuesto, si no hay presupuesto cargado el grid se carga en blanco
$(document).ready(function () {

    if ($('#presupuestoID').attr('value') == 0) {
        //no existe presupuesto cargado.. escribir logica para hacer saber al usuario]
        alert('no hay presupuesto cargado');
    } else {
        alert('se carga el presupuesto' + $('#presupuestoID').attr('value'));
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

       
    }

   
  
});

//llenar el grid con la data 
function Llenargrid(data) {
    $('.save_changes_presupuesto').click(guardar_cambios_presupuesto);
  
    var source = {
        localdata: data,
        datatype: "json",
        datafields: [{ name: 'ID', map: 'ID' },
                     { name: 'ID_Padre', map: 'ID_Padre' },
                     { name: 'Nombre_Producto', map: 'Nombre_Producto' },
                     { name: 'Partida', map: 'Partida' },
                     {name: 'Subpartida', map:'Subpartida'},
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
                   
                    //se refresca el grid
                   
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

    var cellclass = function (row, columnfield, value) {
        if (row != null)
        {
            if (source.localdata[row].ID_Padre != 0) {
                return columnfield == 'Nombre_Producto' ? 'hijo grey' : 'color-grey';               
            } else {
                return columnfield == 'Total' ? 'precio-padre' : '';
            }
        }
       
    }

      
    var dataAdapter = new $.jqx.dataAdapter(source);
    $("#jqxgrid").jqxGrid(
    {
        width: '100%',
        showstatusbar: true,
        statusbarheight: 50,
        source: dataAdapter,
        autorowheight: true,
        autoheight: true,
        editable: true,
        showaggregates: true,
        columns: [{
            text: 'Producto', datafield: 'Nombre_Producto', width: 270, cellsalign: 'left', cellclassname: cellclass, editable: true},
            { text: 'Código', datafield: 'Cod', width: 100, cellsalign: 'left', editable: false, cellclassname: cellclass },
                         { text: 'Partida', datafield: 'Partida', hidden: true },
                          { text: 'Sub-partida', datafield: 'Subpartida', hidden: true },
                          { text: 'ID_Padre', datafield: 'ID_Padre', hidden: true },
                         
                         { text: 'Cantidad', datafield: 'Cantidad', width: 80, cellsalign: 'center', columntype: 'numberinput', groupable: true, cellclassname: cellclass, editable: true },
                         { text: 'U/M', datafield: 'Unidad_Medida', width: 100, cellsalign: 'center', editable: false, groupable: false, cellclassname: cellclass },
                         {
                             text: 'Precio', datafield: 'Precio', width: 100, cellsalign: 'right', columntype: 'numberinput', groupable: false, editable: true, cellclassname: cellclass, cellsformat: 'c2', initeditor: function (row, cellvalue, editor) {
                                 editor.jqxNumberInput({ decimalDigits: 2 });
                             }
                         },
                         {
                             text: 'Total', datafield: 'Total', width: 150, cellsalign: 'right', editable: false, groupable: false, cellclassname: cellclass, cellsformat: 'c2',
                             aggregates: [{
                                 'Total': function (aggregatedValue, currentValue, column, record) {
                                     if (record["ID_Padre"] == 0) {
                                        var totalrow = parseFloat(record['Precio']) * parseFloat(record['Cantidad']);
                                        return aggregatedValue + currentValue;
                                     }
                                     
                                 }
                             }],
                             aggregates: [{
                                 'Total': function (aggregatedValue, currentValue, column, record) {
                                     if (record['ID_Padre'] == 0) {
                                         var totalrow = parseFloat(record['Precio']) * parseFloat(record['Cantidad']);
                                         return aggregatedValue + totalrow;
                                     } else {
                                         return aggregatedValue
                                     }
                                    
                                    
                                  }
                             }],
                             aggregatesrenderer: function (aggregates, column, element) {
                                 var renderstring = "<div style='width: 100%; height: 100%; font-weight:bold; '>";
                                 $.each(aggregates, function (key, value) {
                                     renderstring += key + ': ' + value + '';
                                 });

                                 return renderstring + '</div>';
                             },
                             cellsrenderer: function (index, datafield, value, defaultvalue, column, rowdata) {
                                 total = parseFloat(rowdata.Precio) * parseFloat(rowdata.Cantidad);
                                
                                return "<div style='margin: 4px;' class='jqx-right-align'>" + dataAdapter.formatNumber(total, "c2") + "</div>";
                             }
                            
                         }],

        groupable: true,
        groups: ['Partida', 'Subpartida'],

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
                    var rowdata = $('#jqxgrid').jqxGrid('getrowdatabyid', id);
                    if (rowdata.ID_Padre == 0) {
                        if (confirm('¿Desea eliminar el producto: [' + rowdata.Nombre_Producto + '] y todos sus componentes?')) {
                            for (i = 0; i < data.length; i++) {
                                if (data[i].ID_Padre == rowdata.ID) {
                                    $("#jqxgrid").jqxGrid('deleterow', i);
                                }
                            }
                            var commit = $("#jqxgrid").jqxGrid('deleterow', id);
                        }
                        //$('#jqxgrid').jqxGrid('renderaggregates');
                        
                    } else {
                        alert('El producto: [' + rowdata.Nombre_Producto + '] no se puede eliminar porque forma parte de otro producto.');
                    }
                    
                }
            });
        }

    });

    // CONTEXT MENU
    ////////////////////////////////////
    var contextMenu = $("#Menu").jqxMenu({ width: 200, height: 30, autoOpenPopup: false, mode: 'popup' });

    $("#jqxgrid").on('contextmenu', function () {
        return false;
    });
    $("#Menu").on('itemclick', function (event) {
        var args = event.args;
        var rowindex = $("#jqxgrid").jqxGrid('getselectedrowindex');
        if ($.trim($(args).text()) == "Eliminar producto") {
            var rowdata = $('#jqxgrid').jqxGrid('getrowdatabyid', rowindex);
            if (rowdata.ID_Padre == 0) {
                if (confirm('¿Desea eliminar el producto: [' + rowdata.Nombre_Producto + '] y todos sus componentes?')) {
                    for (i = 0; i < data.length; i++) {
                        if (data[i].ID_Padre == rowdata.ID) {
                            $("#jqxgrid").jqxGrid('deleterow', i);
                        }
                    }
                    var commit = $("#jqxgrid").jqxGrid('deleterow', rowindex);
                }
                //$('#jqxgrid').jqxGrid('renderaggregates');

            } else {
                alert('El producto: [' + rowdata.Nombre_Producto + '] no se puede eliminar porque forma parte de otro producto.');
            }
        }
    });

    $("#jqxgrid").on('rowclick', function (event) {
        if (event.args.rightclick) {
            $("#jqxgrid").jqxGrid('selectrow', event.args.rowindex);
            var scrollTop = $(window).scrollTop();
            var scrollLeft = $(window).scrollLeft();
            contextMenu.jqxMenu('open', parseInt(event.args.originalEvent.clientX) + 5 + scrollLeft, parseInt(event.args.originalEvent.clientY) + 5 + scrollTop);

            return false;
        }
    });
    ////////////////////////////////////////////


    $("#jqxgrid").on('cellbeginedit', function (event) {
        if (args.datafield == "Cantidad" || args.datafield == "Precio") {
            if (source.localdata[args.rowindex].ID_Padre != 0) {
                alert('Advertencia: Recuerde que cuando modifica el precio o la cantidad de un subproducto el precio del Producto Contenedor es re-calculado.');
            }
        }
    });
    //si el usuario cambia el precio o la cantidad de un elemento hijo se recalcula el precio del padre
    $("#jqxgrid").on('cellendedit', function (event) {
        var args = event.args;
        source.localdata[args.rowindex][args.datafield] = args.value;
        if (args.datafield == "Cantidad" || args.datafield == "Precio") {
            if (source.localdata[args.rowindex].ID_Padre != 0) {
                var pos = 0;
                var total = 0;
                var data = source.localdata;
                var id_padre = source.localdata[args.rowindex].ID_Padre;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].ID == id_padre) {
                       pos = i;
                    }
                    else if (data[i].ID_Padre == id_padre) {
                        total = total + data[i].Cantidad * data[i].Precio;
                   }
               }
                data[pos].Precio = total;
                dataAdapter.updaterow(pos, data[pos], function (render) {
                    if (render) {
                        dataAdapter.dataBind();
                    }
                });
            }
        }
        
    });
}

//funcion para adicionar un producto.... se debe modificar acorde a lo que se quiera
$(document).ready(function () {
    $('.addproducto').click(function () {

        if ($('#presupuestoID').attr('value') == 0) {
            crear_presupuesto($(this).attr('id'), 'Patio', 'Fase3','', '', '', $('#HF_userid').attr('value'))
        } else {
            adicionar_producto($('#presupuestoID').attr('value'), $(this).attr('id'), 'Patio', 'Fase3');
        }

    });
});

function adicionar_producto(id_presupuesto, id_producto, partida, subpartida)
{
    $.ajax({
        url: "/presupuestos_handler.ashx", //make sure the path is correct
        cache: false,
        type: 'POST',
        data: { 'id_presupuesto': id_presupuesto, 'action': 'add', 'id_producto': '' + id_producto + '', 'partida': partida, 'subpartida':subpartida },
        success: function (response) {
            //se muestran los productos agregados
            $("#jqxgrid").jqxGrid('beginupdate');
            var parsed = $.map(response, function (el) { return el; });
            for (a in parsed) {
                var datarow = parsed[a];
                var commit = $("#jqxgrid").jqxGrid('addrow', null, datarow);
            }
           
            $("#jqxgrid").jqxGrid('endupdate');
            alert('Nuevo producto adicionado con éxito!');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            //$("#output").html(xhr.responseText);
            alert('No se pudo adicionar el producto.');

        }
    });
}

//se crea un presupuesto nuevo
function crear_presupuesto(id_producto, partida, subpartida, titulo, cliente, observaciones, userid) {
    $.ajax({
        url: "/presupuestos_edit.ashx", //make sure the path is correct
        cache: false,
        type: 'POST',
        data: { 'action':'create', 'titulo': '', 'cliente': '', 'observaciones':'', 'userid':userid },
        success: function (response) {
            //se muestran los productos agregados
            //alert('presupuesto creado:' + response.ID);
            $('#presupuestoID').val(response.ID);

            adicionar_producto(response.ID, id_producto, partida, subpartida);

            Llenargrid(response.Productos);
        },
        error: function (xhr, ajaxOptions, thrownError) {
           // se muestra mensajes de error
            //alert('hubo un error con la peticion');
        }
    });
}

//calcula el precio total de un producto compuesto sumando el precio total de todos sus hijos


//busca si tiene hijos
function Tiene_Hijos(data, id_producto) {
    var tiene = false;
    var i = 0;
    while (tiene == false && i < data.length) {
        if (data[i].ID_Padre == id_producto) {
            tiene = true;
        }
        i += 1;
    }
    return tiene;
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
