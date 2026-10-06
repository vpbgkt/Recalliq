# Task 2 Verification Script

Write-Host "=== Task 2: Data Loading and Question Selection Services ===" -ForegroundColor Cyan
Write-Host ""

# Verify files exist
Write-Host "1. Verifying service files..." -ForegroundColor Yellow
$files = @(
    "src/services/dataLoader.ts",
    "src/services/questionSelector.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "   ✓ $file ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file NOT FOUND" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "2. Verifying data files..." -ForegroundColor Yellow
$questions = Get-Content "public/data/questions.json" | ConvertFrom-Json
$chapters = Get-Content "public/data/chapters.json" | ConvertFrom-Json

Write-Host "   ✓ Chapters: $($chapters.chapters.Count)" -ForegroundColor Green
Write-Host "   ✓ Questions: $($questions.questions.Count)" -ForegroundColor Green

Write-Host ""
Write-Host "3. Validating chapter question counts..." -ForegroundColor Yellow
$distribution = $questions.questions | Group-Object chapterId
$allHave10Plus = $true
foreach ($group in $distribution) {
    $status = if ($group.Count -ge 10) { "✓" } else { "✗"; $allHave10Plus = $false }
    $color = if ($group.Count -ge 10) { "Green" } else { "Red" }
    Write-Host "   $status $($group.Name): $($group.Count) questions" -ForegroundColor $color
}

Write-Host ""
Write-Host "4. Validating topic tags..." -ForegroundColor Yellow
$missingTags = $questions.questions | Where-Object { 
    $null -eq $_.topicTags -or $_.topicTags.Count -eq 0 
}
if ($missingTags.Count -eq 0) {
    Write-Host "   ✓ All $($questions.questions.Count) questions have topic tags" -ForegroundColor Green
} else {
    Write-Host "   ✗ $($missingTags.Count) questions missing topic tags" -ForegroundColor Red
}

Write-Host ""
Write-Host "5. Running TypeScript type check..." -ForegroundColor Yellow
$tscResult = npx tsc --noEmit 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ TypeScript compilation successful" -ForegroundColor Green
} else {
    Write-Host "   ✗ TypeScript errors found" -ForegroundColor Red
    Write-Host $tscResult
}

Write-Host ""
if ($allHave10Plus -and $missingTags.Count -eq 0 -and $LASTEXITCODE -eq 0) {
    Write-Host "=== ✓ All Task 2 verifications passed ===" -ForegroundColor Green
} else {
    Write-Host "=== ✗ Some verifications failed ===" -ForegroundColor Red
}
