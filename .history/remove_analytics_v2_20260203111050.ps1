$files = @(
    "c:\xampp2\htdocs\website2\portfolio\7CC.html",
    "c:\xampp2\htdocs\website2\portfolio\8XS.html",
    "c:\xampp2\htdocs\website2\portfolio\85CC.html",
    "c:\xampp2\htdocs\website2\portfolio\85XF.html",
    "c:\xampp2\htdocs\website2\portfolio\85XS.html",
    "c:\xampp2\htdocs\website2\portfolio\Cabin.html",
    "c:\xampp2\htdocs\website2\portfolio\Commuter.html",
    "c:\xampp2\htdocs\website2\portfolio\8XF.html",
    "c:\xampp2\htdocs\website2\portfolio\7XF.html",
    "c:\xampp2\htdocs\website2\portfolio\7XS.html",
    "c:\xampp2\htdocs\website2\portfolio\8CC.html",
    "c:\xampp2\htdocs\website2\orcamento.html",
    "c:\xampp2\htdocs\website2\videos.html",
    "c:\xampp2\htdocs\website2\customizacao.html",
    "c:\xampp2\htdocs\website2\index.html",
    "c:\xampp2\htdocs\website2\404.html",
    "c:\xampp2\htdocs\website2\artigos.html",
    "c:\xampp2\htdocs\website2\portfolio\TitanCC.html"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        $originalLength = $content.Length
        
        # Google Tag regex
        # Using (?s) for single-line mode (dot matches newline)
        # We construct the regex to match the specific structure found in index.html
        
        $googlePattern = '(?s)\s*<!-- Google tag \(gtag\.js\) -->\s*<script async src="https://www\.googletagmanager\.com/gtag/js\?id=G-YB1DY8YW32"></script>\s*<script>\s*window\.dataLayer = window\.dataLayer \|\| \[\];\s*function gtag\(\)\{dataLayer\.push\(arguments\);\}\s*gtag\(''js'', new Date\(\)\);\s*gtag\(''config'', ''G-YB1DY8YW32''\);\s*</script>'
        
        if ($content -match $googlePattern) {
            Write-Host "Found Google Tag in $file"
            $content = $content -replace $googlePattern, ''
        } else {
            # Try a slightly more relaxed pattern if the first one fails (e.g. different spacing)
            $googlePatternRelaxed = '(?s)\s*<!-- Google tag \(gtag\.js\) -->\s*<script async src="https://www\.googletagmanager\.com/gtag/js\?id=[^"]+"></script>\s*<script>[\s\S]*?gtag\(''config'', ''[^'']+''\);\s*</script>'
            if ($content -match $googlePatternRelaxed) {
                Write-Host "Found Google Tag (Relaxed) in $file"
                $content = $content -replace $googlePatternRelaxed, ''
            } else {
                 Write-Host "Google Tag NOT found in $file"
            }
        }

        # Ahrefs regex
        $ahrefsPattern = '(?s)\s*<!-- ahrefs site verification -->\s*<meta name="ahrefs-site-verification" content="9f1535592238bbc65a2ddecbeedc035720283eac2cfb30030f8df62033ddec0e">\s*<script src="https://analytics\.ahrefs\.com/analytics\.js" data-key="sUC8edbnu4lfND10gYrkLQ" async></script>'
        
        if ($content -match $ahrefsPattern) {
            Write-Host "Found Ahrefs Tag in $file"
            $content = $content -replace $ahrefsPattern, ''
        } else {
             Write-Host "Ahrefs Tag NOT found in $file"
        }

        if ($content.Length -ne $originalLength) {
            Set-Content -Path $file -Value $content -Encoding UTF8
            Write-Host "Updated $file"
        }
    } else {
        Write-Host "File not found: $file"
    }
}
