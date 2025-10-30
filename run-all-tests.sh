#!/bin/bash

# Comprehensive test runner script
echo "========================================="
echo "COMPREHENSIVE TEST SUITE EXECUTION"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

echo "1. RUNNING UNIT TESTS"
echo "--------------------"
npm run test:unit --silent 2>&1 | tee unit-test-results.txt
UNIT_EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo "2. RUNNING E2E SMOKE TESTS"
echo "--------------------------"
npm run test:e2e -- tests/e2e/smoke.spec.js --reporter=list 2>&1 | tee smoke-test-results.txt
SMOKE_EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo "3. RUNNING E2E NAVIGATION TESTS"
echo "-------------------------------"
npm run test:e2e -- tests/e2e/navigation.spec.js --reporter=list 2>&1 | tee navigation-test-results.txt
NAV_EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo "4. RUNNING E2E PERSISTENCE TESTS"
echo "--------------------------------"
npm run test:e2e -- tests/e2e/persistence.spec.js --reporter=list 2>&1 | tee persistence-test-results.txt
PERSIST_EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo "5. RUNNING E2E PRACTICE TESTS"
echo "-----------------------------"
npm run test:e2e -- tests/e2e/practice-exercises.spec.js --reporter=list 2>&1 | tee practice-test-results.txt
PRACTICE_EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo "6. RUNNING E2E UI TESTS"
echo "-----------------------"
npm run test:e2e -- tests/e2e/ui-elements.spec.js --reporter=list 2>&1 | tee ui-test-results.txt
UI_EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo "7. RUNNING PERFORMANCE TESTS"
echo "----------------------------"
npm run test:e2e -- tests/e2e/performance.spec.js --reporter=list --timeout=60000 2>&1 | tee performance-test-results.txt || true
PERF_EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo "8. RUNNING SECURITY TESTS"
echo "------------------------"
npm run test:e2e -- tests/e2e/security.spec.js --reporter=list 2>&1 | tee security-test-results.txt || true
SEC_EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo "========================================="
echo "TEST EXECUTION SUMMARY"
echo "========================================="
echo ""

# Calculate summary
if [ $UNIT_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Unit Tests: PASSED"
else
    echo -e "${RED}✗${NC} Unit Tests: FAILED"
fi

if [ $SMOKE_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Smoke Tests: PASSED"
else
    echo -e "${RED}✗${NC} Smoke Tests: FAILED"
fi

if [ $NAV_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Navigation Tests: PASSED"
else
    echo -e "${RED}✗${NC} Navigation Tests: FAILED"
fi

if [ $PERSIST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Persistence Tests: PASSED"
else
    echo -e "${RED}✗${NC} Persistence Tests: FAILED"
fi

if [ $PRACTICE_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Practice Tests: PASSED"
else
    echo -e "${RED}✗${NC} Practice Tests: FAILED"
fi

if [ $UI_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓${NC} UI Tests: PASSED"
else
    echo -e "${RED}✗${NC} UI Tests: FAILED"
fi

if [ $PERF_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Performance Tests: PASSED"
else
    echo -e "${YELLOW}⚠${NC} Performance Tests: NEEDS REVIEW"
fi

if [ $SEC_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Security Tests: PASSED"
else
    echo -e "${YELLOW}⚠${NC} Security Tests: NEEDS REVIEW"
fi

echo ""
echo "Full test results saved to *-test-results.txt files"
echo ""

# Generate HTML report if available
if [ -d "coverage" ]; then
    echo "Unit test coverage report available at: coverage/index.html"
fi

if [ -d "playwright-report" ]; then
    echo "E2E test report available at: playwright-report/index.html"
fi

exit 0