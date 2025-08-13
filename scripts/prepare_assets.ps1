param(
  [string]$src = "assets_src",
  [string]$out = "assets",
  [int[]]$scales = @(1,2,3),     # genera 1x,2x,3x
  [int]$quality = 85
)

# crea salida
New-Item -ItemType Directory -Force -Path $out | Out-Null

# Copia SVG tal cual (vector)
Get-ChildItem -Path $src -Recurse -Include *.svg | ForEach-Object {
  $rel = $_.FullName.Substring((Get-Item $src).FullName.Length).TrimStart('\')
  $dest = Join-Path $out $rel
  New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
  Copy-Item $_.FullName $dest -Force
}

# Raster → genera @1x,@2x,@3x → WebP
Get-ChildItem -Path $src -Recurse -Include *.png, *.jpg, *.jpeg | ForEach-Object {
  $relDir = Split-Path ($_.FullName.Substring((Get-Item $src).FullName.Length).TrimStart('\'))
  $nameNoExt = [IO.Path]::GetFileNameWithoutExtension($_.Name)
  $destDir = Join-Path $out $relDir
  New-Item -ItemType Directory -Force -Path $destDir | Out-Null

  # Leemos ancho base real para escalar
  $imgInfo = magick identify -format "%w" "`"$($_.FullName)`""
  if (-not $imgInfo) { $imgInfo = 0 }

  foreach ($s in $scales) {
    $suffix = if ($s -eq 1) { "" } else { "@${s}x" }
    $tmpPng = Join-Path $destDir "$nameNoExt$suffix.png"
    $outWebp = Join-Path $destDir "$nameNoExt$suffix.webp"

    # Resize (usa ImageMagick: 'magick')
    if ($imgInfo -gt 0) {
      $target = [int]([math]::Round($imgInfo * $s))
      magick "`"$($_.FullName)`"" -resize ${target}x $tmpPng
    } else {
      Copy-Item $_.FullName $tmpPng -Force
    }

    # PNG/JPG → WEBP (usa cwebp de libwebp)
    cwebp "`"$tmpPng`"" -q $quality -mt -o "`"$outWebp`""

    # limpia el PNG temporal
    Remove-Item $tmpPng -Force
  }
}

Write-Host "✅ Assets listos en '$out' (SVG + WEBP @1x/@2x/@3x)."
