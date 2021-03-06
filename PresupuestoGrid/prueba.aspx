﻿<%@ Page Language="VB" AutoEventWireup="false" CodeFile="prueba.aspx.vb" Inherits="prueba" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title id='Description'>This example illustrates how to enable the jQuery Grid Grouping functionality.</title>
    <link rel="stylesheet" href="jqwidgets/styles/jqx.base.css" type="text/css" />
    
    <link href="scripts/jquery-ui.min.css" rel="stylesheet" />
    <link href="scripts/jquery-ui.structure.css" rel="stylesheet" />
    <link href="scripts/jquery-ui.theme.css" rel="stylesheet" />
    <script type="text/javascript"  src="scripts/jquery-2.1.1.min.js"></script>

   

    <script type="text/javascript" src="jqwidgets/jqxcore.js"></script>
    <script type="text/javascript" src="jqwidgets/jqxbuttons.js"></script>
    <script type="text/javascript" src="jqwidgets/jqxscrollbar.js"></script>
    <script type="text/javascript" src="jqwidgets/jqxmenu.js"></script>
    <script type="text/javascript" src="jqwidgets/jqxgrid.js"></script>
    <script type="text/javascript" src="jqwidgets/jqxgrid.grouping.js"></script>
    <script type="text/javascript" src="jqwidgets/jqxgrid.selection.js"></script>
    <script type="text/javascript" src="jqwidgets/jqxdata.js"></script>
    <script type="text/javascript" src="jqwidgets/jqxgrid.edit.js"></script>
    <script type="text/javascript" src="jqwidgets/jqxgrid.aggregates.js"></script>
     <script type="text/javascript" src="jqwidgets/jqxeditor.js"></script>
      <script type="text/javascript" src="jqwidgets/jqxnumberinput.js"></script>

    <script type="text/javascript"  src="scripts/jquery-ui.min.js"></script>

    <script type="text/javascript" src="js_presupuesto/presupuesto.js"></script>
    <link href="js_presupuesto/presupuesto.css" rel="stylesheet" />


    
</head>
<body class='default'>
    

    <button id="opener">open the dialog</button>
    <div id="dialog" title="Presupuesto">

       <div id="pres_fields" class="pres_fieldset" runat="server">
           <div><strong>Título:&nbsp;</strong><input style="width:650px" class="pres_field pres_nombre" type="text" name="pres_nombre" value="" placeholder="escriba el titulo del presupuesto" /></div>
           <div>
               <strong>Cliente:&nbsp;</strong><input class="pres_field" style="width:650px" type="text"  name="pres_cliente" placeholder="escriba el nombre del cliente" /> </div>
           
           <div><strong>Fecha de creación:&nbsp;</strong>
               <span id="pres_fecha"></span> </div>
           <div><strong>Observaciones:&nbsp;</strong><br /><textarea class="pres_field"  style="width:100%"  name="pres_observaciones" placeholder="Observaciones generales" ></textarea> </div>
           <div><input name="create_button" type="button" value="Crear Nuevo Presuesto" onclick="crear_presupuesto"   /></div>
       </div>
     
        <h4>Productos:</h4>
        <div id="jqxgrid"></div>
        
    </div>
    <script>
        $("#dialog").dialog({
            autoOpen: false,
            width: 900,
            modal: true

        });
        $("#opener").click(function () {
            $("#dialog").dialog("open");
        });
   </script>

    <ul>
        <li><input type="button" id="121829" class="addproducto" title="Adicionar primero" value ="Adicionar primero" /></li>
        <li><input type="button" id="10012880" class="addproducto" title="Adicionar primero" value ="Adicionar segundo"  /></li>
        <li><input type="button" id="117753" class="addproducto" title="Adicionar primero" value ="Adicionar tercero"  /></li>
    </ul>
    <asp:HiddenField ID="presupuestoID" runat="server" ClientIDMode="Static" Value="0" />
    
    
</body>
</html>
