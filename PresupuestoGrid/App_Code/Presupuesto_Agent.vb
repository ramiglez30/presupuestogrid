Imports Microsoft.VisualBasic
Imports MySql.Data.MySqlClient
Imports MySql.Web
Imports System.Data



Public Class Presupuesto_Agent
    Private cxn As New MySqlConnection(ConfigurationManager.ConnectionStrings.Item("MySqlConnectionString").ConnectionString)

#Region "Parsers"
    'Para convertir una fila de la tabla "Presupuesto" a un Objecto Presupuesto
    Private Function Parse_RowTo_Presupuestos(row As DataRow) As Presupuesto

        Dim item As New Presupuesto With {.Titulo = row.Item("titulo"), .Observaciones = row.Item("Observaciones"), .ID = row.Item("ID"), _
                                          .Cliente = row.Item("cliente"), .ID_Usuario = row.Item("id_usuario"), .Fecha_Creacion = (Convert.ToDateTime(row.Item("fecha_creacion"))).ToLongDateString}

        Return item
    End Function

    'Para convertir una tabla  "Presupuesto" a una lista de Objetos Presupuesto
    Private Function Parse_DatasetTo_ListofPresupuesto(ds_presupuesto As DataSet) As List(Of Presupuesto)
        Dim lista As New List(Of Presupuesto)
        If ds_presupuesto.Tables.Count > 0 Then
            For Each row As DataRow In ds_presupuesto.Tables(0).Rows
                Dim item As Presupuesto = Parse_RowTo_Presupuestos(row)
                lista.Add(item)
            Next
        End If
        Return lista
    End Function
    'Para convertir una fila de la tabla "Producto_presupuestado" a un Objecto Producto_Presupuestado
    Private Function Parse_RowBC3to_Producto(row As DataRow) As Producto_Presupuestado
        Dim item As New Producto_Presupuestado With {.ID = 0, .ID_Padre = 0, .Cod_Producto = row.Item("cod_producto"), .Nombre_Producto = row.Item("titulo_producto"), .Cod_Padre = row.Item("padre"), .ID_Presupuesto = 0, _
                                                   .Precio = row.Item("pvp"), .Unidad_Medida = row.Item("unidad"), .Carp = row("carp")}
        Return item
    End Function

    'Para convertir una fila de la tabla "Producto_presupuestado" a un Objecto Producto_Presupuestado
    Private Function Parse_Rowto_Producto(row As DataRow) As Producto_Presupuestado
        Dim item As New Producto_Presupuestado With {.ID = row.Item("id"), .ID_Padre = row.Item("id_padre"), .Cod_Producto = row.Item("cod_producto"), .Nombre_Producto = row.Item("producto"), .Cod_Padre = row.Item("cod_padre"), .ID_Presupuesto = row.Item("id_presupuesto"), .Partida = row.Item("partida"), .Subpartida = row.Item("subpartida"), _
                                                  .Cantidad = row.Item("cantidad"), .Precio = row.Item("precio"), .Unidad_Medida = row.Item("unidad")}
        Return item
    End Function

    'Para convertir una tabla  "Productos_presupuestados" a una lista de Objetos Producto_Presupuestado
    Private Function Parse_ToListOfProductos(dt_producto As DataTable) As List(Of Producto_Presupuestado)
        Dim lista As New List(Of Producto_Presupuestado)

        For Each row As DataRow In dt_producto.Rows
            Dim item As Producto_Presupuestado = Parse_Rowto_Producto(row)
            lista.Add(item)
        Next
        'Organiza_Hijos(lista)
        Return lista
    End Function

    Private Sub Organiza_Hijos(ByRef lista As List(Of Producto_Presupuestado))

        Dim i As Integer = 0
        While i < lista.Count
            Dim hijos As New List(Of Producto_Presupuestado)
            Dim j As Integer = i
            While j < lista.Count
                If lista(i).ID = lista(j).ID_Padre Then
                    hijos.Add(lista(j))
                    lista.RemoveAt(j)
                Else
                    j = j + 1
                End If

            End While
            lista(i).Hijos = hijos.ToArray
            i = i + 1
        End While


    End Sub

    Private Function Parse_BC3ToListOfProductos(dt_producto As DataTable) As List(Of Producto_Presupuestado)
        Dim lista As New List(Of Producto_Presupuestado)

        For Each row As DataRow In dt_producto.Rows
            Dim item As Producto_Presupuestado = Parse_RowBC3to_Producto(row)
            lista.Add(item)
        Next

        Return lista
    End Function

#End Region
    


    Public Function ListarPresupuestos(id_usuario As Integer) As List(Of Presupuesto)
        Dim sentencia As String = "SELECT * from presupuestos WHERE id_usuario=@ID_USUARIO;"
        Dim cmd As New MySqlCommand(sentencia)
        cmd.Connection = cxn
        cmd.Parameters.AddWithValue("@ID_USUARIO", id_usuario)
        Dim adapter As New MySqlDataAdapter(cmd)
        Dim ds_presupuestos As New DataSet
        Try

            If cxn.State <> ConnectionState.Open Then
                cxn.Open()
            End If
            cmd.Prepare()
            adapter.Fill(ds_presupuestos)
        Catch ex As Exception
            Throw ex
        Finally
            cxn.Close()
            adapter.Dispose()
            cmd.Dispose()
        End Try
        Return Parse_DatasetTo_ListofPresupuesto(ds_presupuestos)
    End Function

    Public Function ListarProductosxPresupuesto(id_presupuesto As Integer) As List(Of Producto_Presupuestado)
        Dim sentencia As String = "SELECT * from presupuestos WHERE id=@ID_PRESUPUESTO; SELECT * from productos_presupuestados WHERE id_presupuesto=@ID_PRESUPUESTO order by id;"
        Dim cmd As New MySqlCommand(sentencia)
        cmd.Connection = cxn
        cmd.Parameters.AddWithValue("@ID_PRESUPUESTO", id_presupuesto)
        Dim adapter As New MySqlDataAdapter(cmd)
        Dim ds_productos As New DataSet
        Try

            If cxn.State <> ConnectionState.Open Then

                cxn.Open()
            End If
            cmd.Prepare()
            adapter.Fill(ds_productos)
        Catch ex As Exception
            Throw ex
        Finally
            cxn.Close()
            adapter.Dispose()
            cmd.Dispose()
        End Try
        If ds_productos.Tables.Count > 1 Then
            Return Parse_ToListOfProductos(ds_productos.Tables(1))
        Else
            Return New List(Of Producto_Presupuestado)
        End If

    End Function

    Public Function Buscar_Presupuesto_y_Productos(id_presupuesto As Integer) As Presupuesto
        Dim sentencia As String = "SELECT * from presupuestos WHERE id=@ID_PRESUPUESTO; SELECT * from productos_presupuestados WHERE id_presupuesto=@ID_PRESUPUESTO order by id;"
        Dim cmd As New MySqlCommand(sentencia)
        cmd.Connection = cxn
        cmd.Parameters.AddWithValue("@ID_PRESUPUESTO", id_presupuesto)
        Dim adapter As New MySqlDataAdapter(cmd)
        Dim ds_productos As New DataSet
        Try

            If cxn.State <> ConnectionState.Open Then

                cxn.Open()
            End If
            cmd.Prepare()
            adapter.Fill(ds_productos)
        Catch ex As Exception
            Throw ex
        Finally
            cxn.Close()
            adapter.Dispose()
            cmd.Dispose()
        End Try
        Dim pres As New Presupuesto
        If ds_productos.Tables.Count > 1 Then
            If ds_productos.Tables(0).Rows.Count > 0 Then
                pres = Parse_RowTo_Presupuestos(ds_productos.Tables(0).Rows(0))
                pres.Productos = Parse_ToListOfProductos(ds_productos.Tables(1)).ToArray
            End If
        End If
        Return pres
    End Function

    'busca el producto y los hijos y los inserta en la tabla productos presupuestado
    Public Function Adicionar_Producto_To_Presupuesto(id_producto As Integer, id_presupuesto As Integer, partida As String, subpartida As String) As List(Of Producto_Presupuestado)
        Try
            Dim prod As Producto_Presupuestado = BuscarProductobyID(id_producto)



            Dim list As New List(Of Producto_Presupuestado)
            AdicionarHijos(prod, list, partida, subpartida)
            Calcular_Precio_Total(prod, list)
            InsertListProductoPresupuesto(list, id_presupuesto, partida, subpartida)

            Return list
        Catch ex As Exception
            Throw ex
        Finally

        End Try

    End Function

    Private Sub Calcular_Precio_Total(ByRef prod As Producto_Presupuestado, ByRef hijos As List(Of Producto_Presupuestado))

        Dim precio As Double = 0
        For Each producto In hijos
            precio = precio + (producto.Cantidad * producto.Precio)
        Next

        prod.Precio = precio

    End Sub

    'metodo recursoivo para buscar los hijos 
    Public Sub AdicionarHijos(ByRef prod As Producto_Presupuestado, ByRef list As List(Of Producto_Presupuestado), partida As String, subpartida As String)
        prod.Partida = partida
        prod.Subpartida = subpartida
        If prod.Cantidad = 0 Then
            prod.Cantidad = 1
        End If
        list.Add(prod)
        Dim hijos As List(Of Producto_Presupuestado) = BuscarHijos(prod.Cod_Producto)
        If hijos.Count > 0 Then
            For Each hijo In hijos
                hijo.Cod_Padre = prod.Cod_Producto
                'hijo.Nombre_Producto = hijo.Nombre_Producto.Insert(0, "--")
                AdicionarHijos(hijo, list, partida, subpartida)
            Next
        End If
    End Sub



    'insertar producto en la base de datos
    Private Function InsertListProductoPresupuesto(ByRef list As List(Of Producto_Presupuestado), id_presupuesto As Integer, partida As String, subpartida As String) As Integer
        Dim sentencia As String = "INSERT INTO productos_presupuestados(id_presupuesto, id_padre, cod_padre, cod_producto, carp, producto, partida,subpartida, cantidad, precio, unidad) VALUES (@ID_PRESUPUESTO, @ID_PADRE, @COD_PADRE, @COD_PRODUCTO, @CARP, @PRODUCTO, @PARTIDA, @SUBPARTIDA, @CANTIDAD, @PRECIO, @UNIDAD)"
        Dim counter As Integer = 0


        Dim id_padre As Integer = 0
        For i = 0 To list.Count - 1
            Dim cmd As New MySqlCommand(sentencia)
            cmd.Parameters.AddWithValue("@ID_PRESUPUESTO", id_presupuesto)
            cmd.Parameters.AddWithValue("@ID_PADRE", id_padre)
            cmd.Parameters.AddWithValue("@COD_PADRE", list(i).Cod_Padre)
            cmd.Parameters.AddWithValue("@COD_PRODUCTO", list(i).Cod_Producto)
            cmd.Parameters.AddWithValue("@CARP", list(i).Carp)
            cmd.Parameters.AddWithValue("@PRODUCTO", list(i).Nombre_Producto)
            cmd.Parameters.AddWithValue("@PARTIDA", partida)
            cmd.Parameters.AddWithValue("@SUBPARTIDA", subpartida)
            cmd.Parameters.AddWithValue("@CANTIDAD", list(i).Cantidad)
            cmd.Parameters.AddWithValue("@PRECIO", list(i).Precio)
            cmd.Parameters.AddWithValue("@UNIDAD", list(i).Unidad_Medida)
            cmd.Connection = cxn
            Try
                If cxn.State <> ConnectionState.Open Then
                    cxn.Open()
                End If
                cmd.Prepare()
                counter += cmd.ExecuteNonQuery
                If i = 0 Then
                    id_padre = cmd.LastInsertedId
                Else
                    list(i).ID_Padre = id_padre
                End If
                list(i).ID = cmd.LastInsertedId
                list(i).ID_Presupuesto = id_presupuesto





            Catch ex As Exception
                Throw ex
            Finally
                cmd.Dispose()
            End Try
        Next
        cxn.Close()

        Return counter
    End Function



    'buscar el product en BC3 y transformar en Producto_Presupuestado
    Private Function BuscarProductobyID(id_producto As Integer) As Producto_Presupuestado
        Dim list_prod As New List(Of Producto_Presupuestado)
        Dim sentencia As String = "select * from bc3_productos where id=@ID and tipo!=0;"
        Dim cmd As New MySqlCommand(sentencia)
        cmd.Parameters.AddWithValue("@ID", id_producto)
        cmd.Connection = cxn
        Dim adapter As New MySqlDataAdapter(cmd)
        Dim ds As New DataSet
        Try
            If cxn.State <> ConnectionState.Open Then
                cxn.Open()
            End If
            cmd.Prepare()
            adapter.Fill(ds)
        Catch ex As Exception
            Throw ex
        Finally
            cxn.Close()
            adapter.Dispose()
            cmd.Dispose()
        End Try
        If ds.Tables.Count > 0 Then
            If ds.Tables(0).Rows.Count > 0 Then
                Dim prod As Producto_Presupuestado = Parse_RowBC3to_Producto(ds.Tables(0).Rows(0))
                Return prod
            Else : Return Nothing
            End If
        Else : Return Nothing
        End If

    End Function
    'buscar hijos en BC3 y transformar en lista de Producto_Presupuestado
    Private Function BuscarHijos(cod_producto As String) As List(Of Producto_Presupuestado)
        Dim sentencia As String = "SELECT * from bc3_productos where padre=@COD and tipo!=0;"
        Dim cmd As New MySqlCommand(sentencia)
        cmd.Parameters.AddWithValue("@COD", cod_producto)
        cmd.Connection = cxn
        Dim adapter As New MySqlDataAdapter(cmd)
        Dim ds As New DataSet
        Try

            If cxn.State <> ConnectionState.Open Then
                cxn.Open()
            End If
            cmd.Prepare()
            adapter.Fill(ds)
        Catch ex As Exception
            Throw ex
        Finally
            cxn.Close()
            adapter.Dispose()
            cmd.Dispose()
        End Try
        If ds.Tables.Count > 0 Then
            Return Parse_BC3ToListOfProductos(ds.Tables(0))
        Else
            Return New List(Of Producto_Presupuestado)

        End If
    End Function

    Public Function ActualizarProductoPresupuestado(newdata As Producto_Presupuestado) As Boolean
        Dim sentencia As String = "UPDATE productos_presupuestados SET producto=@PRODUCTO, cantidad=@CANTIDAD, partida=@PARTIDA, subpartida=@SUBPARTIDA, precio=@PRECIO, unidad=@UNIDAD WHERE id=@ID;"
        Dim cmd As New MySqlCommand(sentencia)
        cmd.Connection = cxn
        cmd.Parameters.AddWithValue("@ID", newdata.ID)
        cmd.Parameters.AddWithValue("@PRODUCTO", newdata.Nombre_Producto)
        cmd.Parameters.AddWithValue("@CANTIDAD", newdata.Cantidad)
        cmd.Parameters.AddWithValue("@PARTIDA", newdata.Partida)
        cmd.Parameters.AddWithValue("@SUBPARTIDA", newdata.Subpartida)
        cmd.Parameters.AddWithValue("@PRECIO", newdata.Precio)
        cmd.Parameters.AddWithValue("@UNIDAD", newdata.Unidad_Medida)
        Try
            If cxn.State <> ConnectionState.Open Then
                cxn.Open()
            End If
            cmd.Prepare()
            Dim i As Integer = cmd.ExecuteNonQuery
            If i > 0 Then
                Return True
            Else
                Return False
            End If
        Catch ex As Exception
            Throw ex
        End Try
    End Function

    Public Function EliminarProductoPresupuestado(id As Integer) As Boolean
        Dim sentencia As String = "DELETE productos_presupuestados.* FROM productos_presupuestados WHERE productos_presupuestados.id=@ID"
        Dim cmd As New MySqlCommand(sentencia)
        cmd.Connection = cxn
        cmd.Parameters.AddWithValue("@ID", id)
        Try
            If cxn.State <> ConnectionState.Open Then
                cxn.Open()
            End If
            cmd.Prepare()
            Dim i As Integer = cmd.ExecuteNonQuery
            If i > 0 Then
                Return True
            Else
                Return False
            End If
        Catch ex As Exception
            Throw ex
        End Try
    End Function

    Public Function CrearPresupuesto(titulo As String, cliente As String, observaciones As String, id_usuario As Integer) As Presupuesto
        Dim sentencia As String = "INSERT into presupuestos(titulo, cliente, observaciones, id_usuario, fecha_creacion) values (@TITULO, @CLIENTE, @OBSERVACIONES, @ID_USUARIO, @FECHA_CREACION)"
        Dim cmd As New MySqlCommand(sentencia)
        cmd.Connection = cxn
        cmd.Parameters.AddWithValue("@TITULO", titulo)
        cmd.Parameters.AddWithValue("@CLIENTE", cliente)
        cmd.Parameters.AddWithValue("@OBSERVACIONES", observaciones)
        cmd.Parameters.AddWithValue("@ID_USUARIO", id_usuario)
        cmd.Parameters.AddWithValue("@FECHA_CREACION", DateTime.Now)
        If cxn.State <> ConnectionState.Open Then
            cxn.Open()
        End If
        cmd.Prepare()
        Dim i As Integer = cmd.ExecuteNonQuery
        If i > 0 Then
            Dim id_presupuesto As Integer = cmd.LastInsertedId
            Return Buscar_Presupuesto_y_Productos(id_presupuesto)
        Else
            Return New Presupuesto
        End If


    End Function

    Public Function ActualizarPresupuesto(id_presupuesto As Integer, titulo As String, cliente As String, observaciones As String) As Presupuesto
        Dim sentencia As String = "UPDATE presupuestos SET titulo=@TITULO, cliente=@CLIENTE, observaciones=@OBSERVACIONES where id=@ID_PRES ;"
        Dim cmd As New MySqlCommand(sentencia)
        cmd.Connection = cxn
        cmd.Parameters.AddWithValue("@TITULO", titulo)
        cmd.Parameters.AddWithValue("@CLIENTE", cliente)
        cmd.Parameters.AddWithValue("@OBSERVACIONES", observaciones)
        cmd.Parameters.AddWithValue("@ID_PRES", id_presupuesto)
        If cxn.State <> ConnectionState.Open Then
            cxn.Open()
        End If
        cmd.Prepare()
        Dim i As Integer = cmd.ExecuteNonQuery
        If i > 0 Then

            Return Buscar_Presupuesto_y_Productos(id_presupuesto)
        Else
            Return New Presupuesto
        End If


    End Function









End Class


