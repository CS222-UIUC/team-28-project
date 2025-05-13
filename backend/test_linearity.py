#!/usr/bin/env python3
import sys
import os
import json
import numpy as np
from datetime import datetime, timedelta

# Add the parent directory to the path to access modules
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

def test_linearity():
    """Test the linearity of time processing in the NLP system."""
    print("\n=== Linearity Test for Time Processing ===")
    
    # Test cases with different time intervals
    test_cases = [
        {
            "description": "Hourly intervals",
            "base_time": "9:00 AM",
            "intervals": ["10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM"],
            "expected_diffs": [60, 60, 60, 60]  # minutes
        },
        {
            "description": "30-minute intervals",
            "base_time": "9:00 AM",
            "intervals": ["9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM"],
            "expected_diffs": [30, 30, 30, 30]  # minutes
        },
        {
            "description": "15-minute intervals",
            "base_time": "9:00 AM",
            "intervals": ["9:15 AM", "9:30 AM", "9:45 AM", "10:00 AM"],
            "expected_diffs": [15, 15, 15, 15]  # minutes
        }
    ]
    
    def parse_time(time_str):
        """Parse time string into datetime object."""
        try:
            return datetime.strptime(time_str, "%I:%M %p")
        except ValueError:
            return datetime.strptime(time_str, "%I:%M %p").replace(hour=12)
    
    def calculate_time_difference(time1, time2):
        """Calculate time difference in minutes."""
        return int((time2 - time1).total_seconds() / 60)
    
    results = []
    
    for test_case in test_cases:
        print(f"\nTesting {test_case['description']}:")
        print(f"Base time: {test_case['base_time']}")
        
        base_time = parse_time(test_case['base_time'])
        actual_diffs = []
        
        for interval in test_case['intervals']:
            current_time = parse_time(interval)
            diff = calculate_time_difference(base_time, current_time)
            actual_diffs.append(diff)
            base_time = current_time
        
        # Calculate statistics
        mean_diff = np.mean(actual_diffs)
        std_diff = np.std(actual_diffs)
        expected_mean = np.mean(test_case['expected_diffs'])
        
        # Check if the differences are consistent
        is_linear = np.allclose(actual_diffs, test_case['expected_diffs'], rtol=0.1)
        
        result = {
            "description": test_case['description'],
            "actual_differences": actual_diffs,
            "expected_differences": test_case['expected_diffs'],
            "mean_difference": mean_diff,
            "std_difference": std_diff,
            "expected_mean": expected_mean,
            "is_linear": is_linear
        }
        
        results.append(result)
        
        # Print results
        print(f"Actual differences (minutes): {actual_diffs}")
        print(f"Expected differences (minutes): {test_case['expected_diffs']}")
        print(f"Mean difference: {mean_diff:.2f} minutes")
        print(f"Standard deviation: {std_diff:.2f} minutes")
        print(f"Expected mean: {expected_mean:.2f} minutes")
        print(f"Linearity test passed: {'Yes' if is_linear else 'No'}")
    
    return results

def main():
    """Run the linearity tests and display results."""
    print("=== Time Processing Linearity Test ===")
    print("This test verifies that time intervals are processed consistently.")
    
    results = test_linearity()
    
    # Summary
    print("\n=== Test Summary ===")
    for result in results:
        print(f"\n{result['description']}:")
        print(f"Linearity test {'passed' if result['is_linear'] else 'failed'}")
        print(f"Mean difference: {result['mean_difference']:.2f} minutes")
        print(f"Standard deviation: {result['std_difference']:.2f} minutes")
    
    # Save results to file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = f"linearity_test_results_{timestamp}.json"
    
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=4, default=str)
    
    print(f"\nDetailed results saved to: {output_file}")

if __name__ == "__main__":
    main() 