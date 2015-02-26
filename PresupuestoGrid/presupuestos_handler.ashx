<%@ WebHandler Language="VB" Class="presupuestos_handler" %>

Imports System
Imports System.Web
Imports System.Web.Script.Serialization

Public Class presupuestos_handler : Implements IHttpHandler
    
     
      
    Public Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest
        context.Response.ContentType = "application/json"
        context.Response.ContentEncoding = Encoding.UTF8
        Dim agent As New Presupuesto_Agent
        Dim prods() As Producto_Presupuestado
        Dim pres As Presupuesto
        Dim serializer As New JavaScriptSerializer()
        Dim action As String = context.Request("action")
        
        Dim id_presupuesto As String = ""
        Dim id_producto As String = ""
        Dim partida As String = ""
        
        Select Case action
            Case "read"
                id_presupuesto = context.Request("id_presupuesto")
                pres = agent.Buscar_Presupuesto_y_Productos(id_presupuesto)
                context.Response.Write(serializer.Serialize(pres))
                Exit Sub 
            Case "add"
                id_presupuesto = context.Request("id_presupuesto")
                id_producto = context.Request("id_producto")
                partida = context.Request("partida")
                prods = agent.AdicionarPresupuesto(id_producto, id_presupuesto, partida).ToArray
            Case "update"
                id_presupuesto = context.Request("id_presupuesto")
                Dim producto As Producto_Presupuestado = serializer.Deserialize(context.Request("producto"), GetType(Producto_Presupuestado))
                If agent.ActualizarProductoPresupuestado(producto) Then
                    'enviar respuesta de confirmacion
                Else
                    'énviar respuesta de notificacion de error
                End If
            Case "delete"
                id_presupuesto = context.Request("id_presupuesto")
                id_producto = context.Request("id_producto")
                If agent.EliminarProductoPresupuestado(id_producto) Then
                Else
                    
                End If
                
                
        End Select
        
        
      
        context.Response.Write(serializer.Serialize(prods))
        
        
    End Sub
 
    Public ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property
    
    

End Class