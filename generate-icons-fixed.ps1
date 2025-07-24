# PowerShell script to generate PWA icons from DarkLogo.png

$sourceIcon = "polycon-icon.png"
$publicDir = "c:\Users\xenhu\OneDrive\Documents\GitHub\POLYCON\frontend\my-app\public"

Write-Host "=== PWA Icon Generation Instructions ===" -ForegroundColor Green
Write-Host ""
Write-Host "To create proper PWA icons, you need to resize your DarkLogo.png to these sizes:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Required icon sizes:"
Write-Host "- 16x16 (favicon-16x16.png)"
Write-Host "- 32x32 (favicon-32x32.png)" 
Write-Host "- 180x180 (apple-touch-icon.png)"
Write-Host "- 192x192 (android-chrome-192x192.png)"
Write-Host "- 512x512 (android-chrome-512x512.png)"
Write-Host ""
Write-Host "Options to generate these:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Online tools (RECOMMENDED):"
Write-Host "   - https://realfavicongenerator.net/"
Write-Host "   - https://www.favicon-generator.org/"
Write-Host "   - https://favicon.io/"
Write-Host ""
Write-Host "2. Using ImageMagick (if installed):"
Write-Host "   magick polycon-icon.png -resize 16x16 favicon-16x16.png"
Write-Host "   magick polycon-icon.png -resize 32x32 favicon-32x32.png"
Write-Host "   magick polycon-icon.png -resize 180x180 apple-touch-icon.png"
Write-Host "   magick polycon-icon.png -resize 192x192 android-chrome-192x192.png"
Write-Host "   magick polycon-icon.png -resize 512x512 android-chrome-512x512.png"
Write-Host ""
Write-Host "3. PowerShell commands to copy existing logo (temporary fix):"
Write-Host "   Copy-Item 'polycon-icon.png' 'android-chrome-192x192.png'"
Write-Host "   Copy-Item 'polycon-icon.png' 'android-chrome-512x512.png'"
Write-Host "   Copy-Item 'polycon-icon.png' 'apple-touch-icon.png'"
Write-Host ""
Write-Host "Current status: Your DarkLogo has been copied to: $publicDir\$sourceIcon" -ForegroundColor Green
Write-Host ""
Write-Host "After generating the icons, your PWA will show the correct logo when installed!" -ForegroundColor Green

# Quick fix - copy the logo to the required icon files
Write-Host ""
Write-Host "Applying temporary fix..." -ForegroundColor Yellow
Set-Location $publicDir

if (Test-Path $sourceIcon) {
    Copy-Item $sourceIcon "android-chrome-192x192.png" -Force
    Copy-Item $sourceIcon "android-chrome-512x512.png" -Force  
    Copy-Item $sourceIcon "apple-touch-icon.png" -Force
    Write-Host "Temporary icons created successfully!" -ForegroundColor Green
    Write-Host "The PWA should now show your logo, but for best results, resize icons properly." -ForegroundColor Yellow
} else {
    Write-Host "Source icon not found. Please ensure polycon-icon.png exists in the public folder." -ForegroundColor Red
}
