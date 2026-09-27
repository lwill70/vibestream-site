param([int]$port = 8000)
$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$port/"
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Output "Serving $(Get-Location) on $prefix. Press Ctrl+C to stop."
while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
    } catch {
        break
    }
    $req = $context.Request
    $path = $req.Url.LocalPath.TrimStart('/')
    if ($path -eq '') { $path = 'index.html' }
    $file = Join-Path (Get-Location) $path
    if (-not (Test-Path $file)) {
        $context.Response.StatusCode = 404
        $bytes = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
        $context.Response.OutputStream.Write($bytes,0,$bytes.Length)
        $context.Response.Close()
    } else {
        try {
            $bytes = [System.IO.File]::ReadAllBytes($file)
            $ext = [System.IO.Path]::GetExtension($file).ToLowerInvariant()
            switch ($ext) {
                '.html' { $context.Response.ContentType = 'text/html; charset=utf-8' }
                '.htm'  { $context.Response.ContentType = 'text/html; charset=utf-8' }
                '.css'  { $context.Response.ContentType = 'text/css' }
                '.js'   { $context.Response.ContentType = 'application/javascript' }
                '.json' { $context.Response.ContentType = 'application/json' }
                '.png'  { $context.Response.ContentType = 'image/png' }
                '.jpg'  { $context.Response.ContentType = 'image/jpeg' }
                '.jpeg' { $context.Response.ContentType = 'image/jpeg' }
                '.gif'  { $context.Response.ContentType = 'image/gif' }
                '.svg'  { $context.Response.ContentType = 'image/svg+xml' }
                '.woff' { $context.Response.ContentType = 'font/woff' }
                '.woff2'{ $context.Response.ContentType = 'font/woff2' }
                default { $context.Response.ContentType = 'application/octet-stream' }
            }
            $context.Response.ContentLength64 = $bytes.Length
            $context.Response.OutputStream.Write($bytes,0,$bytes.Length)
            $context.Response.Close()
        } catch {
            $context.Response.StatusCode = 500
            $context.Response.Close()
        }
    }
}
$listener.Stop()
Write-Output "Server stopped."