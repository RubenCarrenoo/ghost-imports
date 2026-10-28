# ==============================================================================
# GHOST IMPORTS - SERVICIO LOCAL DE ENLACE MYSQL WORKBENCH
# Conecta la tienda web directamente con MySQL Server 8.0 en tiempo real
# ==============================================================================

$port = 3307
$mysqlExe = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$user = "root"
$pass = "Ruben2010#"
$db = "ghost_imports"

function Execute-MySQLQuery([string]$sql) {
    # Guardar en archivo temporal para evitar problemas de comillas en línea de comandos
    $tempFile = [System.IO.Path]::GetTempFileName() + ".sql"
    [System.IO.File]::WriteAllText($tempFile, $sql, [System.Text.Encoding]::UTF8)
    
    $output = & $mysqlExe -u $user "-p$pass" $db -e "source $tempFile" 2>&1
    Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
    return $output
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try {
    $listener.Start()
    Write-Host "Servicio MySQL Ghost Imports iniciado en http://localhost:$port/"
} catch {
    Write-Host "El puerto $port ya está en uso o no se pudo iniciar: $($_.Exception.Message)"
    exit 0
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # CORS Headers para permitir llamadas desde el navegador
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.AddHeader("Access-Control-Allow-Headers", "Content-Type")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.Close()
            continue
        }

        $rawUrl = $request.RawUrl
        $responseString = "{`"ok`": true}"

        if ($rawUrl -eq "/status") {
            $responseString = "{`"status`": `"online`", `"database`": `"$db`", `"user`": `"$user`"}"
        }
        elseif ($rawUrl -eq "/api/register" -and $request.HttpMethod -eq "POST") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
            $body = $reader.ReadToEnd()
            $reader.Close()

            $data = $body | ConvertFrom-Json
            $nom = $data.nombre -replace "'", "''"
            $em = $data.email -replace "'", "''"
            $pw = $data.password -replace "'", "''"
            $tel = $data.telefono -replace "'", "''"
            $ciu = $data.ciudad -replace "'", "''"
            $dir = $data.direccion -replace "'", "''"
            $rol = if ($data.rol) { $data.rol } else { "cliente" }

            $sql = "INSERT INTO usuarios (nombre, email, password, telefono, ciudad, direccion, rol) VALUES ('$nom', '$em', '$pw', '$tel', '$ciu', '$dir', '$rol') ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), telefono=VALUES(telefono), ciudad=VALUES(ciudad), direccion=VALUES(direccion);"
            $res = Execute-MySQLQuery $sql
            $responseString = "{`"ok`": true, `"message`": `"Usuario guardado en MySQL Workbench`"}"
        }
        elseif ($rawUrl -eq "/api/order" -and $request.HttpMethod -eq "POST") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
            $body = $reader.ReadToEnd()
            $reader.Close()

            $order = $body | ConvertFrom-Json
            $ordId = $order.id -replace "'", "''"
            $code = $order.codigo_pedido -replace "'", "''"
            $uId = if ($order.usuario_id) { $order.usuario_id } else { "NULL" }
            $nom = $order.cliente_nombre -replace "'", "''"
            $em = $order.cliente_email -replace "'", "''"
            $tel = $order.cliente_telefono -replace "'", "''"
            $ciu = $order.cliente_ciudad -replace "'", "''"
            $dir = $order.cliente_direccion -replace "'", "''"
            $mp = $order.metodo_pago -replace "'", "''"
            $sub = [double]$order.subtotal
            $tot = [double]$order.total
            $est = if ($order.estado) { $order.estado -replace "'", "''" } else { "Pendiente de comprobante" }
            $not = if ($order.notas) { $order.notas -replace "'", "''" } else { "" }

            $sqlOrder = "INSERT INTO pedidos (id, codigo_pedido, usuario_id, cliente_nombre, cliente_email, cliente_telefono, cliente_ciudad, cliente_direccion, metodo_pago, subtotal, total, estado, notas) VALUES ('$ordId', '$code', $uId, '$nom', '$em', '$tel', '$ciu', '$dir', '$mp', $sub, $tot, '$est', '$not') ON DUPLICATE KEY UPDATE estado=VALUES(estado);`n"

            if ($order.items) {
                foreach ($item in $order.items) {
                    $pid = $item.id -replace "'", "''"
                    $pname = $item.name -replace "'", "''"
                    $psize = $item.s -replace "'", "''"
                    $pprice = [double]$item.price
                    $pqty = [int]$item.q
                    $psub = $pprice * $pqty
                    $pimg = if ($item.image) { $item.image -replace "'", "''" } else { "" }

                    $sqlOrder += "INSERT INTO pedido_detalles (pedido_id, producto_id, nombre_producto, talla, precio_unitario, cantidad, subtotal, imagen_url) VALUES ('$ordId', '$pid', '$pname', '$psize', $pprice, $pqty, $psub, '$pimg');`n"
                }
            }

            $res = Execute-MySQLQuery $sqlOrder
            $responseString = "{`"ok`": true, `"orderCode`": `"$code`", `"message`": `"Pedido registrado en MySQL Workbench`"}"
        }
        elseif ($rawUrl -eq "/api/update-status" -and $request.HttpMethod -eq "POST") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
            $body = $reader.ReadToEnd()
            $reader.Close()

            $data = $body | ConvertFrom-Json
            $oid = $data.orderId -replace "'", "''"
            $status = $data.status -replace "'", "''"
            $sql = "UPDATE pedidos SET estado = '$status' WHERE id = '$oid' OR codigo_pedido = '$oid';"
            $res = Execute-MySQLQuery $sql
            $responseString = "{`"ok`": true, `"message`": `"Estado actualizado en MySQL Workbench`"}"
        }

        $buffer = [System.Text.Encoding]::UTF8.GetBytes($responseString)
        $response.ContentLength64 = $buffer.Length
        $response.ContentType = "application/json; charset=utf-8"
        $output = $response.OutputStream
        $output.Write($buffer, 0, $buffer.Length)
        $output.Close()
    }
    catch {
        Write-Host "Error en petición: $($_.Exception.Message)"
    }
}
