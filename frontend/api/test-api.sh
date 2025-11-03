#!/bin/bash

# Test script for analyze-audio API endpoint
# Usage: ./api/test-api.sh

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default API URL
API_URL="${1:-http://localhost:3000/api/analyze-audio}"

echo -e "${YELLOW}Testing Audio Analysis API${NC}"
echo "API URL: $API_URL"
echo ""

# Check if the API is running
echo -e "${YELLOW}1. Checking if API is accessible...${NC}"
if curl -s -f -I "$API_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ API is reachable${NC}"
else
    echo -e "${RED}✗ API is not reachable${NC}"
    echo "Make sure to run: vercel dev"
    exit 1
fi

echo ""
echo -e "${YELLOW}2. Testing POST request without file...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "400" ]; then
    echo -e "${GREEN}✓ Correctly returned 400 for missing file${NC}"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ Expected 400, got $HTTP_CODE${NC}"
    echo "Response: $BODY"
fi

echo ""
echo -e "${YELLOW}3. Creating test audio file...${NC}"

# Create a simple test audio file (silent WAV)
TEST_FILE="/tmp/test-audio.wav"
# WAV header for a silent 1-second mono 44100Hz file
printf '\x52\x49\x46\x46\x24\xf0\x00\x00\x57\x41\x56\x45\x66\x6d\x74\x20\x10\x00\x00\x00\x01\x00\x01\x00\x44\xac\x00\x00\x88\x58\x01\x00\x02\x00\x10\x00\x64\x61\x74\x61\x00\xf0\x00\x00' > "$TEST_FILE"

if [ -f "$TEST_FILE" ]; then
    echo -e "${GREEN}✓ Test audio file created: $TEST_FILE${NC}"
else
    echo -e "${RED}✗ Failed to create test audio file${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}4. Testing POST request with audio file...${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
    -F "file=@$TEST_FILE")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ API successfully processed audio file (HTTP 200)${NC}"
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ Expected 200, got $HTTP_CODE${NC}"
    echo "Response: $BODY"
fi

echo ""
echo -e "${YELLOW}5. Cleaning up...${NC}"
rm -f "$TEST_FILE"
echo -e "${GREEN}✓ Test complete${NC}"
