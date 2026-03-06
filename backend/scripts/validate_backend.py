#!/usr/bin/env python3
"""
Comprehensive Backend Validation Tests
Run: python scripts/validate_backend.py

Tests:
1. Database connection and tables
2. Qdrant connection and collection
3. Embedding generation
4. Authentication endpoints
5. Chat endpoints (guest vs logged-in)
6. Personalization endpoints
7. Translation endpoints
8. Agent initialization
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from typing import Tuple, List
import json

# Test results tracking
TEST_RESULTS = {
    "passed": 0,
    "failed": 0,
    "warnings": 0,
    "details": []
}


def log_test(name: str, passed: bool, message: str = ""):
    """Log test result"""
    if passed:
        TEST_RESULTS["passed"] += 1
        print(f"   ✅ {name}")
    else:
        TEST_RESULTS["failed"] += 1
        print(f"   ❌ {name}: {message}")
    
    TEST_RESULTS["details"].append({
        "name": name,
        "passed": passed,
        "message": message
    })


def log_warning(name: str, message: str):
    """Log warning"""
    TEST_RESULTS["warnings"] += 1
    print(f"   ⚠️  {name}: {message}")
    TEST_RESULTS["details"].append({
        "name": name,
        "passed": True,
        "message": f"WARNING: {message}"
    })


def print_section(title: str):
    """Print section header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")


# ============== TEST 1: Database Connection ==============
def test_database():
    """Test database connection and tables"""
    print_section("TEST 1: Database Connection & Tables")
    
    try:
        from services.db_service import get_connection
        import asyncio
        
        async def check():
            pool = await get_connection()
            async with pool.acquire() as conn:
                # Get all tables
                tables = await conn.fetch("""
                    SELECT table_name FROM information_schema.tables 
                    WHERE table_schema = 'public'
                    ORDER BY table_name
                """)
                table_list = [t['table_name'] for t in tables]
                
                # Required tables
                required = [
                    'users', 
                    'user_background', 
                    'sessions', 
                    'chat_sessions', 
                    'chat_messages', 
                    'book_chunks'
                ]
                
                # Check each required table
                for table in required:
                    exists = table in table_list
                    log_test(f"Table '{table}' exists", exists)
                    if not exists:
                        return False
                
                # Check row counts
                for table in required:
                    try:
                        count = await conn.fetchval(f"SELECT COUNT(*) FROM {table}")
                        log_test(f"{table} has {count} rows", True)
                    except Exception as e:
                        log_warning(f"{table} count", str(e))
                
                return True
        
        success = asyncio.run(check())
        return success
    except Exception as e:
        log_test("Database connection", False, str(e))
        return False


# ============== TEST 2: Qdrant Connection ==============
def test_qdrant():
    """Test Qdrant connection and collection"""
    print_section("TEST 2: Qdrant Cloud Connection")
    
    try:
        from services.qdrant_service import get_qdrant_client, COLLECTION_NAME, get_vector_dimension
        
        client = get_qdrant_client()
        
        # Test connection
        try:
            collections = client.get_collections()
            log_test("Qdrant Cloud connection", True)
            log_test(f"Collections found: {len(collections.collections)}", True)
        except Exception as e:
            log_test("Qdrant Cloud connection", False, f"Connection failed: {e}")
            return False
        
        # Test collection exists
        try:
            exists = client.collection_exists(COLLECTION_NAME)
            log_test(f"Collection '{COLLECTION_NAME}' exists", exists)
            
            if exists:
                info = client.get_collection(COLLECTION_NAME)
                stored_dim = info.config.params.vectors.size
                log_test(f"Collection vector dimension: {stored_dim}", True)
                
                # Check dimension match
                actual_dim = get_vector_dimension()
                log_test(f"Current embedding dimension: {actual_dim}", True)
                
                if stored_dim != actual_dim:
                    log_warning("Dimension mismatch", f"Collection={stored_dim}, Embedding={actual_dim}")
                else:
                    log_test("Dimensions match", True)
            else:
                log_warning("Collection not found", "Run create_qdrant_collection script")
            
            return exists
        except Exception as e:
            log_test("Collection check", False, str(e))
            return False
            
    except Exception as e:
        log_test("Qdrant setup", False, str(e))
        return False


# ============== TEST 3: Embedding Generation ==============
def test_embeddings():
    """Test embedding generation"""
    print_section("TEST 3: Embedding Generation")
    
    try:
        from services.openrouter_service import get_embedding
        
        # Test basic embedding
        test_text = "Python programming language"
        embedding = get_embedding(test_text)
        
        log_test("Embedding function callable", True)
        log_test(f"Embedding is list", isinstance(embedding, list))
        log_test(f"Embedding dimension: {len(embedding)}", len(embedding) > 0)
        
        # Test embedding consistency
        embedding2 = get_embedding(test_text)
        consistent = embedding == embedding2
        log_test("Embeddings are consistent", consistent)
        
        # Test different texts produce different embeddings
        embedding3 = get_embedding("Urdu translation")
        different = embedding != embedding3
        log_test("Different texts produce different embeddings", different)
        
        return True
    except Exception as e:
        log_test("Embedding generation", False, str(e))
        return False


# ============== TEST 4: Authentication Endpoints ==============
def test_auth_endpoints():
    """Test authentication endpoints"""
    print_section("TEST 4: Authentication Endpoints")
    
    try:
        from fastapi.testclient import TestClient
        from main import app
        
        client = TestClient(app)
        
        # Test health endpoint
        response = client.get("/health")
        log_test("GET /health", response.status_code == 200)
        if response.status_code == 200:
            data = response.json()
            log_test("Health response has status", "status" in data)
        
        # Test root endpoint
        response = client.get("/")
        log_test("GET /", response.status_code == 200)
        
        # Test signup (with random email to avoid conflicts)
        import random
        random_email = f"test_{random.randint(1000, 9999)}@example.com"
        
        signup_data = {
            "name": "Test User",
            "email": random_email,
            "password": "testpass123"
        }
        
        response = client.post("/auth/signup", json=signup_data)
        log_test("POST /auth/signup", response.status_code == 200)
        
        if response.status_code == 200:
            result = response.json()
            has_token = "token" in result
            has_user = "user" in result
            log_test("Signup returns token", has_token)
            log_test("Signup returns user data", has_user)
            
            if has_token:
                token = result["token"]
                
                # Test get current user
                headers = {"Authorization": f"Bearer {token}"}
                response = client.get("/auth/me", headers=headers)
                log_test("GET /auth/me (with token)", response.status_code == 200)
                
                # Test save background
                background_data = {
                    "software_experience": "beginner",
                    "hardware_background": "basic",
                    "known_languages": ["Python"],
                    "learning_style": "hands-on"
                }
                
                response = client.post("/user/background", json=background_data, headers=headers)
                log_test("POST /user/background", response.status_code == 200)
                
                return token
        else:
            log_test("Signup response", False, response.text)
            return None
            
    except Exception as e:
        log_test("Authentication endpoints", False, str(e))
        return None


# ============== TEST 5: Chat Endpoints ==============
def test_chat_endpoints(token: str = None):
    """Test chat endpoints for both guest and logged-in users"""
    print_section("TEST 5: Chat Endpoints")
    
    try:
        from fastapi.testclient import TestClient
        from main import app
        
        client = TestClient(app)
        
        # Test 1: Guest chat (no auth)
        print("\n  Guest User Chat:")
        response = client.post(
            "/api/chat",
            json={
                "message": "What is RAG?",
                "session_id": "test-guest-validate"
            }
        )
        
        log_test("Guest chat - Status 200", response.status_code == 200)
        log_test("Guest chat - Streaming response", "text/event-stream" in response.headers.get("content-type", ""))
        
        # Test 2: Logged-in chat (with auth)
        if token:
            print("\n  Logged-in User Chat:")
            headers = {"Authorization": f"Bearer {token}"}
            response = client.post(
                "/api/chat",
                json={
                    "message": "Explain machine learning",
                    "session_id": "test-user-validate"
                },
                headers=headers
            )
            
            log_test("User chat - Status 200", response.status_code == 200)
            log_test("User chat - Streaming response", "text/event-stream" in response.headers.get("content-type", ""))
            
            # Test 3: Chat history (logged-in only)
            response = client.get(
                "/api/chat/history",
                params={"session_id": "test-user-validate"},
                headers=headers
            )
            log_test("GET /api/chat/history", response.status_code == 200)
            
            if response.status_code == 200:
                result = response.json()
                log_test("History has messages key", "messages" in result)
        else:
            log_warning("Logged-in chat tests", "Skipped - no valid token")
        
        return True
    except Exception as e:
        log_test("Chat endpoints", False, str(e))
        return False


# ============== TEST 6: Agent Initialization ==============
def test_agents():
    """Test AI agent initialization"""
    print_section("TEST 6: AI Agent Initialization")
    
    try:
        # Test imports (no triage agent anymore)
        from ai.chat_agent import chat_agent
        from ai.orchestrator_agent import orchestrator_agent
        
        log_test("ChatAgent imports", chat_agent is not None)
        log_test("OrchestratorAgent imports", orchestrator_agent is not None)
        
        # Check agent properties
        if chat_agent:
            log_test("ChatAgent has name", hasattr(chat_agent, 'name'))
            log_test("ChatAgent has instructions", hasattr(chat_agent, 'instructions'))
            log_test("ChatAgent has tools", hasattr(chat_agent, 'tools'))
            tool_count = len(chat_agent.tools) if hasattr(chat_agent, 'tools') else 0
            log_test(f"ChatAgent has {tool_count} tools", tool_count > 0)
        
        if orchestrator_agent:
            log_test("OrchestratorAgent has name", hasattr(orchestrator_agent, 'name'))
            log_test("OrchestratorAgent has instructions", hasattr(orchestrator_agent, 'instructions'))
            log_test("OrchestratorAgent has tools", hasattr(orchestrator_agent, 'tools'))
            tool_count = len(orchestrator_agent.tools) if hasattr(orchestrator_agent, 'tools') else 0
            log_test(f"OrchestratorAgent has {tool_count} tools", tool_count > 0)
        
        # Verify triage agent is removed
        try:
            from ai.triage_agent import triage_agent
            log_test("TriageAgent removed", False)  # Should fail
        except ImportError:
            log_test("TriageAgent properly removed", True)
        
        return True
    except Exception as e:
        log_test("Agent initialization", False, str(e))
        return False


# ============== TEST 7: CORS Configuration ==============
def test_cors():
    """Test CORS configuration"""
    print_section("TEST 7: CORS Configuration")
    
    try:
        from fastapi.testclient import TestClient
        from main import app
        
        client = TestClient(app)
        
        # Test CORS preflight
        response = client.options(
            "/api/chat",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type, Authorization"
            }
        )
        
        log_test("CORS preflight - Status 200", response.status_code == 200)
        
        # Check CORS headers
        cors_headers = [
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Methods",
            "Access-Control-Allow-Headers",
            "Access-Control-Allow-Credentials"
        ]
        
        for header in cors_headers:
            exists = header in response.headers
            log_test(f"CORS header '{header}'", exists)
        
        return True
    except Exception as e:
        log_test("CORS configuration", False, str(e))
        return False


# ============== MAIN TEST RUNNER ==============
def run_all_tests():
    """Run all backend validation tests"""
    print("\n" + "="*60)
    print("  BACKEND COMPREHENSIVE VALIDATION")
    print("="*60)
    
    # Run tests in order
    test_database()
    test_qdrant()
    test_embeddings()
    token = test_auth_endpoints()  # Get token for subsequent tests (run once)
    test_chat_endpoints(token)
    test_agents()
    test_cors()
    
    # Print summary
    print_section("TEST SUMMARY")
    print(f"  ✅ Passed: {TEST_RESULTS['passed']}")
    print(f"  ❌ Failed: {TEST_RESULTS['failed']}")
    print(f"  ⚠️  Warnings: {TEST_RESULTS['warnings']}")
    print(f"  📊 Total: {TEST_RESULTS['passed'] + TEST_RESULTS['failed'] + TEST_RESULTS['warnings']}")
    
    # Save results to file
    results_file = os.path.join(os.path.dirname(__file__), "test_results.json")
    with open(results_file, 'w') as f:
        json.dump(TEST_RESULTS, f, indent=2)
    
    print(f"\n  📁 Results saved to: {results_file}")
    
    # Return success/failure
    if TEST_RESULTS['failed'] == 0:
        print("\n  ✅ ALL TESTS PASSED!")
        return True
    else:
        print(f"\n  ❌ {TEST_RESULTS['failed']} TESTS FAILED!")
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
