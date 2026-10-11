@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo ========================================
echo  The Credo of Life - Runtime Builder
echo ========================================
echo.

set "OUT=js\runtime.js"

if not exist "js" (
    echo [ERROR] Folder js not found.
    goto :error
)
if not exist "data" (
    echo [ERROR] Folder data not found.
    goto :error
)

rem Clear old runtime
>"%OUT%" echo /* Generated runtime bundle for The Credo of Life v3.5.0 */
>>"%OUT%" echo /* Rebuilt from source modules by build-runtime.bat. */

for %%F in (
    "data\constants.js"
    "data\rarities.js"
    "js\state.js"
    "js\game-state.js"
    "js\character-core.js"
    "js\settings-core.js"
    "data\default-state.js"
    "js\ai.js"
    "js\storage.js"
    "js\save.js"
    "js\journal-core.js"
    "js\character.js"
    "js\buffs.js"
    "js\skills.js"
    "js\perks-core.js"
    "js\perks.js"
    "js\quest-core.js"
    "js\quests.js"
    "js\boss-core.js"
    "js\bosses.js"
    "js\inventory-core.js"
    "js\shop-core.js"
    "js\economy.js"
    "js\shop.js"

    "js\inventory.js"
    "js\equipment-core.js"
    "js\equipment.js"
    "js\crafting-core.js"
    "js\crafting.js"
    "js\achievements-core.js"
    "js\achievements.js"
    "js\journal.js"
    "js\profile.js"
    "js\settings.js"
    "js\sound.js"
    "js\notifications.js"
    "js\boot.js"
    "js\app.js"
) do (
    if not exist "%%~F" (
        echo [ERROR] Missing source: %%~F
        goto :error
    )
    echo Adding %%~F
    >>"%OUT%" echo.
    >>"%OUT%" echo /* ===== %%~F ===== */
    type "%%~F" >>"%OUT%"
    if errorlevel 1 (
        echo [ERROR] Failed to read: %%~F
        goto :error
    )
)

echo.
echo [OK] Runtime bundle rebuilt successfully.
echo [OK] Output: %OUT%
echo.
echo You can now open index.html.
echo.
pause
endlocal
exit /b 0

:error
echo.
echo [FAILED] Runtime bundle was NOT rebuilt correctly.
echo.
pause
endlocal
exit /b 1
