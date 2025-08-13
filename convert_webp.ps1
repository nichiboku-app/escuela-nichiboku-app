# convert_webp.ps1
# Convierte todas las imágenes PNG/JPG de assets a formato WebP con calidad 85
$calidad = 85
$carpetaAssets = "assets"

Get-ChildItem -Path $carpetaAssets -Recurse -Include *.png, *.jpg | ForEach-Object {
    $original = $_.FullName
    $nuevo = [System.IO.Path]::ChangeExtension($original, ".webp")

    Write-Host "Convirtiendo: $original -> $nuevo"
    cwebp "$original" -q $calidad -o "$nuevo"
}

Write-Host "✅ Conversión completada. Todas las imágenes WebP están listas."
