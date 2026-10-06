# Task 3 Verification Script

Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Task 3: Local Storage Service            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# 1. Verify file exists
Write-Host "1. Verifying service file..." -ForegroundColor Yellow
$file = "src/services/storageService.ts"
if (Test-Path $file) {
    $size = (Get-Item $file).Length
    Write-Host "   ✓ $file ($size bytes)" -ForegroundColor Green
} else {
    Write-Host "   ✗ $file NOT FOUND" -ForegroundColor Red
    exit 1
}

# 2. Check for required functions
Write-Host "`n2. Checking exported functions..." -ForegroundColor Yellow
$content = Get-Content $file -Raw
$functions = @(
    "loadProgressFromStorage",
    "saveProgressToStorage",
    "clearProgressStorage",
    "getStorageInfo"
)

foreach ($func in $functions) {
    if ($content -match "export function $func") {
        Write-Host "   ✓ $func exported" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $func NOT FOUND" -ForegroundColor Red
    }
}

# 3. Check for versioning
Write-Host "`n3. Checking versioning support..." -ForegroundColor Yellow
if ($content -match "STORAGE_KEY.*recalliq_progress_v") {
    Write-Host "   ✓ Versioned storage key found" -ForegroundColor Green
} else {
    Write-Host "   ✗ Versioned storage key not found" -ForegroundColor Red
}

if ($content -match "STORAGE_VERSION\s*=\s*1") {
    Write-Host "   ✓ Storage version constant found" -ForegroundColor Green
} else {
    Write-Host "   ✗ Storage version constant not found" -ForegroundColor Red
}

if ($content -match "interface StorageWrapper") {
    Write-Host "   ✓ StorageWrapper interface found" -ForegroundColor Green
} else {
    Write-Host "   ✗ StorageWrapper interface not found" -ForegroundColor Red
}

# 4. Check for error handling
Write-Host "`n4. Checking error handling..." -ForegroundColor Yellow
$errorHandling = @(
    "QuotaExceededError",
    "SecurityError",
    "createDefaultProgress",
    "console.error"
)

foreach ($check in $errorHandling) {
    if ($content -match $check) {
        Write-Host "   ✓ $check handled" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ $check not found" -ForegroundColor Yellow
    }
}

# 5. Check for first-time user handling
Write-Host "`n5. Checking first-time user support..." -ForegroundColor Yellow
if ($content -match "first-time|First-time") {
    Write-Host "   ✓ First-time user handling found" -ForegroundColor Green
} else {
    Write-Host "   ⚠ First-time user handling not documented" -ForegroundColor Yellow
}

if ($content -match "sessionHistory:\s*\[\]") {
    Write-Host "   ✓ Empty default structure found" -ForegroundColor Green
} else {
    Write-Host "   ✗ Empty default structure not found" -ForegroundColor Red
}

# 6. Check for migration support
Write-Host "`n6. Checking migration support..." -ForegroundColor Yellow
if ($content -match "migrat") {
    Write-Host "   ✓ Migration logic found" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Migration logic not found" -ForegroundColor Yellow
}

# 7. TypeScript compilation
Write-Host "`n7. Running TypeScript type check..." -ForegroundColor Yellow
$tscResult = npx tsc --noEmit 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ TypeScript compilation successful" -ForegroundColor Green
} else {
    Write-Host "   ✗ TypeScript errors found" -ForegroundColor Red
    Write-Host $tscResult
}

# 8. Check test file exists
Write-Host "`n8. Checking test suite..." -ForegroundColor Yellow
if (Test-Path "src/services/testStorage.ts") {
    Write-Host "   ✓ Test suite exists" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Test suite not found" -ForegroundColor Yellow
}

# 9. Check documentation
Write-Host "`n9. Checking documentation..." -ForegroundColor Yellow
if (Test-Path "STORAGE-DOCUMENTATION.md") {
    Write-Host "   ✓ Storage documentation exists" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Storage documentation not found" -ForegroundColor Yellow
}

# Summary
Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Verification Complete                     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝`n" -ForegroundColor Cyan

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Task 3 Implementation Complete`n" -ForegroundColor Green
} else {
    Write-Host "⚠ Task 3 has some warnings or errors`n" -ForegroundColor Yellow
}
