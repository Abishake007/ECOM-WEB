#!/bin/bash
# Script to remove secret from git history
FILE="backend/ecom-proj/src/main/resources/application.properties"
SECRET="sk_test_51TSWaI2OVQWK9oI9mPHOQvybfO2IP8ZyOFSKXUVZSRYfb9zPT7us2gBcY31esGV0vMbMXDt936lRndQGQ2J5z2NS00exDauCi1"

if [ -f "$FILE" ]; then
    sed -i.bak "s/${SECRET}/REDACTED/g" "$FILE"
    rm -f "$FILE.bak"
fi
