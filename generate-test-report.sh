#!/bin/bash

# Script para generar reportes de pruebas completos
# Uso: ./generate-test-report.sh

echo "🧪 Generando reporte completo de pruebas..."

# Ejecutar pruebas con cobertura
echo "📊 Ejecutando pruebas con cobertura..."
npm run test:coverage:html

# Verificar que las pruebas pasaron
if [ $? -eq 0 ]; then
    echo "✅ Todas las pruebas pasaron exitosamente!"
    
    # Mostrar estadísticas
    echo ""
    echo "📈 Estadísticas de Cobertura:"
    echo "=============================="
    npx nyc report --reporter=text-summary
    
    echo ""
    echo "📁 Archivos generados:"
    echo "- coverage/index.html (Reporte detallado de cobertura)"
    echo "- test-report.html (Reporte visual personalizado)"
    echo "- TEST_REPORT_DETAILED.md (Documentación completa)"
    
    echo ""
    echo "🌐 Para ver el reporte HTML, abre:"
    echo "file://$(pwd)/test-report.html"
    echo "file://$(pwd)/coverage/index.html"
    
else
    echo "❌ Algunas pruebas fallaron. Revisa los errores arriba."
    exit 1
fi