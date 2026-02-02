"""
Comprehensive test suite for CRUD operations
Tests all database functions with real data
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models import SessionLocal, Case, Symptom, CaseSymptom, Precaution
import crud
from schemas import CaseCreate, CaseUpdate, SymptomCreate

def test_all():
    db = SessionLocal()
    passed = 0
    failed = 0
    
    def run_test(name, test_fn):
        nonlocal passed, failed
        try:
            test_fn()
            print(f"  PASS: {name}")
            passed += 1
        except Exception as e:
            print(f"  FAIL: {name} - {e}")
            failed += 1
    
    print("\n" + "="*60)
    print("CRUD FUNCTION TESTS")
    print("="*60)
    
    first_case = db.query(Case).first()
    first_case_id = first_case.id if first_case else 1
    first_symptom = db.query(Symptom).first()
    first_symptom_id = first_symptom.id if first_symptom else 1
    
    print("\n[Case Operations]")
    
    def test_get_cases():
        cases = crud.get_cases(db, limit=10)
        assert len(cases) > 0, "No cases found"
        assert len(cases) <= 10, "Limit not working"
    run_test("get_cases with limit", test_get_cases)
    
    def test_get_cases_with_difficulty():
        easy = crud.get_cases(db, difficulty=1)
        medium = crud.get_cases(db, difficulty=2)
        hard = crud.get_cases(db, difficulty=3)
        for c in easy:
            assert c.difficulty == 1, f"Wrong difficulty: {c.difficulty}"
        for c in medium:
            assert c.difficulty == 2, f"Wrong difficulty: {c.difficulty}"
        for c in hard:
            assert c.difficulty == 3, f"Wrong difficulty: {c.difficulty}"
    run_test("get_cases with difficulty filter", test_get_cases_with_difficulty)
    
    def test_get_all_cases():
        cases = crud.get_all_cases(db)
        assert len(cases) == 62, f"Expected 62 cases, got {len(cases)}"
    run_test("get_all_cases (62 total)", test_get_all_cases)
    
    def test_get_case():
        case = crud.get_case(db, first_case_id)
        assert case is not None, f"Case {first_case_id} not found"
        assert case.id == first_case_id
    run_test("get_case by ID", test_get_case)
    
    def test_get_case_not_found():
        case = crud.get_case(db, 99999)
        assert case is None, "Should return None for non-existent case"
    run_test("get_case returns None for invalid ID", test_get_case_not_found)
    
    def test_get_case_by_case_id():
        case = crud.get_case_by_case_id(db, "common_cold")
        assert case is not None, "common_cold case not found"
        assert case.case_id == "common_cold"
    run_test("get_case_by_case_id", test_get_case_by_case_id)
    
    print("\n[Symptom Operations]")
    
    def test_get_symptoms():
        symptoms = crud.get_symptoms(db, limit=50)
        assert len(symptoms) > 0, "No symptoms found"
        assert len(symptoms) <= 50, "Limit not working"
    run_test("get_symptoms with limit", test_get_symptoms)
    
    def test_get_symptoms_by_category():
        pain = crud.get_symptoms(db, category="pain", limit=100)
        for s in pain:
            assert s.category == "pain", f"Wrong category: {s.category}"
    run_test("get_symptoms by category", test_get_symptoms_by_category)
    
    def test_get_all_symptoms():
        symptoms = crud.get_all_symptoms(db)
        assert len(symptoms) > 400, f"Expected 400+ symptoms, got {len(symptoms)}"
    run_test("get_all_symptoms (400+ total)", test_get_all_symptoms)
    
    def test_get_symptom():
        symptom = crud.get_symptom(db, first_symptom_id)
        assert symptom is not None, f"Symptom {first_symptom_id} not found"
    run_test("get_symptom by ID", test_get_symptom)
    
    def test_get_symptom_by_name():
        symptom = crud.get_symptom_by_name(db, "high fever")
        assert symptom is not None, "high fever symptom not found"
    run_test("get_symptom_by_name", test_get_symptom_by_name)
    
    print("\n[Case-Symptom Relationships]")
    
    def test_get_case_symptoms():
        symptoms = crud.get_case_symptoms(db, first_case_id)
        assert len(symptoms) > 0, f"No symptoms for case {first_case_id}"
    run_test("get_case_symptoms", test_get_case_symptoms)
    
    def test_get_case_symptoms_by_type():
        presenting = crud.get_case_symptoms(db, first_case_id, symptom_type="presenting")
        for cs in presenting:
            assert str(cs.symptom_type) == "presenting"
    run_test("get_case_symptoms by type", test_get_case_symptoms_by_type)
    
    print("\n[Precaution Operations]")
    
    def test_get_case_precautions():
        precautions = crud.get_case_precautions(db, first_case_id)
        assert isinstance(precautions, list), "Should return list"
    run_test("get_case_precautions", test_get_case_precautions)
    
    print("\n[Case Detail]")
    
    def test_get_case_detail():
        detail = crud.get_case_detail(db, first_case_id)
        assert detail is not None, f"Case detail for {first_case_id} not found"
        assert "presenting_symptoms" in detail
        assert "absent_symptoms" in detail
        assert "exam_findings" in detail
        assert "precautions" in detail
        assert "diagnosis" in detail
    run_test("get_case_detail structure", test_get_case_detail)
    
    def test_get_case_detail_has_symptoms():
        detail = crud.get_case_detail(db, first_case_id)
        total = len(detail["presenting_symptoms"]) + len(detail["absent_symptoms"]) + len(detail["exam_findings"])
        assert total > 0, "Case should have symptoms"
    run_test("get_case_detail has symptoms", test_get_case_detail_has_symptoms)
    
    def test_get_all_cases_detail():
        details = crud.get_all_cases_detail(db)
        assert len(details) == 62, f"Expected 62 cases, got {len(details)}"
        for d in details:
            assert "diagnosis" in d
            assert "presenting_symptoms" in d
    run_test("get_all_cases_detail", test_get_all_cases_detail)
    
    def test_get_all_cases_detail_difficulty():
        easy = crud.get_all_cases_detail(db, difficulty=1)
        for c in easy:
            assert c["difficulty"] == 1
    run_test("get_all_cases_detail with difficulty", test_get_all_cases_detail_difficulty)
    
    print("\n[Statistics]")
    
    def test_get_stats():
        stats = crud.get_stats(db)
        assert stats["total_cases"] == 62, f"Expected 62 cases, got {stats['total_cases']}"
        assert stats["total_symptoms"] > 400, f"Expected 400+ symptoms"
        assert stats["easy_count"] + stats["medium_count"] + stats["hard_count"] == 62
        assert stats["presenting_count"] > 0
        assert stats["absent_count"] > 0
        assert stats["exam_finding_count"] > 0
    run_test("get_stats counts", test_get_stats)
    
    print("\n[Search Operations]")
    
    def test_search_by_symptom():
        results = crud.search_cases_by_symptom(db, "high fever")
        assert len(results) > 0, "No cases found with high fever"
        for r in results:
            assert "presenting_symptoms" in r
    run_test("search_cases_by_symptom", test_search_by_symptom)
    
    def test_search_by_symptom_not_found():
        results = crud.search_cases_by_symptom(db, "nonexistent_symptom_xyz")
        assert len(results) == 0, "Should return empty list"
    run_test("search_cases_by_symptom (not found)", test_search_by_symptom_not_found)
    
    def test_search_by_diagnosis():
        results = crud.search_cases_by_diagnosis(db, "cold")
        assert len(results) > 0, "No cases found with 'cold' diagnosis"
    run_test("search_cases_by_diagnosis", test_search_by_diagnosis)
    
    def test_search_by_diagnosis_partial():
        results = crud.search_cases_by_diagnosis(db, "infection")
        assert len(results) > 0, "Should find cases with infection"
    run_test("search_cases_by_diagnosis (partial match)", test_search_by_diagnosis_partial)
    
    print("\n[Create/Update/Delete - Using Test Data]")
    
    test_case_id = None
    test_symptom_id = None
    test_case_symptom_id = None
    test_precaution_id = None
    
    def test_create_symptom():
        nonlocal test_symptom_id
        symptom = crud.create_symptom(db, SymptomCreate(
            name="test_symptom_xyz_123",
            category="test",
            severity_weight=5
        ))
        test_symptom_id = symptom.id
        assert symptom.id is not None
        assert symptom.name == "test_symptom_xyz_123"
    run_test("create_symptom", test_create_symptom)
    
    def test_get_or_create_symptom_existing():
        symptom = crud.get_or_create_symptom(db, "test_symptom_xyz_123", "test")
        assert symptom.id == test_symptom_id, "Should return existing symptom"
    run_test("get_or_create_symptom (existing)", test_get_or_create_symptom_existing)
    
    def test_get_or_create_symptom_new():
        symptom = crud.get_or_create_symptom(db, "test_symptom_xyz_456", "test")
        assert symptom.id is not None
        crud.delete_symptom(db, symptom.id)
    run_test("get_or_create_symptom (new)", test_get_or_create_symptom_new)
    
    def test_create_case():
        nonlocal test_case_id
        case = crud.create_case(db, CaseCreate(
            case_id="test_case_xyz",
            diagnosis="Test Diagnosis",
            age="30",
            gender="Male",
            chief_complaint="Test complaint",
            difficulty=2
        ))
        test_case_id = case.id
        assert case.id is not None
        assert case.case_id == "test_case_xyz"
    run_test("create_case", test_create_case)
    
    def test_update_case():
        case = crud.update_case(db, test_case_id, CaseUpdate(
            chief_complaint="Updated complaint",
            severity="moderate"
        ))
        assert case is not None
        assert case.chief_complaint == "Updated complaint"
        assert case.severity == "moderate"
    run_test("update_case", test_update_case)
    
    def test_add_case_symptom():
        nonlocal test_case_symptom_id
        cs = crud.add_case_symptom(db, test_case_id, test_symptom_id, "presenting")
        test_case_symptom_id = cs.id
        assert cs.id is not None
    run_test("add_case_symptom", test_add_case_symptom)
    
    def test_add_precaution():
        nonlocal test_precaution_id
        p = crud.add_precaution(db, test_case_id, "Test precaution")
        test_precaution_id = p.id
        assert p.id is not None
    run_test("add_precaution", test_add_precaution)
    
    def test_case_detail_with_new_data():
        detail = crud.get_case_detail(db, test_case_id)
        assert "test_symptom_xyz_123" in detail["presenting_symptoms"]
        assert "Test precaution" in detail["precautions"]
    run_test("get_case_detail with new data", test_case_detail_with_new_data)
    
    def test_remove_case_symptom():
        result = crud.remove_case_symptom(db, test_case_symptom_id)
        assert result == True
    run_test("remove_case_symptom", test_remove_case_symptom)
    
    def test_remove_precaution():
        result = crud.remove_precaution(db, test_precaution_id)
        assert result == True
    run_test("remove_precaution", test_remove_precaution)
    
    def test_delete_case():
        result = crud.delete_case(db, test_case_id)
        assert result == True
        assert crud.get_case(db, test_case_id) is None
    run_test("delete_case", test_delete_case)
    
    def test_delete_symptom():
        result = crud.delete_symptom(db, test_symptom_id)
        assert result == True
    run_test("delete_symptom", test_delete_symptom)
    
    print("\n[Edge Cases]")
    
    def test_delete_nonexistent_case():
        result = crud.delete_case(db, 99999)
        assert result == False
    run_test("delete_case (not found)", test_delete_nonexistent_case)
    
    def test_delete_nonexistent_symptom():
        result = crud.delete_symptom(db, 99999)
        assert result == False
    run_test("delete_symptom (not found)", test_delete_nonexistent_symptom)
    
    def test_update_nonexistent_case():
        result = crud.update_case(db, 99999, CaseUpdate(severity="high"))
        assert result is None
    run_test("update_case (not found)", test_update_nonexistent_case)
    
    db.close()
    
    print("\n" + "="*60)
    print(f"RESULTS: {passed} passed, {failed} failed")
    print("="*60 + "\n")
    
    return failed == 0


if __name__ == "__main__":
    success = test_all()
    sys.exit(0 if success else 1)
