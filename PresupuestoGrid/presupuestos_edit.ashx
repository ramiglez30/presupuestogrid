<%@ WebHandler Language="VB" Class="presupuestos_edit" %>

Imports System
Imports System.Web
Imports System.Web.Script.Serialization


Public Class presupuestos_edit : Implements IHttpHandler, System.Web.SessionState.IRequiresSessionState
    
    Public Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest
        context.Response.ContentType = "application/json"
        context.Response.ContentEncoding = Encoding.UTF8
        Dim agent As New Presupuesto_Agent
        Dim pres As Presupuesto
        Dim serializer As New JavaScriptSerializer()
        Dim action As String = context.Request("action")
        
        Dim id_presupuesto As String = ""
      
        
        Select Case action
            Case "create"
                Try
                    Dim titulo As String = context.Request("Titulo")
                    Dim cliente As String = context.Request("Cliente")
                    Dim observaciones As String = context.Request("Observaciones")
                    pres = agent.CrearPresupuesto(titulo, cliente, observaciones, 33)
                    context.Session("ID_PRESUPUESTO") = pres.ID
                    context.Response.Write(serializer.Serialize(pres))
                Catch ex As Exception

                End Try
              
                
        End Select
        
        
      
       
        
    End Sub
 
    Public ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

End Class