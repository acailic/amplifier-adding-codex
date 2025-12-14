#!/bin/bash
# Run all integration tests for the dataset API

echo "🚀 Starting Dataset API Integration Tests"
echo "======================================"

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Run: python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment
source .venv/bin/activate

# Install dependencies if needed
pip install fastapi uvicorn pandas numpy requests >/dev/null 2>&1

# Start API server in background
echo ""
echo "1. Starting API server..."
python testing/dataset_api_server.py >server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
echo "   Waiting for server to start..."
sleep 5

# Check if server is running
if curl -s http://localhost:8000/health >/dev/null; then
    echo "   ✅ API server is running"
else
    echo "   ❌ API server failed to start"
    cat server.log
    exit 1
fi

# Run tests
echo ""
echo "2. Running API integration tests..."
python testing/test_api_integration.py
API_RESULT=$?

echo ""
echo "3. Running edge case tests..."
python testing/test_edge_cases.py
EDGE_RESULT=$?

# Stop server
echo ""
echo "4. Stopping API server..."
kill $SERVER_PID 2>/dev/null

# Summary
echo ""
echo "======================================"
echo "Test Results Summary"
echo "======================================"

if [ $API_RESULT -eq 0 ]; then
    echo "✅ API Integration Tests: PASSED"
else
    echo "❌ API Integration Tests: FAILED"
fi

if [ $EDGE_RESULT -eq 0 ]; then
    echo "✅ Edge Case Tests: PASSED"
else
    echo "❌ Edge Case Tests: FAILED"
fi

# Frontend test
echo ""
echo "5. Frontend Test:"
echo "   📂 Open testing/test_frontend_integration.html in your browser"
echo "   📂 The test will automatically check API connectivity"
echo ""

if [ $API_RESULT -eq 0 ] && [ $EDGE_RESULT -eq 0 ]; then
    echo "🎉 All tests completed successfully!"
    echo ""
    echo "Next steps:"
    echo "   1. Review the test report: testing/INTEGRATION_TEST_REPORT.md"
    echo "   2. Open the frontend test in your browser"
    echo "   3. Check sample insights: testing/sample_insights_output.json"
    exit 0
else
    echo "⚠️ Some tests failed. Check the logs above for details."
    exit 1
fi