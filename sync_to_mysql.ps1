# ==============================================================================
# GHOST IMPORTS - Sincronizador Automático con MySQL Workbench
# Ejecuta consultas de usuarios y pedidos directamente en MySQL Server 8.0
# ==============================================================================

param(
    [string]$SqlStatement = ""
)

$mysqlExe = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$user = "root"
$pass = "Ruben2010#"
$db = "ghost_imports"

if (-not (Test-Path $mysqlExe)) {
    Write-Error "No se encontro mysql.exe en $mysqlExe"
    exit 1
}

if ($SqlStatement -ne "") {
    & $mysqlExe -u $user "-p$pass" $db -e "$SqlStatement"
} else {
    & $mysqlExe -u $user "-p$pass" $db -e "SELECT * FROM vista_pedidos_clientes; SELECT * FROM vista_usuarios_registrados;"
}
