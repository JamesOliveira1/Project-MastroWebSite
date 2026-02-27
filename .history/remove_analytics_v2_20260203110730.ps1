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
        
        # Remove Google Tag Manager block (Comment + Script 1 + Script 2)
        # Matches: <!-- Google tag... --> followed by <script async src...></script> followed by <script>...gtag('config'...</script>
        $content = $content -replace '(?s)\s*<!-- Google tag \(gtag\.js\) -->\s*<script async src="https://www\.googletagmanager\.com/gtag/js\?id=[^"]+"></script>\s*<script>[\s\S]*?gtag\(''config'', ''[^'']+''\);\s*</script>', ''
        
        # Fallback for Google Tag if strictly structured (handling variations)
        # Just removing the script blocks if the comment isn't exactly matched or spacing differs
        $content = $content -replace '(?s)<script async src="https://www\.googletagmanager\.com/gtag/js\?id=[^"]+"></script>', ''
        $content = $content -replace '(?s)<script>\s*window\.dataLayer = window\.dataLayer \|\| \[\];[\s\S]*?gtag\(''config'', ''[^'']+''\);\s*</script>', ''
        $content = $content -replace '(?s)\s*<!-- Google tag \(gtag\.js\) -->', ''

        # Remove Ahrefs script
        $content = $content -replace '(?s)<script src="https://analytics\.ahrefs\.com/analytics\.js" data-key="[^"]+" async></script>', ''
        $content = $content -replace '(?s)\s*<!-- ahrefs site tag -->', ''
        
        Set-Content -Path $file -Value $content -Encoding UTF8
        Write-Host "Processed $file"
    } else {
        Write-Host "File not found: $file"
    }
}
