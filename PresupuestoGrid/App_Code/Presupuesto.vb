



Public Class Presupuesto

    Public Property ID As Integer
    Public Property ID_Usuario As Integer
    Public Property Titulo As String
    Public Property Observaciones As String
    Public Property Cliente As String
    Public Property Fecha_Creacion As DateTime

    Public Property Productos As IEnumerable(Of Producto_Presupuestado)

End Class


