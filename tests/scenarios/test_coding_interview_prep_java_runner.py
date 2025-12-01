import json
from pathlib import Path

from scenarios.coding_interview_prep.java_runner import JavaCodeGenerator
from scenarios.coding_interview_prep.selector import Problem


def load_problem(problem_id: str) -> Problem:
    problems_dir = Path("scenarios/coding_interview_prep/data/problems")
    with open(problems_dir / f"{problem_id}.json") as fp:
        data = json.load(fp)
    return Problem(**data)


def test_two_sum_input_parsing_handles_commas(tmp_path):
    problem = load_problem("two_sum")
    generator = JavaCodeGenerator(tmp_path)

    parsed = generator._parse_input_to_java(problem.examples[0]["input"], problem)

    assert parsed.startswith("new int[] {")
    assert parsed.endswith(", 9")


def test_two_sum_second_example_parsing(tmp_path):
    problem = load_problem("two_sum")
    generator = JavaCodeGenerator(tmp_path)

    parsed = generator._parse_input_to_java(problem.examples[1]["input"], problem)

    assert parsed.startswith("new int[] {")
    assert parsed.endswith(", 6")
