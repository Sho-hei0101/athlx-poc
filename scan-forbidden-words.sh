#!/bin/bash

# Forbidden Words Scanner for AthleteXchange ATHLX
# Scans UI-facing files for compliance violations

echo "========================================="
echo "ATHLX Forbidden Words Scanner"
echo "========================================="
echo ""

# Define forbidden words (EN and ES)
FORBIDDEN_EN="investment|investor|invest|ROI|profit|yield|dividend|earnings|return|guaranteed|speculat|asset class|financial market|security|securities|shares|stock|equity|ownership|pension|retirement income"

FORBIDDEN_ES="inversión|inversor|invertir|rentabilidad|beneficio|ganancias|rendimiento|dividendo|retorno|garantizado|especulación|clase de activo|mercados financieros|valor|valores|acciones|propiedad|pensión|jubilación"

# Files to scan (UI-facing only)
echo "Scanning UI-facing files..."
echo ""

# Combine patterns
PATTERN="$FORBIDDEN_EN|$FORBIDDEN_ES"

# Scan TypeScript/JavaScript files
echo "--- Scanning .tsx and .ts files ---"
grep -rn -iE "$PATTERN" app/ components/ lib/ --include="*.tsx" --include="*.ts" 2>/dev/null

if [ $? -ne 0 ]; then
    echo "✓ No forbidden words found in .tsx/.ts files"
else
    echo "✗ WARNING: Forbidden words detected above!"
fi

echo ""

# Scan README
echo "--- Scanning README.md ---"
grep -n -iE "$PATTERN" README.md 2>/dev/null

if [ $? -ne 0 ]; then
    echo "✓ No forbidden words found in README.md"
else
    echo "✗ WARNING: Forbidden words detected above!"
fi

echo ""

# Scan markdown files in app
echo "--- Scanning other .md files ---"
find app/ -name "*.md" -exec grep -Hn -iE "$PATTERN" {} \; 2>/dev/null

if [ $? -ne 0 ]; then
    echo "✓ No forbidden words found in markdown files"
else
    echo "✗ WARNING: Forbidden words detected above!"
fi

echo ""
echo "========================================="
echo "Scan Complete"
echo "========================================="
echo ""
echo "Note: Review all WARNING items above. Safe terms:"
echo "  EN: Test Environment, Demo Credits (tATHLX), Athlete Units,"
echo "      Activity Index (pts), Acquire/Release Units,"
echo "      Post-Career Support Vault"
echo "  ES: Entorno de Prueba, Créditos Demo (tATHLX),"
echo "      Unidades del Atleta, Índice de Actividad (pts),"
echo "      Adquirir/Liberar Unidades, Fondo de Apoyo Post-Carrera"
echo ""
